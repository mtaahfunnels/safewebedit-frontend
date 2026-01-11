'use client';

import { useState, useEffect } from 'react';
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

  // Always declare all hooks at the top - never conditionally
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
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
      loadZones();
    }
  }, [selectedSite]);

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

      // Handle both array and object responses
      const sitesArray = Array.isArray(data) ? data : (data.sites || []);

      setSites(sitesArray);
      if (sitesArray.length > 0) {
        setSelectedSite(sitesArray[0].id);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('[Schedule] Error loading sites:', err);
      setError(err.message);
      setSites([]); // Ensure sites is always an array
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
      setZones([]); // Ensure zones is always an array
    }
  };

  const loadQueue = async (zoneId: string) => {
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

      // Build scheduled datetime (date + hour)
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

      // Reload zones and queue
      await loadZones();
      if (selectedZone) {
        await loadQueue(selectedZone.id);
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
        await loadQueue(selectedZone.id);
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
        await loadQueue(selectedZone.id);
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

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Early return AFTER all hooks are declared
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            📅 Content Schedule
          </h1>
          {selectedZone && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              + Schedule Content
            </button>
          )}
        </div>

        {/* Site Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#555' }}>
            Select Website:
          </label>
          <select
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              setSelectedZone(null);
            }}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px'
            }}
          >
            <option value="">-- Select a site --</option>
            {Array.isArray(sites) && sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        {message && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Zones List */}
      {selectedSite && Array.isArray(zones) && zones.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            Zones with Schedules
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {zones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => loadQueue(zone.id)}
                style={{
                  padding: '16px',
                  border: selectedZone?.id === zone.id ? '2px solid #3498db' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedZone?.id === zone.id ? '#f0f8ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {zone.slot_label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {zone.marker_name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: zone.pending_count > 0 ? '#3498db' : '#95a5a6',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {zone.pending_count} pending
                    </div>
                    {zone.next_scheduled && (
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        Next: {formatDateTime(zone.next_scheduled)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Zone Queue */}
      {selectedZone && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            Queue for: {selectedZone.slot_label}
          </h2>

          {/* Current Content */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              NOW LIVE:
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f8ff',
              border: '2px solid #3498db',
              borderRadius: '6px'
            }}>
              <div dangerouslySetInnerHTML={{ __html: selectedZone.current_content?.substring(0, 200) + '...' || 'No content' }} />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Currently displaying
              </div>
            </div>
          </div>

          {/* Upcoming Queue */}
          {selectedZone.scheduled_queue && Array.isArray(selectedZone.scheduled_queue) && selectedZone.scheduled_queue.length > 0 && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                UPCOMING:
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedZone.scheduled_queue.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: item.status === 'failed' ? '#fff5f5' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                          #{index + 1} - {item.content_type === 'text' ? '📝 Text' : '🖼️ Image'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                          Scheduled: {formatDateTime(item.scheduled_at)}
                        </div>
                        {item.content_text && (
                          <div style={{
                            fontSize: '13px',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            marginBottom: '8px'
                          }}>
                            <div dangerouslySetInnerHTML={{ __html: item.content_text.substring(0, 150) + '...' }} />
                          </div>
                        )}
                        {item.content_image_url && (
                          <img
                            src={item.content_image_url}
                            alt="Scheduled image"
                            style={{ maxWidth: '200px', borderRadius: '4px', marginBottom: '8px' }}
                          />
                        )}
                        {item.status === 'failed' && item.error_message && (
                          <div style={{
                            padding: '8px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Error: {item.error_message}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <button
                          onClick={() => handleDeployNow(item.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Deploy now"
                        >
                          Deploy Now
                        </button>
                        <button
                          onClick={() => handleCancelScheduled(item.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!selectedZone.scheduled_queue || selectedZone.scheduled_queue.length === 0) && (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px'
            }}>
              No scheduled content for this zone. Click "Schedule Content" to add items to the queue.
            </div>
          )}
        </div>
      )}

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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Schedule Content for: {selectedZone.slot_label}
            </h2>

            <form onSubmit={handleScheduleContent}>
              {/* Content Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
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
                    <span style={{ fontSize: '14px' }}>📝 Text</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="image"
                      checked={contentType === 'image'}
                      onChange={(e) => setContentType(e.target.value as 'image')}
                    />
                    <span style={{ fontSize: '14px' }}>🖼️ Image</span>
                  </label>
                </div>
              </div>

              {/* Content Text */}
              {contentType === 'text' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
                    Content (HTML allowed):
                  </label>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    required
                    rows={6}
                    placeholder="<h2>New Year Special!</h2><p>Save 50% this month only.</p>"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              )}

              {/* Image URL */}
              {contentType === 'image' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
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
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              )}

              {/* Scheduled Date */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
                  Scheduled Date:
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
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
              </div>

              {/* Scheduled Hour */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
                  Scheduled Hour (precision: hour only):
                </label>
                <select
                  value={scheduledHour}
                  onChange={(e) => setScheduledHour(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString()}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: saving ? '#95a5a6' : '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {saving ? 'Scheduling...' : 'Schedule Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedSite && Array.isArray(zones) && zones.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '16px' }}>
            No zones found for this site. Create zones in the Visual Editor first.
          </div>
        </div>
      )}
    </div>
  );
}
