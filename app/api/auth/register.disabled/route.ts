import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, organization_type } = body

    // Get admin token
    const tokenResponse = await fetch(
      'https://safewebedit.com/safewebedit-auth/realms/master/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'admin-cli',
          username: 'admin',
          password: 'SafeWebEditAdmin2026!',
          grant_type: 'password',
        }),
      }
    )

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Registration service unavailable' }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    // Create user in Keycloak
    const createUserResponse = await fetch(
      'https://safewebedit.com/safewebedit-auth/admin/realms/safewebedit/users',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          email: email,
          emailVerified: true,
          enabled: true,
          firstName: name,
          credentials: [
            {
              type: 'password',
              value: password,
              temporary: false,
            },
          ],
          attributes: {
            organization_name: [name],
            organization_type: [organization_type],
          },
        }),
      }
    )

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text()
      if (createUserResponse.status === 409) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      console.error('Keycloak error:', errorText)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
