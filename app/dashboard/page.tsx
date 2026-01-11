'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sites: 0,
    zones: 0,
    scheduled: 0
  });

  useEffect(() => {
    // Handle token from magic link redirect
    const urlToken = searchParams?.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      router.replace('/dashboard');
    }

    loadStats();
  }, []);

  const loadStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Load WordPress sites count
      const sitesResponse = await fetch('https://safewebedit.com/api/wordpress/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        const sitesArray = Array.isArray(sitesData) ? sitesData : (sitesData.sites || []);
        setStats(prev => ({ ...prev, sites: sitesArray.length }));
      }

      // Load content zones count (from first site if available)
      const slotsResponse = await fetch('https://safewebedit.com/api/slots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();
        setStats(prev => ({ ...prev, zones: slotsData.total || 0 }));
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
            border: '4px solid #3498db',
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
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
          Welcome to SafeWebEdit
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          Edit your WordPress sites visually, generate AI images, and schedule content automatically
        </p>
      </div>

      {/* Stats Cards */}
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
            Content Zones
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.zones}
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
            Scheduled Content
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e67e22' }}>
            {stats.scheduled}
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '24px',
        border: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
          🚀 Quick Start Guide
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
          <li style={{ marginBottom: '12px' }}>
            <strong>Add WordPress Site:</strong> Go to{' '}
            <Link href="/dashboard/wordpress" style={{ color: '#3498db', textDecoration: 'underline' }}>
              🌐 Websites
            </Link>
            {' '}and connect your WordPress site with REST API credentials
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Create Content Zones:</strong> Use{' '}
            <Link href="/dashboard/visual" style={{ color: '#3498db', textDecoration: 'underline' }}>
              🎨 Visual Editor
            </Link>
            {' '}to click on any text or image and create editable zones
          </li>
          <li style={{ marginBottom: '12px' }}>
            <strong>Edit Content Live:</strong> Click zones to edit text or swap images with AI-generated alternatives
          </li>
          <li>
            <strong>Schedule Updates:</strong> Use{' '}
            <Link href="/dashboard/schedule" style={{ color: '#3498db', textDecoration: 'underline' }}>
              📅 Content Schedule
            </Link>
            {' '}to automate content changes at specific dates and times
          </li>
        </ol>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Visual Editor */}
        <Link href="/dashboard/visual" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '24px',
            border: '1px solid #e0e0e0',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              Visual Editor
            </h4>
            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
              Point-and-click editing for your WordPress site. Edit text, swap images with AI, and see changes live.
            </p>
          </div>
        </Link>

        {/* Content Schedule */}
        <Link href="/dashboard/schedule" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '24px',
            border: '1px solid #e0e0e0',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              Content Schedule
            </h4>
            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
              Schedule text and image updates to deploy automatically. Queue content and let it go live on schedule.
            </p>
          </div>
        </Link>

        {/* AI Images */}
        <Link href="/dashboard/credits" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '24px',
            border: '1px solid #e0e0e0',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              AI Image Generation
            </h4>
            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
              Generate stunning images with AI (FLUX Pro). Swap any image on your site with custom AI creations.
            </p>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
