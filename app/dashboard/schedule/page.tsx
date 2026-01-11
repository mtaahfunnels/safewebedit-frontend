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
  css_selector: string;
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

  // DEBUG: Log when selectedZone changes
  useEffect(() => {
    console.log('[Schedule] 🎯 selectedZone changed:', selectedZone ? {
      id: selectedZone.id,
      label: selectedZone.slot_label,
      marker: selectedZone.marker_name,
      pending: selectedZone.pending_count
    } : null);
    console.log('[Schedule] 🎨 Sidebar should be:', selectedZone ? 'VISIBLE' : 'HIDDEN');
  }, [selectedZone]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [contentType, setContentType] = useState<'text' | 'image'>('text');
  const [contentText, setContentText] = useState('');
  const [contentImageUrl, setContentImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
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

  // CLONE VISUAL EDITOR'S MESSAGE HANDLING PATTERN - MATCH BY CSS SELECTOR
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle zone clicks (TEXT_CLICKED in schedule mode)
      if (event.data.type === 'TEXT_CLICKED') {
        console.log('[Schedule] Text clicked:', event.data.data);
        const { cssSelector } = event.data.data;

        if (!cssSelector) {
          console.warn('[Schedule] No cssSelector in message');
          return;
        }

        console.log('[Schedule] Looking for zone with selector:', cssSelector);
        console.log('[Schedule] Available zones:', zones.map(z => ({
          selector: z.css_selector,
          label: z.slot_label
        })));

        // Find zone by CSS selector (same as visual editor pattern)
        const zone = zones.find(z => z.css_selector === cssSelector);

        if (zone) {
          console.log('[Schedule] ✅ Found zone:', zone.slot_label);
          setSelectedZone(null); // Clear first to ensure re-render
          await loadZoneQueue(zone.id);
        } else {
          console.warn('[Schedule] No zone found for selector:', cssSelector);
          setError('Zone not found. Please add this zone in Visual Editor first.');
          setTimeout(() => setError(''), 4000);
        }
      }

      // Handle image clicks (same pattern as text clicks)
      if (event.data.type === 'IMAGE_CLICKED') {
        console.log('[Schedule] Image clicked:', event.data.data);
        const { cssSelector } = event.data.data;

        if (!cssSelector) {
          console.warn('[Schedule] No cssSelector in IMAGE_CLICKED message');
          return;
        }

        console.log('[Schedule] Looking for image zone with selector:', cssSelector);

        // Find zone by CSS selector (same pattern as TEXT_CLICKED)
        const zone = zones.find(z => z.css_selector === cssSelector);

        if (zone) {
          console.log('[Schedule] ✅ Found image zone:', zone.slot_label);
          setSelectedZone(null); // Clear first to ensure re-render
          setContentType('image'); // Set form to image mode
          await loadZoneQueue(zone.id);
        } else {
          console.warn('[Schedule] No image zone found for selector:', cssSelector);
          setError('Image zone not found. Please add this image in Visual Editor first.');
          setTimeout(() => setError(''), 4000);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [zones, selectedSite]);

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
        const sitesArray = Array.isArray(data) ? data : (data.sites || []);
        setSites(sitesArray);
        if (sitesArray.length > 0) {
          setSelectedSite(sitesArray[0].id);
        }
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `https://safewebedit.com/api/schedule/zones/${selectedSite}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setZones(data.zones || []);
      }
    } catch (err: any) {
      console.error('Failed to load zones:', err);
      setError(err.message);
    }
  };

  const loadZoneQueue = async (zoneId: string) => {
    console.log('[Schedule] 📡 loadZoneQueue called with ID:', zoneId);
    const token = localStorage.getItem('token');

    try {
      const url = `https://safewebedit.com/api/schedule/queue/${zoneId}`;
      console.log('[Schedule] 🌐 Fetching:', url);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('[Schedule] 📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Schedule] 📦 Response data:', data);
        console.log('[Schedule] ✅ Setting selectedZone to:', data.zone);
        setSelectedZone(data.zone);
        setShowForm(false);
        console.log('[Schedule] ✅ State updated - sidebar should appear!');
      } else {
        const errorText = await response.text();
        console.error('[Schedule] ❌ API error:', response.status, errorText);
        setError(`API error: ${response.status}`);
      }
    } catch (err: any) {
      console.error('[Schedule] ❌ Failed to load queue:', err);
      setError(err.message);
    }
  };


  const generateAIImage = async (prompt: string): Promise<string | null> => {
    try {
      setGeneratingImage(true);
      const token = localStorage.getItem('token');

      console.log('[Schedule] Generating AI image with prompt:', prompt);

      const response = await fetch('https://safewebedit.com/api/ai-image-gen/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          image_type: 'content_image',
          model: 'flux-pro'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('[Schedule] AI image generated:', data.url);

      return data.url;
    } catch (err: any) {
      console.error('[Schedule] Image generation error:', err);
      setError(err.message);
      return null;
    } finally {
      setGeneratingImage(false);
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

      // Generate AI image if needed
      let finalImageUrl = contentImageUrl;
      if (contentType === 'image' && imagePrompt && !contentImageUrl) {
        console.log('[Schedule] Generating image from prompt before scheduling...');
        const generatedUrl = await generateAIImage(imagePrompt);
        if (!generatedUrl) {
          throw new Error('Failed to generate image. Please try again.');
        }
        finalImageUrl = generatedUrl;
        setContentImageUrl(generatedUrl);
      }

      const token = localStorage.getItem('token');
      const scheduledAt = `${scheduledDate}T${scheduledHour.padStart(2, '0')}:00:00`;

      const payload = {
        content_slot_id: selectedZone.id,
        content_type: contentType,
        content_text: contentType === 'text' ? contentText : undefined,
        content_image_url: contentType === 'image' ? finalImageUrl : undefined,
        content_image_prompt: contentType === 'image' ? imagePrompt : undefined,
        scheduled_at: scheduledAt
      };

      const response = await fetch('https://safewebedit.com/api/schedule', {
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

      setMessage('✅ Content scheduled successfully!');
      setShowForm(false);
      setContentText('');
      setContentImageUrl('');
      setImagePrompt('');
      setScheduledDate('');
      setScheduledHour('12');

      await loadZones();
      await loadZoneQueue(selectedZone.id);

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelScheduled = async (itemId: string) => {
    if (!confirm('Cancel this scheduled content?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://safewebedit.com/api/schedule/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to cancel');

      setMessage('✅ Cancelled successfully');
      await loadZones();
      if (selectedZone) {
        await loadZoneQueue(selectedZone.id);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeployNow = async (itemId: string) => {
    if (!confirm('Deploy this content now?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://safewebedit.com/api/schedule/${itemId}/deploy-now`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to deploy');

      setMessage('✅ Deployed successfully!');
      await loadZones();
      if (selectedZone) {
        await loadZoneQueue(selectedZone.id);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Bar - CLONED FROM VISUAL EDITOR */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📅 Content Schedule</h1>

        <select
          value={selectedSite}
          onChange={(e) => {
            setSelectedSite(e.target.value);
            setSelectedZone(null);
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '200px'
          }}
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        <div style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
          Click any zone to schedule content
        </div>
      </div>

      {/* Message Banners - CLONED FROM VISUAL EDITOR */}
      {message && (
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderBottom: '1px solid #c3e6cb'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderBottom: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Main Content Area - CLONED FROM VISUAL EDITOR */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Preview */}
        <div style={{
          flex: selectedZone ? '0 0 calc(100% - 450px)' : '1',
          backgroundColor: '#f5f5f5',
          position: 'relative',
          overflow: 'hidden',
          transition: 'flex 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {currentUrl ? (
            <iframe
              ref={iframeRef}
              src={`https://safewebedit.com/api/visual-proxy?url=${encodeURIComponent(currentUrl)}&mode=schedule`}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                backgroundColor: 'white'
              }}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#999' }}>Select a site to preview</p>
            </div>
          )}
        </div>

        {/* Right: Schedule Timeline Sidebar - ADAPTED FROM VISUAL EDITOR'S TEXT EDITOR SIDEBAR */}
        {selectedZone && (
          <div style={{
            flex: '0 0 450px',
            backgroundColor: 'white',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                📋 {selectedZone.slot_label}
              </h3>
              <button
                onClick={() => setSelectedZone(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {/* Zone Info */}
            <div style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                {selectedZone.marker_name}
              </div>
              <div style={{
                marginTop: '8px',
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

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {/* Current Content */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                  NOW LIVE
                </h4>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  fontSize: '13px',
                  color: '#333'
                }}>
                  {selectedZone.current_content || 'No content'}
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Currently Live
                  </div>
                </div>
              </div>

              {/* Upcoming Content */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                  UPCOMING
                </h4>

                {selectedZone.scheduled_queue && selectedZone.scheduled_queue.length > 0 ? (
                  selectedZone.scheduled_queue.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        #{index + 1} · {formatDateTime(item.scheduled_at)}
                      </div>
                      <div style={{ color: '#666', marginBottom: '8px' }}>
                        {item.content_text || item.content_image_url}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDeployNow(item.id)}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Deploy Now
                        </button>
                        <button
                          onClick={() => handleCancelScheduled(item.id)}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '13px'
                  }}>
                    No scheduled content yet
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0'
            }}>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Add to Queue
                </button>
              ) : (
                <form onSubmit={handleScheduleContent}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      Content Type
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as 'text' | 'image')}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}
                    >
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  {contentType === 'text' ? (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Content
                      </label>
                      <textarea
                        value={contentText}
                        onChange={(e) => setContentText(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px',
                          resize: 'vertical'
                        }}
                        placeholder="Enter content..."
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                          AI Image Prompt
                        </label>
                        <textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '13px',
                            resize: 'vertical'
                          }}
                          placeholder="Describe the image you want to generate..."
                        />
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                          {generatingImage ? '⏳ Generating image...' : '💡 AI will generate this image when you schedule'}
                        </div>
                      </div>

                      {contentImageUrl && (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#27ae60' }}>
                            ✅ Generated Image Preview
                          </label>
                          <img
                            src={contentImageUrl}
                            alt="Generated preview"
                            style={{
                              width: '100%',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              maxHeight: '200px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={getMinDate()}
                        required
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        Hour
                      </label>
                      <input
                        type="number"
                        value={scheduledHour}
                        onChange={(e) => setScheduledHour(e.target.value)}
                        min="0"
                        max="23"
                        required
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      disabled={saving || generatingImage}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: (saving || generatingImage) ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: (saving || generatingImage) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {generatingImage ? '⏳ Generating Image...' : (saving ? '📅 Scheduling...' : 'Schedule')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setContentText('');
                        setContentImageUrl('');
                      }}
                      disabled={saving}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
