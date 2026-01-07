import { Pool } from 'pg'

// PostgreSQL connection pool for SafeWebEdit
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://safewebedits_user:SafeWeb2026!Edits@localhost:5432/safewebedits_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ SafeWebEdit Frontend: Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})

export default pool

// Type definitions matching our database schema
export type Organization = {
  id: string
  name: string
  email: string
  slug: string
  website_url: string | null
  organization_type: string | null
  content_tone: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  keycloak_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PasswordSetupToken = {
  id: string
  organization_id: string
  token: string
  expires_at: string
  used: boolean
  used_at: string | null
  created_at: string
}
