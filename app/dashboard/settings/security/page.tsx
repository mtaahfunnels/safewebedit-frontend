'use client';

import { useState, useEffect } from 'react';

export default function SecuritySettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/mfa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMfaEnabled(data.enabled);
        setBackupCodesRemaining(data.backupCodesRemaining || 0);
      }
    } catch (err) {
      console.error('[MFA] Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/mfa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to setup MFA');
        setLoading(false);
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setShowSetup(true);
      setLoading(false);

    } catch (err) {
      console.error('[MFA] Setup error:', err);
      setError('Failed to setup MFA. Please try again.');
      setLoading(false);
    }
  };

  const handleEnableMFA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verifyCode || verifyCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/mfa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verifyCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid code');
        setLoading(false);
        return;
      }

      setSuccess('MFA enabled successfully!');
      setMfaEnabled(true);
      setShowSetup(false);
      setVerifyCode('');
      setLoading(false);

    } catch (err) {
      console.error('[MFA] Enable error:', err);
      setError('Failed to enable MFA. Please try again.');
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    const confirmCode = window.prompt('Enter your current TOTP code to disable MFA:');

    if (!confirmCode) return;

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/mfa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: confirmCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to disable MFA');
        setLoading(false);
        return;
      }

      setSuccess('MFA disabled successfully');
      setMfaEnabled(false);
      setLoading(false);

    } catch (err) {
      console.error('[MFA] Disable error:', err);
      setError('Failed to disable MFA. Please try again.');
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `SafeWebEdit MFA Backup Codes\n\nGenerated: ${new Date().toISOString()}\n\nSave these codes in a secure place. Each code can only be used once.\n\n${backupCodes.join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safewebedit-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !showSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* MFA Status Card */}
      {!showSetup && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Two-Factor Authentication (TOTP)
              </h2>
              <p className="text-gray-600">
                {mfaEnabled
                  ? 'MFA is currently enabled. Your account is protected with an authenticator app.'
                  : 'Add an extra layer of security with time-based one-time passwords.'}
              </p>
              {mfaEnabled && (
                <p className="text-sm text-gray-500 mt-2">
                  Backup codes remaining: {backupCodesRemaining}
                </p>
              )}
            </div>
            <div className="ml-4">
              {mfaEnabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Disabled
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            {!mfaEnabled ? (
              <button
                onClick={handleSetupMFA}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Enable MFA'}
              </button>
            ) : (
              <button
                onClick={handleDisableMFA}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Disable MFA'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MFA Setup Flow */}
      {showSetup && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enable Two-Factor Authentication</h2>

          <div className="space-y-6">
            {/* Step 1: Scan QR Code */}
            <div>
              <h3 className="font-medium mb-2">Step 1: Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Open your authenticator app (Google Authenticator, Authy, 1Password, etc.) and scan this QR code:
              </p>
              {qrCode && (
                <div className="bg-white p-4 inline-block rounded-lg border">
                  <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
              </p>
            </div>

            {/* Step 2: Save Backup Codes */}
            <div>
              <h3 className="font-medium mb-2">Step 2: Save Backup Codes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Save these backup codes in a secure place. You can use them if you lose access to your authenticator app.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="mb-1">{code}</div>
                ))}
              </div>
              <button
                onClick={downloadBackupCodes}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Download backup codes
              </button>
            </div>

            {/* Step 3: Verify */}
            <form onSubmit={handleEnableMFA}>
              <h3 className="font-medium mb-2">Step 3: Verify</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app to complete setup:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-xl tracking-widest"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || verifyCode.length !== 6}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>

            <button
              onClick={() => setShowSetup(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
