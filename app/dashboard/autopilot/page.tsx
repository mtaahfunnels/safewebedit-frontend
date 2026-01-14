'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================================================
// DIAGNOSTIC SYSTEM (Background logging only)
// ============================================================================
const DEBUG = false; // Toggle diagnostics (hidden from user, runs in background)
const log = {
  info: (...args: any[]) => DEBUG && console.log('[AUTOPILOT INFO]', new Date().toISOString(), ...args),
  error: (...args: any[]) => console.error('[AUTOPILOT ERROR]', new Date().toISOString(), ...args),
  warn: (...args: any[]) => console.warn('[AUTOPILOT WARN]', new Date().toISOString(), ...args),
  api: (...args: any[]) => DEBUG && console.log('[AUTOPILOT API]', new Date().toISOString(), ...args),
  state: (...args: any[]) => DEBUG && console.log('[AUTOPILOT STATE]', new Date().toISOString(), ...args),
  iframe: (...args: any[]) => DEBUG && console.log('[AUTOPILOT IFRAME]', new Date().toISOString(), ...args),
};

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
  url: string;
  name?: string;
}

export default function AIAutopilotPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zoneSchedule, setZoneSchedule] = useState<AutopilotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [contentSlots, setContentSlots] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

  // Add diagnostic message
  const addDiagnostic = (message: string) => {
    setDiagnostics(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Load sites on mount
  useEffect(() => {
    log.info('Component mounted, initializing...');
    addDiagnostic('Component initialized');
    loadSites();
  }, []);

  // Load iframe when site is selected
  useEffect(() => {
    if (selectedSite && selectedSiteUrl) {
      log.state('Site selected:', { selectedSite, selectedSiteUrl });
      addDiagnostic(`Site selected: ${selectedSiteUrl}`);
      loadSitePreview();
    }
  }, [selectedSite, selectedSiteUrl]);

  const loadSites = async () => {
    log.api('Loading sites...');
    addDiagnostic('Fetching sites from API...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        log.warn('No authentication token found');
        addDiagnostic('ERROR: No auth token');
        return;
      }

      const url = `${apiUrl}/api/wordpress/sites`;
      log.api('Request:', { url, hasToken: !!token });

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      log.api('Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        log.api('Sites loaded:', data.sites?.length || 0);
        addDiagnostic(`Loaded ${data.sites?.length || 0} sites`);

        setSites(data.sites || []);
        if (data.sites && data.sites.length > 0) {
          setSelectedSite(data.sites[0].id);
          setSelectedSiteUrl(data.sites[0].url);
          log.state('Auto-selected first site:', data.sites[0]);
          addDiagnostic(`Auto-selected: ${data.sites[0].name || data.sites[0].url}`);
          loadContentSlots(data.sites[0].id);
        }
      } else {
        log.error('Failed to load sites:', response.status);
        addDiagnostic(`ERROR: Failed to load sites (${response.status})`);
      }
    } catch (err: any) {
      log.error('Exception loading sites:', err);
      addDiagnostic(`EXCEPTION: ${err.message}`);
    }
  };

  const loadContentSlots = async (siteId: string) => {
    log.api('Loading slots:', siteId);
    addDiagnostic('Loading zones...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/slots/site/${siteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContentSlots(data.slots || []);
        addDiagnostic(`Loaded ${data.slots?.length || 0} zones`);
      }
    } catch (err: any) {
      log.error('Load slots error:', err);
    }
  };

  const loadSitePreview = () => {
    if (!iframeRef.current || !selectedSiteUrl) {
      log.warn('Cannot load preview:', { hasIframe: !!iframeRef.current, hasUrl: !!selectedSiteUrl });
      return;
    }

    const proxyUrl = `${apiUrl}/api/visual-proxy?url=${encodeURIComponent(selectedSiteUrl)}`;
    log.iframe('Loading preview:', { selectedSiteUrl, proxyUrl });
    addDiagnostic('Loading website preview...');

    iframeRef.current.src = proxyUrl;
  };

  const loadZoneSchedule = async (zoneId: string) => {
    log.api('Loading zone schedule:', { zoneId, selectedSite });
    addDiagnostic(`Loading schedule for zone: ${zoneId.substring(0, 8)}...`);

    setLoading(true);
    setGeneratingMessage('');
    try {
      const token = localStorage.getItem('token');

      // STEP 1: Check existing queue
      const queueUrl = `${apiUrl}/api/autopilot/queue/${selectedSite}?slot_id=${zoneId}`;
      log.api('Checking queue:', { queueUrl, hasToken: !!token });

      const queueResponse = await fetch(queueUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        const existingCount = queueData.queue?.length || 0;
        log.api('Existing queue:', { count: existingCount });
        addDiagnostic(`Found ${existingCount} existing items`);

        // STEP 2: If queue has < 5 items, trigger on-demand generation
        if (existingCount < 5) {
          const itemsToGenerate = 5 - existingCount;
          setGeneratingMessage(`🤖 Generating your ${itemsToGenerate}-item schedule... This will take about ${itemsToGenerate * 3} seconds.`);
          log.api('Queue incomplete, generating...');
          addDiagnostic(`Generating ${itemsToGenerate} missing items...`);

          const generateUrl = `${apiUrl}/api/autopilot/generate-queue/${zoneId}`;
          const generateResponse = await fetch(generateUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (generateResponse.ok) {
            const generateData = await generateResponse.json();
            log.api('Generation complete:', { total: generateData.total, generated: generateData.generated });
            addDiagnostic(`✓ Generated ${generateData.generated} items, total: ${generateData.total}`);
            setZoneSchedule(generateData.queue || []);
            setGeneratingMessage('');
          } else {
            log.error('Failed to generate:', generateResponse.status);
            addDiagnostic(`ERROR: Generation failed (${generateResponse.status})`);
            setGeneratingMessage('');
            // Still show existing items even if generation failed
            setZoneSchedule(queueData.queue || []);
          }
        } else {
          // Queue is already full, just show it
          log.api('Queue full:', { count: existingCount });
          addDiagnostic(`✓ Queue complete with ${existingCount} items`);
          setZoneSchedule(queueData.queue || []);
        }
      } else {
        log.error('Failed to load queue:', queueResponse.status);
        addDiagnostic(`ERROR: Failed to load queue (${queueResponse.status})`);
      }
    } catch (err: any) {
      log.error('Exception loading schedule:', err);
      addDiagnostic(`EXCEPTION: ${err.message}`);
      setGeneratingMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (scheduleId: string) => {
    log.api('Approving schedule:', scheduleId);
    addDiagnostic(`Approving: ${scheduleId.substring(0, 8)}...`);

    try {
      const token = localStorage.getItem('token');
      const url = `${apiUrl}/api/autopilot/approve/${scheduleId}`;

      log.api('Request:', { url });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      log.api('Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        setSuccessMessage('✓ Approved!');
        addDiagnostic('✓ Approved successfully');
        setTimeout(() => setSuccessMessage(''), 2000);
        if (selectedZone) loadZoneSchedule(selectedZone.id);
      } else {
        log.error('Failed to approve:', response.status);
        addDiagnostic(`ERROR: Approval failed (${response.status})`);
        setError('Failed to approve');
      }
    } catch (err: any) {
      log.error('Exception approving:', err);
      addDiagnostic(`EXCEPTION: ${err.message}`);
      setError('Failed to approve');
    }
  };

  const handleRegenerate = async (scheduleId: string) => {
    log.api('Regenerating schedule item:', scheduleId);
    addDiagnostic(`Regenerating: ${scheduleId.substring(0, 8)}...`);

    try {
      const token = localStorage.getItem('token');

      // Regenerate this specific item (keeps same scheduled_at)
      log.api('Calling regenerate-item endpoint...');
      const response = await fetch(`${apiUrl}/api/autopilot/regenerate-item/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      log.api('Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        setSuccessMessage('✓ Content regenerated');
        addDiagnostic('✓ Item regenerated successfully');
        setTimeout(() => {
          setSuccessMessage('');
          if (selectedZone) loadZoneSchedule(selectedZone.id);
        }, 1500);
      } else {
        const errorData = await response.json();
        log.error('Failed to regenerate:', response.status, errorData);
        addDiagnostic(`ERROR: Regeneration failed (${response.status})`);
        setError('Failed to regenerate');
      }
    } catch (err: any) {
      log.error('Exception regenerating:', err);
      addDiagnostic(`EXCEPTION: ${err.message}`);
      setError('Failed to regenerate');
    }
  };

  const handleRegenerateAll = async () => {
    if (!selectedZone) return;

    log.api('Regenerating all items for zone:', selectedZone.id);
    addDiagnostic(`Regenerating all items for zone: ${selectedZone.id.substring(0, 8)}...`);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/api/autopilot/regenerate-all/${selectedZone.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      log.api('Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`✓ Regenerated ${data.regenerated} items`);
        addDiagnostic(`✓ Regenerated ${data.regenerated} of ${data.total} items`);
        setTimeout(() => {
          setSuccessMessage('');
          loadZoneSchedule(selectedZone.id);
        }, 2000);
      } else {
        log.error('Failed to regenerate all:', response.status);
        addDiagnostic(`ERROR: Regenerate all failed (${response.status})`);
        setError('Failed to regenerate all items');
      }
    } catch (err: any) {
      log.error('Exception regenerating all:', err);
      addDiagnostic(`EXCEPTION: ${err.message}`);
      setError('Failed to regenerate all items');
    }
  };

  const handleReschedule = async (scheduleId: string) => {
    const newDate = prompt('Enter new date/time (YYYY-MM-DD HH:MM):');
    if (!newDate) return;

    log.api('Rescheduling:', { scheduleId, newDate });
    addDiagnostic(`Rescheduling to: ${newDate}`);

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

      log.api('Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        setSuccessMessage('✓ Rescheduled!');
        addDiagnostic('✓ Rescheduled successfully');
        setTimeout(() => setSuccessMessage(''), 2000);
        if (selectedZone) loadZoneSchedule(selectedZone.id);
      } else {
        log.error('Failed to reschedule:', response.status);
        addDiagnostic(`ERROR: Reschedule failed (${response.status})`);
        setError('Failed to reschedule');
      }
    } catch (err: any) {
      log.error('Exception rescheduling:', err);
      addDiagnostic(`EXCEPTION: ${err.message}`);
      setError('Failed to reschedule');
    }
  };

  // Listen for zone clicks from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      log.iframe('Message received:', event.data);

      if (event.data.type === 'ELEMENT_CLICKED') {
        const { cssSelector, elementText } = event.data.data;
        log.iframe('Element clicked:', { cssSelector, elementText });
        addDiagnostic(`Zone clicked: ${elementText || cssSelector.substring(0, 50)}`);
        const matchedSlot = contentSlots.find(slot => slot.css_selector === cssSelector);
        if (matchedSlot) {
          log.state('Matched slot:', matchedSlot);
          addDiagnostic(`Matched: ${matchedSlot.slot_label}`);
          setSelectedZone({ id: matchedSlot.id, cssSelector, label: matchedSlot.slot_label || elementText });
          loadZoneSchedule(matchedSlot.id);
        } else {
          log.warn('No match for:', cssSelector);
          addDiagnostic('No matching zone');
          setSelectedZone({ id: null, cssSelector, label: elementText });
          setZoneSchedule([]);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSite, contentSlots]);

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
              if (site) setSelectedSiteUrl(site.url);
              setSelectedZone(null);
              log.state('Site changed:', e.target.value);
              addDiagnostic(`Site changed: ${site?.name || site?.url}`);
              setZoneSchedule([]);
              if (e.target.value) loadContentSlots(e.target.value);
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
                {site.name || site.url}
              </option>
            ))}
          </select>

          {/* Diagnostic Panel */}
          {DEBUG && diagnostics.length > 0 && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '11px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#6b7280' }}>
                🔍 Diagnostics (Last 10)
              </div>
              {diagnostics.map((msg, i) => (
                <div key={i} style={{ color: '#374151', padding: '2px 0' }}>{msg}</div>
              ))}
            </div>
          )}
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
              onLoad={() => {
                log.iframe('Iframe loaded');
                addDiagnostic('✓ Preview loaded');
              }}
              onError={() => {
                log.error('Iframe failed to load');
                addDiagnostic('ERROR: Preview failed');
              }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  {selectedZone.label || 'Selected Zone'}
                </h2>
                {zoneSchedule.length > 0 && (
                  <button
                    onClick={handleRegenerateAll}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    title="Regenerate all queue items"
                  >
                    🔄 Regenerate All
                  </button>
                )}
              </div>
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
          {loading || generatingMessage ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              {/* Animated Loading Spinner */}
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />

              {/* Loading Message */}
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                maxWidth: '300px'
              }}>
                {generatingMessage || 'Loading schedule...'}
              </div>

              {generatingMessage && (
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  maxWidth: '350px',
                  lineHeight: '1.6'
                }}>
                  AI is analyzing your content and creating personalized updates. Please wait while we prepare your 5-item schedule.
                </div>
              )}

              {/* Add CSS animation */}
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        📅 {formatDate(item.scheduled_at)}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          backgroundColor: getStatusBadge(item.status).bg,
                          color: getStatusBadge(item.status).color,
                          fontWeight: '600',
                          width: 'fit-content'
                        }}
                      >
                        {getStatusBadge(item.status).label}
                      </div>
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
                    {item.status === 'pending_review' && (
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
                    )}
                    {item.status === 'approved' && (
                      <div
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                      >
                        ✓ Will deploy at scheduled time
                      </div>
                    )}
                    {item.status === 'deployed' && (
                      <div
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                      >
                        🚀 Deployed {item.deployed_at ? new Date(item.deployed_at).toLocaleDateString() : ''}
                      </div>
                    )}
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
