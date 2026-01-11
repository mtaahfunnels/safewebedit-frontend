'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Site {
  id: string;
  name: string;
  url: string;
}

interface ScheduledItem {
  id: string;
  content_type: 'text' | 'image';
  content_text?: string;
  content_image_url?: string;
  scheduled_at: string;
  queue_position: number;
  status: 'pending' | 'deployed' | 'failed';
  deployed_at?: string;
  error_message?: string;
}

interface Zone {
  id: string;
  marker_name: string;
  slot_label: string;
  current_content: string;
  pending_count: number;
  next_scheduled?: string;
  scheduled_queue?: ScheduledItem[];
}

export default function SchedulePage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [contentType, setContentType] = useState<'text' | 'image'>('text');
  const [contentText, setContentText] = useState('');
  const [contentImageUrl, setContentImageUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledHour, setScheduledHour] = useState('12');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      const site = sites.find(s => s.id === selectedSite);
      if (site) {
        setCurrentUrl(site.url);
        loadZones();
      }
    }
  }, [selectedSite, sites]);

  // Listen for zone clicks from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ZONE_CLICKED') {
        const clickedMarker = event.data.marker;
        const zone = zones.find(z => z.marker_name === clickedMarker);
        if (zone) {
          handleZoneClick(zone.id);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [zones]);

  const loadSites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
      const response = await fetch(`${apiUrl}/api/wordpress/sites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load sites');

      const data = await response.json();
      const sitesArray = Array.isArray(data) ? data : (data.sites || []);

      setSites(sitesArray);
      if (sitesArray.length > 0) {
        setSelectedSite(sitesArray[0].id);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('[Schedule] Error loading sites:', err);
      setError(err.message);
      setSites([]);
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

      const response = await fetch(`${apiUrl}/api/schedule/zones/${selectedSite}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load zones');

      const data = await response.json();
      setZones(data.zones || []);
    } catch (err: any) {
      console.error('[Schedule] Error loading zones:', err);
      setError(err.message);
      setZones([]);
    }
  };

  const handleZoneClick = async (zoneId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

      const response = await fetch(`${apiUrl}/api/schedule/queue/${zoneId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load queue');

      const data = await response.json();
      setSelectedZone(data.zone);
    } catch (err: any) {
      console.error('[Schedule] Error loading queue:', err);
      setError(err.message);
    }
  };

  const handleScheduleContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!selectedZone) {
        throw new Error('Please select a zone');
      }

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

      const scheduledAt = `${scheduledDate}T${scheduledHour.padStart(2, '0')}:00:00`;

      const payload = {
        content_slot_id: selectedZone.id,
        content_type: contentType,
        content_text: contentType === 'text' ? contentText : undefined,
        content_image_url: contentType === 'image' ? contentImageUrl : undefined,
        scheduled_at: scheduledAt
      };

      const response = await fetch(`${apiUrl}/api/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule content');
      }

      setMessage('Content scheduled successfully!');
      setShowForm(false);
      setContentText('');
      setContentImageUrl('');
      setScheduledDate('');
      setScheduledHour('12');

      await loadZones();
      if (selectedZone) {
        await handleZoneClick(selectedZone.id);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('[Schedule] Error scheduling content:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelScheduled = async (itemId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled content?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

      const response = await fetch(`${apiUrl}/api/schedule/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to cancel scheduled content');

      setMessage('Scheduled content cancelled');
      await loadZones();
      if (selectedZone) {
        await handleZoneClick(selectedZone.id);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('[Schedule] Error cancelling:', err);
      setError(err.message);
    }
  };

  const handleDeployNow = async (itemId: string) => {
    if (!confirm('Deploy this content immediately?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

      const response = await fetch(`${apiUrl}/api/schedule/${itemId}/deploy-now`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to deploy content');

      setMessage('Content deployed successfully!');
      await loadZones();
      if (selectedZone) {
        await handleZoneClick(selectedZone.id);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('[Schedule] Error deploying:', err);
      setError(err.message);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', backgroundColor: '#f5f5f5' }}>
      {/* Left Side - Live Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRight: '1px solid #ddd' }}>
        {/* Top Bar */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#2c3e50',
          color: 'white'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>
              📅 Content Schedule - Visual Mode
            </h2>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
              Click any zone on the preview to view its schedule timeline
            </p>
          </div>

          <select
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              setSelectedZone(null);
            }}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white'
            }}
          >
            <option value="">-- Select a site --</option>
            {Array.isArray(sites) && sites.map((site) => (
              <option key={site.id} value={site.id} style={{ color: '#333' }}>
                {site.name}
              </option>
            ))}
          </select>

          {/* Messages */}
          {message && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              backgroundColor: 'rgba(46, 204, 113, 0.2)',
              color: '#d4edda',
              borderRadius: '4px',
              fontSize: '13px',
              border: '1px solid rgba(46, 204, 113, 0.3)'
            }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              color: '#f8d7da',
              borderRadius: '4px',
              fontSize: '13px',
              border: '1px solid rgba(231, 76, 60, 0.3)'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Live Preview */}
        {currentUrl && (
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              ref={iframeRef}
              src={`https://safewebedit.com/api/visual-proxy?url=${encodeURIComponent(currentUrl)}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Live Preview"
            />
          </div>
        )}

        {!currentUrl && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            Select a site to view preview
          </div>
        )}
      </div>

      {/* Right Panel - Schedule Timeline */}
      <div style={{
        width: '420px',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
      }}>
        {selectedZone ? (
          <>
            {/* Zone Header */}
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #3498db',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                {selectedZone.slot_label}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {selectedZone.marker_name}
              </div>
              <div style={{
                marginTop: '12px',
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: selectedZone.pending_count > 0 ? '#3498db' : '#95a5a6',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {selectedZone.pending_count} scheduled
              </div>
            </div>

            {/* Schedule Button */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                + Schedule New Content
              </button>
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {/* Current Live Content */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ⭐ Now Live
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#e8f5e9',
                  border: '2px solid #4caf50',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '13px', color: '#2e7d32', marginBottom: '8px' }}>
                    <div dangerouslySetInnerHTML={{
                      __html: selectedZone.current_content?.substring(0, 150) + '...' || 'No content'
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>
                    Currently displaying
                  </div>
                </div>
              </div>

              {/* Upcoming Timeline */}
              {selectedZone.scheduled_queue && Array.isArray(selectedZone.scheduled_queue) && selectedZone.scheduled_queue.length > 0 ? (
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📅 Upcoming Schedule
                  </div>

                  {/* Timeline Items */}
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    {/* Timeline Line */}
                    <div style={{
                      position: 'absolute',
                      left: '9px',
                      top: '0',
                      bottom: '0',
                      width: '2px',
                      backgroundColor: '#e0e0e0'
                    }} />

                    {selectedZone.scheduled_queue.map((item, index) => (
                      <div key={item.id} style={{ position: 'relative', marginBottom: '20px' }}>
                        {/* Timeline Dot */}
                        <div style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '8px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: item.status === 'failed' ? '#e74c3c' : '#3498db',
                          border: '2px solid white',
                          boxShadow: '0 0 0 2px #e0e0e0'
                        }} />

                        {/* Content Card */}
                        <div style={{
                          padding: '12px',
                          backgroundColor: item.status === 'failed' ? '#fff5f5' : '#f8f9fa',
                          border: `1px solid ${item.status === 'failed' ? '#f8d7da' : '#e0e0e0'}`,
                          borderRadius: '6px'
                        }}>
                          {/* Time */}
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#3498db',
                            marginBottom: '8px'
                          }}>
                            {formatDateTime(item.scheduled_at)}
                          </div>

                          {/* Content Type */}
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '8px',
                            fontWeight: '600'
                          }}>
                            {item.content_type === 'text' ? '📝 Text Content' : '🖼️ Image Content'}
                          </div>

                          {/* Content Preview */}
                          {item.content_text && (
                            <div style={{
                              fontSize: '12px',
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              marginBottom: '8px',
                              maxHeight: '80px',
                              overflow: 'hidden'
                            }}>
                              <div dangerouslySetInnerHTML={{ __html: item.content_text.substring(0, 100) + '...' }} />
                            </div>
                          )}

                          {item.content_image_url && (
                            <img
                              src={item.content_image_url}
                              alt="Scheduled image"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '120px',
                                borderRadius: '4px',
                                marginBottom: '8px'
                              }}
                            />
                          )}

                          {/* Error */}
                          {item.status === 'failed' && item.error_message && (
                            <div style={{
                              padding: '6px 8px',
                              backgroundColor: '#f8d7da',
                              color: '#721c24',
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginBottom: '8px'
                            }}>
                              ⚠️ {item.error_message}
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                            <button
                              onClick={() => handleDeployNow(item.id)}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Deploy Now
                            </button>
                            <button
                              onClick={() => handleCancelScheduled(item.id)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '13px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  No scheduled content yet
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Click on any content zone in the preview to view and manage its schedule timeline
            </div>
          </div>
        )}
      </div>

      {/* Schedule Form Modal */}
      {showForm && selectedZone && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Schedule Content: {selectedZone.slot_label}
            </h2>

            <form onSubmit={handleScheduleContent}>
              {/* Content Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                  Content Type:
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="text"
                      checked={contentType === 'text'}
                      onChange={(e) => setContentType(e.target.value as 'text')}
                    />
                    <span style={{ fontSize: '13px' }}>📝 Text</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="image"
                      checked={contentType === 'image'}
                      onChange={(e) => setContentType(e.target.value as 'image')}
                    />
                    <span style={{ fontSize: '13px' }}>🖼️ Image</span>
                  </label>
                </div>
              </div>

              {/* Content */}
              {contentType === 'text' ? (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                    Content (HTML allowed):
                  </label>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    required
                    rows={5}
                    placeholder="<h2>New Year Special!</h2><p>Save 50%</p>"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                    Image URL:
                  </label>
                  <input
                    type="url"
                    value={contentImageUrl}
                    onChange={(e) => setContentImageUrl(e.target.value)}
                    required
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              )}

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                    Date:
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={getMinDate()}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                    Hour:
                  </label>
                  <select
                    value={scheduledHour}
                    onChange={(e) => setScheduledHour(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '13px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString()}>
                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setContentText('');
                    setContentImageUrl('');
                    setScheduledDate('');
                    setScheduledHour('12');
                  }}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: saving ? '#95a5a6' : '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  {saving ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
