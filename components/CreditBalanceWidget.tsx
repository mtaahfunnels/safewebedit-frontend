'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CreditBalance {
  balance: number;
  recent_transactions?: Array<{
    amount: number;
    reason: string;
    created_at: string;
  }>;
}

export default function CreditBalanceWidget({ collapsed = false }: { collapsed?: boolean }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get user_id from token (you might need to decode JWT)
      // For now, assuming user_id is stored separately or in localStorage
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        console.log('[CREDITS] No user_id found, skipping balance fetch');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004'}/api/credits/balance?user_id=${user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data: { balance: number } = await response.json();
        setBalance(data.balance);
        setError(null);
      } else if (response.status === 404) {
        // User doesn't exist in credits table yet, will be created on first use
        setBalance(10); // Free credits
      } else {
        throw new Error('Failed to fetch balance');
      }
    } catch (err) {
      console.error('[CREDITS] Balance fetch error:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (collapsed) {
    return (
      <Link href="/dashboard/credits" style={{ textDecoration: 'none' }}>
        <div
          style={{
            padding: '12px',
            margin: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          title={balance !== null ? `${balance} credits` : 'Credits'}
        >
          <div style={{ fontSize: '20px' }}>💳</div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/dashboard/credits" style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '16px',
          margin: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#ecf0f1'
          }}>
            Credits
          </span>
          <span style={{ fontSize: '18px' }}>💳</span>
        </div>

        {loading ? (
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#95a5a6' }}>
            ...
          </div>
        ) : error ? (
          <div style={{ fontSize: '14px', color: '#e74c3c' }}>
            {error}
          </div>
        ) : (
          <>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: balance && balance < 10 ? '#e74c3c' : '#2ecc71',
              marginBottom: '4px'
            }}>
              {balance !== null ? balance : '--'}
            </div>
            <div style={{
              fontSize: '11px',
              opacity: 0.7,
              color: '#ecf0f1'
            }}>
              {balance && balance < 10
                ? '⚠️ Running low - buy more'
                : 'Click to buy more'}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
