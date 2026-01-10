'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default function OnboardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

      // Create account (without password)
      const signupResponse = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      const signupData = await signupResponse.json();

      if (signupResponse.ok) {
        // Account created, now send magic link
        const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (loginResponse.ok) {
          setSent(true);
        } else {
          setError('Account created but failed to send login link. Please go to login page.');
        }
      } else {
        setError(signupData.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('[ONBOARD] Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (sent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '16px'
            }}>
              ✉️
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#2c3e50',
              margin: '0 0 8px'
            }}>
              Check your email
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{
              margin: '0 0 12px',
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: '#2c3e50' }}>✅ Account created successfully!</strong>
            </p>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              Click the button in the email to login and complete setup. You'll get 10 free credits to get started.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              Didn't receive the email?
            </p>
            <button
              onClick={() => {
                setSent(false);
                setError('');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>

          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Signup form
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#007bff',
            margin: '0 0 8px'
          }}>
            SafeWebEdit
          </h1>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            Start your 14-day free trial
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            color: '#c33',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              Business Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Business Name"
              required
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name || !email}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !name || !email ? 'not-allowed' : 'pointer',
              opacity: loading || !name || !email ? 0.5 : 1,
              marginBottom: '20px'
            }}
          >
            {loading ? 'Creating account...' : 'Get Started - No Password Needed'}
          </button>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            ✨ <strong>Passwordless signup!</strong> We'll send you a magic link to login. No password to remember.
          </div>
        </form>

        {/* Login Link */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
