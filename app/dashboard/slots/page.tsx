'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WordPressSite {
  id: string;
  url: string;
  name: string;
}

interface WordPressPage {
  id: number;
  title: string;
  link: string;
}

interface Slot {
  id: string;
  slot_name: string;
  slot_label: string;
  marker_name: string;
  wp_page_title: string;
  is_active: boolean;
  created_at: string;
}

export default function SlotsPage() {
  const router = useRouter();
  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [pages, setPages] = useState<WordPressPage[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    page_id: ''
  });

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadPages();
      loadSlots();
    } else {
      setPages([]);
      setSlots([]);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://safewebedit.com/api/wordpress/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
        if (data.sites?.length > 0) {
          setSelectedSite(data.sites[0].id);
        }
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://safewebedit.com/api/wordpress/sites/${selectedSite}/pages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
    }
  };

  const loadSlots = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://safewebedit.com/api/slots/site/${selectedSite}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Find selected page title
    const selectedPage = pages.find(p => p.id === parseInt(formData.page_id));
    if (!selectedPage) {
      setError('Please select a page');
      return;
    }

    // Count existing slots for this page to generate slot number
    const pageSlotsCount = slots.filter(s => s.wp_page_title === selectedPage.title).length;

    // Auto-generate label: "Page Title - Slot X"
    const autoLabel = `${selectedPage.title} - Slot ${pageSlotsCount + 1}`;

    // Auto-generate slot_name from label
    const slot_name = autoLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    try {
      const response = await fetch('https://safewebedit.com/api/slots/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wordpress_site_id: selectedSite,
          wp_page_id: parseInt(formData.page_id),
          slot_name: slot_name,
          slot_label: autoLabel
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✓ Created! Marker: ${data.slot.marker_name}`);
        setFormData({ page_id: '' });
        loadSlots();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create slot');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create slot');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage(`✓ Copied: ${text}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Delete this slot?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://safewebedit.com/api/slots/${slotId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✓ Deleted');
        loadSlots();
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      setError('Failed to delete');
      setTimeout(() => setError(''), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Content Slots</h1>
          <p style={{ color: '#666', margin: 0 }}>Map Google Sheets to WordPress sections</p>
        </div>
        <Link href="/dashboard" style={{
          padding: '10px 20px',
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          ← Dashboard
        </Link>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '16px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        {sites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>No WordPress sites connected</p>
            <Link href="/dashboard/wordpress" style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Add WordPress Site
            </Link>
          </div>
        ) : (
          <>
            {/* Create Slot - Single Row */}
            <form onSubmit={handleCreateSlot} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 250px auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' }}>
                    Site
                  </label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name || site.url}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' }}>
                    Page
                  </label>
                  <select
                    value={formData.page_id}
                    onChange={(e) => setFormData({ page_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Choose page...</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Create Slot
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginLeft: '0' }}>
                Slot will be auto-named as "Page Name - Slot 1", "Page Name - Slot 2", etc.
              </p>
            </form>

            {/* Slots List */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                Your Slots
              </h3>

              {slots.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#999' }}>No slots yet. Create one above.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                          {slot.slot_label}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {slot.wp_page_title} • <code style={{ fontSize: '12px', color: '#666' }}>{slot.marker_name}</code>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(slot.marker_name)}
                        style={{
                          padding: '6px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        COPY
                      </button>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        style={{
                          padding: '6px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
