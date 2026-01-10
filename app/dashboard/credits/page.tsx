'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreditsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [autoTopupEnabled, setAutoTopupEnabled] = useState(false);
  const [autoTopupAmount, setAutoTopupAmount] = useState(20);
  const [autoTopupThreshold, setAutoTopupThreshold] = useState(10);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');

      if (!token || !user_id) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';
      const response = await fetch(`${apiUrl}/api/credits/balance?user_id=${user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('[CREDITS] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (amount: number) => {
    setPurchasing(amount.toString());

    try {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');

      if (!token || !user_id) {
        router.push('/login');
        return;
      }

      const credits = amount * 5; // $1 = 5 credits (simple conversion)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

      const response = await fetch(`${apiUrl}/api/credits/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          package_id: `custom-${amount}`,
          user_id: user_id,
          return_url: `${window.location.origin}/dashboard/credits`
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url;
      } else {
        alert('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('[CREDITS] Purchase error:', error);
      alert('Failed to start purchase. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (amount >= 5 && amount <= 1000) {
      handlePurchase(amount);
    } else {
      alert('Please enter an amount between $5 and $1000');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💳</div>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Current Balance */}
      <div style={{
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Current balance
        </div>
        <div style={{
          fontSize: '64px',
          fontWeight: 'bold',
          color: balance < 10 ? '#e74c3c' : '#2c3e50',
          marginBottom: '8px'
        }}>
          ${(balance / 5).toFixed(2)}
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          {balance} credits • Balance updates may take up to one hour
        </div>
      </div>

      {/* Quick Buy Options */}
      <div style={{
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#2c3e50' }}>
          Add Credits
        </h2>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          {[10, 20, 50].map(amount => (
            <button
              key={amount}
              onClick={() => handlePurchase(amount)}
              disabled={purchasing === amount.toString()}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: purchasing === amount.toString() ? 'wait' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: purchasing === amount.toString() ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (purchasing !== amount.toString()) {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '4px' }}>
                    ${amount}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Approx. {amount * 5} text edits or {Math.floor(amount * 2.5)} image swaps
                  </div>
                </div>
                {purchasing === amount.toString() ? (
                  <div style={{ color: '#007bff' }}>Processing...</div>
                ) : (
                  <div style={{ fontSize: '24px', color: '#007bff' }}>→</div>
                )}
              </div>
            </button>
          ))}

          {/* Custom Amount */}
          <div style={{
            padding: '20px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#2c3e50' }}>
              Custom
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
              Buy any amount of credits ($5 - $1000)
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                min="5"
                max="1000"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              <button
                onClick={handleCustomPurchase}
                disabled={!customAmount || purchasing === 'custom'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: purchasing === 'custom' ? 'wait' : 'pointer',
                  opacity: !customAmount || purchasing === 'custom' ? 0.5 : 1
                }}
              >
                {purchasing === 'custom' ? 'Processing...' : 'Buy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Guide */}
      <div style={{
        padding: '24px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#2c3e50' }}>
          How Credits Work
        </h3>
        <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: '#666' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Text edit via AI Command</span>
            <strong style={{ color: '#2c3e50' }}>1 credit</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Image upload/swap</span>
            <strong style={{ color: '#2c3e50' }}>2 credits</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>AI image generation</span>
            <strong style={{ color: '#2c3e50' }}>10 credits</strong>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '13px', color: '#999' }}>
              💡 Credits never expire. Use them whenever you need.
            </div>
          </div>
        </div>
      </div>

      {/* Auto Top-up (Future Feature) */}
      <div style={{
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        opacity: 0.6
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#2c3e50' }}>
          Automated Top-ups
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Coming soon: Automatically trigger a top-up when your balance reaches a certain threshold.
        </p>
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>
              Automatically purchase:
            </label>
            <input
              type="number"
              value={autoTopupAmount}
              disabled
              style={{
                width: '100px',
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <span style={{ marginLeft: '8px', color: '#666' }}>USD</span>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>
              When credit balance reaches:
            </label>
            <input
              type="number"
              value={autoTopupThreshold}
              disabled
              style={{
                width: '100px',
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <span style={{ marginLeft: '8px', color: '#666' }}>USD</span>
          </div>
          <button
            disabled
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'not-allowed'
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
