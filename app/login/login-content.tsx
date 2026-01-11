'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle errors from URL params (magic link failures)
  useEffect(() => {
    const errorCode = searchParams?.get('error');
    if (errorCode) {
      switch (errorCode) {
        case 'invalid_token':
          setError('Login link expired or already used. Please request a new one.');
          break;
        case 'missing_token':
          setError('Invalid login link. Please request a new one.');
          break;
        case 'user_not_found':
          setError('Account not found. Please sign up first.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    }
  }, [searchParams]);

  // Handle magic link send
  const handleSendLink = async () => {
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Failed to send login link');
      }
    } catch (err) {
      console.error('[LOGIN] Send link error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle code verification
  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      console.error('[LOGIN] Verify code error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email sent screen
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
          {/* Success Icon */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 16px'
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

          {/* Instructions */}
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
              <strong style={{ color: '#2c3e50' }}>Option 1:</strong> Click the button in the email to login instantly (recommended)
            </p>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: '#2c3e50' }}>Option 2:</strong> Use the 6-digit code from the email below
            </p>
          </div>

          {/* Divider */}
          <hr style={{
            border: 'none',
            borderTop: '1px solid #e0e0e0',
            margin: '24px 0'
          }} />

          {/* Code Input Section */}
          {!showCodeInput ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px'
              }}>
                Can't access the email link?
              </p>
              <button
                onClick={() => setShowCodeInput(true)}
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
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Enter Code Instead
              </button>
            </div>
          ) : (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '8px'
              }}>
                Enter your 6-digit code:
              </label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC-123"
                  maxLength={7}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || code.length < 6}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
                    opacity: loading || code.length < 6 ? 0.5 : 1
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '6px',
                  color: '#c33',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Resend */}
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <button
              onClick={() => {
                setSent(false);
                setShowCodeInput(false);
                setCode('');
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Request new login link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login form
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
            Secure, passwordless login
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

        {/* Login Form */}
        <div>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendLink()}
            placeholder="you@company.com"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              marginBottom: '20px',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
          />

          <button
            onClick={handleSendLink}
            disabled={loading || !email}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              opacity: loading || !email ? 0.5 : 1,
              marginBottom: '20px'
            }}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            We'll email you a magic link for a passwordless sign in. Or you can use a temporary code if you prefer.
          </div>
        </div>

        {/* Sign Up Link */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          Don't have an account?{' '}
          <Link href="/onboard" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
