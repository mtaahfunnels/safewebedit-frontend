'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sites: 0,
    slots: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const sitesResponse = await fetch('https://safewebedit.com/api/wordpress/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        setStats(prev => ({ ...prev, sites: sitesData.total || 0 }));
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #007bff',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
          Welcome to SafeWebEdit
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          Manage your website content with Google Sheets
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '24px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
            WordPress Sites
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3498db' }}>
            {stats.sites}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '24px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
            Content Slots
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.slots}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '24px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
          🚀 Quick Start
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Connect WordPress:</strong> Go to WordPress Sites and add your site
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Create Slots:</strong> Map content sections to Google Sheets
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Configure Sheets:</strong> Connect your Google Sheets in Settings
          </li>
          <li>
            <strong>Auto-Sync:</strong> Enable sync to keep content updated automatically
          </li>
        </ol>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
