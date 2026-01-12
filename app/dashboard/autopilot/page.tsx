'use client';

import { useState, useEffect } from 'react';

interface QueueItem {
  id: string;
  content_slot_id: string;
  slot_name: string;
  slot_label: string;
  content_type: 'text' | 'image';
  content_text?: string;
  content_image_url?: string;
  content_image_prompt?: string;
  scheduled_at: string;
  confidence_score: number;
  generation_reasoning: string;
  pattern_name?: string;
  pattern_type?: string;
  based_on_pattern: boolean;
  status: string;
}

interface Site {
  id: string;
  site_url: string;
  site_name?: string;
}

export default function AutopilotReviewPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

  // Load user's sites on mount
  useEffect(() => {
    loadSites();
  }, []);

  // Load queue when site is selected
  useEffect(() => {
    if (selectedSite) {
      loadQueue();
    }
  }, [selectedSite]);

  const loadSites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/wordpress/sites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
        if (data.sites && data.sites.length > 0) {
          setSelectedSite(data.sites[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading sites:', err);
    }
  };

  const loadQueue = async () => {
    if (!selectedSite) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiUrl}/api/autopilot/queue/${selectedSite}?status=pending_review`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue || []);
      } else {
        setError('Failed to load queue');
      }
    } catch (err) {
      setError('Network error loading queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/autopilot/approve/${scheduleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccessMessage('Content approved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadQueue(); // Reload queue
      } else {
        setError('Failed to approve content');
      }
    } catch (err) {
      setError('Network error approving content');
    }
  };

  const handleReject = async (scheduleId: string) => {
    const reason = prompt('Why are you rejecting this content? (optional)');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/autopilot/reject/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'User rejected' })
      });

      if (response.ok) {
        setSuccessMessage('Content rejected');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadQueue(); // Reload queue
      } else {
        setError('Failed to reject content');
      }
    } catch (err) {
      setError('Network error rejecting content');
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this content from the queue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/autopilot/queue/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccessMessage('Content deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadQueue();
      } else {
        setError('Failed to delete content');
      }
    } catch (err) {
      setError('Network error deleting content');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return '#10b981'; // green
    if (score >= 0.75) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
        Autopilot Review Dashboard
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        Review and approve AI-generated content before it goes live
      </p>

      {/* Site Selector */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
          Select Site:
        </label>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">-- Select a site --</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>
              {site.site_name || site.site_url}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#166534'
        }}>
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading queue...
        </div>
      )}

      {/* Empty State */}
      {!loading && selectedSite && queue.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            All caught up!
          </h3>
          <p style={{ color: '#6b7280' }}>
            No content pending review for this site.
          </p>
        </div>
      )}

      {/* Queue Items */}
      {!loading && queue.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {queue.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    {item.slot_label || item.slot_name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                    <span>📅 {formatDate(item.scheduled_at)}</span>
                    <span>
                      <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getConfidenceColor(item.confidence_score),
                        marginRight: '6px'
                      }}></span>
                      {Math.round(item.confidence_score * 100)}% confidence
                    </span>
                    {item.based_on_pattern && item.pattern_name && (
                      <span>🔁 Pattern: {item.pattern_name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                {item.content_type === 'text' && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Text Content
                    </div>
                    <p style={{ color: '#1f2937', lineHeight: '1.6', margin: 0 }}>
                      {item.content_text}
                    </p>
                  </div>
                )}

                {item.content_type === 'image' && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Image Content
                    </div>
                    {item.content_image_url && (
                      <img
                        src={item.content_image_url}
                        alt="Generated content"
                        style={{ maxWidth: '300px', borderRadius: '4px', marginBottom: '8px' }}
                      />
                    )}
                    {item.content_image_prompt && (
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        Prompt: {item.content_image_prompt}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              {item.generation_reasoning && (
                <div style={{
                  borderLeft: '3px solid #3b82f6',
                  paddingLeft: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', marginBottom: '4px' }}>
                    AI REASONING
                  </div>
                  <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>
                    {item.generation_reasoning}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  ✓ Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && queue.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          {queue.length} item{queue.length !== 1 ? 's' : ''} pending review
        </div>
      )}
    </div>
  );
}
