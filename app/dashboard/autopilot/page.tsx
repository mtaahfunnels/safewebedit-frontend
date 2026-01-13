'use client';

import { useState, useEffect, useRef } from 'react';

interface AutopilotItem {
  id: string;
  content_slot_id: string;
  slot_name: string;
  slot_label: string;
  content_type: 'text' | 'image';
  content_text?: string;
  content_image_url?: string;
  scheduled_at: string;
  confidence_score: number;
  generation_reasoning: string;
  based_on_pattern: boolean;
  status: string;
}

interface Site {
  id: string;
  site_url: string;
  site_name?: string;
}

export default function AIAutopilotPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zoneSchedule, setZoneSchedule] = useState<AutopilotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

  // Load sites on mount
  useEffect(() => {
    loadSites();
  }, []);

  // Load iframe when site is selected
  useEffect(() => {
    if (selectedSite && selectedSiteUrl) {
      loadSitePreview();
    }
  }, [selectedSite, selectedSiteUrl]);

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
          setSelectedSiteUrl(data.sites[0].site_url);
        }
      }
    } catch (err) {
      console.error('Error loading sites:', err);
    }
  };

  const loadSitePreview = () => {
    if (!iframeRef.current || !selectedSiteUrl) return;

    const proxyUrl = `${apiUrl}/api/visual-proxy?url=${encodeURIComponent(selectedSiteUrl)}`;
    iframeRef.current.src = proxyUrl;
  };

  const loadZoneSchedule = async (zoneId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiUrl}/api/autopilot/queue/${selectedSite}?slot_id=${zoneId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setZoneSchedule(data.queue || []);
      }
    } catch (err) {
      console.error('Error loading zone schedule:', err);
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
        setSuccessMessage('✓ Approved!');
        setTimeout(() => setSuccessMessage(''), 2000);
        if (selectedZone) loadZoneSchedule(selectedZone.id);
      }
    } catch (err) {
      setError('Failed to approve');
    }
  };

  const handleRegenerate = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');

      // Delete the current one
      await fetch(`${apiUrl}/api/autopilot/queue/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Trigger regeneration for this zone
      const response = await fetch(`${apiUrl}/api/autopilot/generate/${selectedSite}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slotIds: [selectedZone.id],
          lookAheadDays: 30
        })
      });

      if (response.ok) {
        setSuccessMessage('✓ Regenerating...');
        setTimeout(() => {
          setSuccessMessage('');
          if (selectedZone) loadZoneSchedule(selectedZone.id);
        }, 2000);
      }
    } catch (err) {
      setError('Failed to regenerate');
    }
  };

  const handleReschedule = async (scheduleId: string) => {
    const newDate = prompt('Enter new date/time (YYYY-MM-DD HH:MM):');
    if (!newDate) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/autopilot/reschedule/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduledAt: newDate })
      });

      if (response.ok) {
        setSuccessMessage('✓ Rescheduled!');
        setTimeout(() => setSuccessMessage(''), 2000);
        if (selectedZone) loadZoneSchedule(selectedZone.id);
      }
    } catch (err) {
      setError('Failed to reschedule');
    }
  };

  // Listen for zone clicks from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_CLICKED') {
        const { cssSelector, elementText } = event.data.data;

        // Find the zone that matches this selector
        // (You'll need to load zones from the API)
        setSelectedZone({
          id: 'zone-id', // Get from API
          cssSelector,
          label: elementText
        });

        // Load schedule for this zone
        // loadZoneSchedule(zoneId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSite]);

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
    if (score >= 0.9) return '#10b981';
    if (score >= 0.75) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', backgroundColor: '#f5f5f5' }}>

      {/* Left Panel - Website Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRight: '1px solid #e5e7eb' }}>

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
            🤖 AI Autopilot
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
            Click any content zone to see AI-generated schedules
          </p>

          {/* Site Selector */}
          <select
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              const site = sites.find(s => s.id === e.target.value);
              if (site) setSelectedSiteUrl(site.site_url);
              setSelectedZone(null);
            }}
            style={{
              width: '100%',
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

        {/* Website Preview */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {selectedSite ? (
            <iframe
              ref={iframeRef}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Website Preview"
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              Select a site to preview
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - AI Schedule */}
      <div style={{ width: '450px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 8px rgba(0,0,0,0.05)' }}>

        {/* Panel Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          {selectedZone ? (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                {selectedZone.label || 'Selected Zone'}
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                AI-Generated Schedule
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                No Zone Selected
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                Click a content zone to see automated schedules
              </p>
            </>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            margin: '12px',
            padding: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#991b1b',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            margin: '12px',
            padding: '10px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '4px',
            color: '#166534',
            fontSize: '13px'
          }}>
            {successMessage}
          </div>
        )}

        {/* Schedule List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Loading schedule...
            </div>
          ) : selectedZone && zoneSchedule.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {zoneSchedule.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '14px'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      📅 {formatDate(item.scheduled_at)}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: getConfidenceColor(item.confidence_score),
                        color: 'white',
                        fontWeight: '600'
                      }}
                    >
                      {Math.round(item.confidence_score * 100)}%
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '13px',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    {item.content_text || item.content_image_url}
                  </div>

                  {/* AI Reasoning */}
                  {item.generation_reasoning && (
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      marginBottom: '10px',
                      paddingLeft: '8px',
                      borderLeft: '2px solid #3b82f6'
                    }}>
                      {item.generation_reasoning}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRegenerate(item.id)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Redo
                    </button>
                    <button
                      onClick={() => handleReschedule(item.id)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📅 Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedZone ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>
                No AI schedule yet
              </p>
              <p style={{ fontSize: '13px' }}>
                Autopilot will generate content for this zone
              </p>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👈</div>
              <p style={{ fontSize: '14px' }}>
                Click a zone on the left to see its AI schedule
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedZone && zoneSchedule.length > 0 && (
          <div style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {zoneSchedule.length} automated schedule{zoneSchedule.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
