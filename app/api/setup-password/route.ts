import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate token from database
    const tokenResult = await pool.query(
      `SELECT prt.organization_id, prt.expires_at, prt.used, o.email, o.name 
       FROM password_reset_tokens prt
       JOIN organizations o ON prt.organization_id = o.id
       WHERE prt.token = $1`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired password setup link' },
        { status: 400 }
      )
    }

    const tokenData = tokenResult.rows[0]

    // Check if token is already used
    if (tokenData.used) {
      return NextResponse.json(
        { error: 'This password setup link has already been used' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This password setup link has expired' },
        { status: 400 }
      )
    }

    // Set password in Keycloak
    const axios = require('axios')
    
    // Get Keycloak admin token
    const tokenResp = await axios.post(
      'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
      new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username: 'admin',
        password: 'admin'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const adminToken = tokenResp.data.access_token

    // Get user by username (email)
    const usersResp = await axios.get(
      `http://localhost:8080/auth/admin/realms/safewebedit/users?username=${encodeURIComponent(tokenData.email)}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )

    if (usersResp.data.length === 0) {
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      )
    }

    const userId = usersResp.data[0].id

    // Set password
    await axios.put(
      `http://localhost:8080/auth/admin/realms/safewebedit/users/${userId}/reset-password`,
      {
        type: 'password',
        value: password,
        temporary: false
      },
      { headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } }
    )

    // Mark token as used
    await pool.query(
      `UPDATE password_reset_tokens 
       SET used = TRUE, used_at = NOW() 
       WHERE token = $1`,
      [token]
    )

    console.log(`[Setup Password] Password set successfully for ${tokenData.email}`)

    return NextResponse.json({
      success: true,
      email: tokenData.email,
      message: 'Password set successfully'
    })

  } catch (error: any) {
    console.error('[Setup Password] Error:', error)
    return NextResponse.json(
      { error: 'Failed to set password. Please try again or contact support.' },
      { status: 500 }
    )
  }
}
