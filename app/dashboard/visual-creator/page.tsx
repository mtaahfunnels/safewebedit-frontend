'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Site {
  id: string;
  name: string;
  site_url: string;
}

interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  background: any;
  text: any;
}

export default function VisualCreator() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sites
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(true);

  // Image settings
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  // Background settings
  const [bgType, setBgType] = useState<'solid' | 'gradient'>('gradient');
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [bgGradientStart, setBgGradientStart] = useState('#1e3a8a');
  const [bgGradientEnd, setBgGradientEnd] = useState('#3b82f6');

  // Text settings
  const [textContent, setTextContent] = useState('Your Text Here');
  const [textSize, setTextSize] = useState(60);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [textBold, setTextBold] = useState(true);
  const [textShadow, setTextShadow] = useState(true);

  // UI state
  const [creating, setCreating] = useState(false);
  const [createdImage, setCreatedImage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadSites();
    loadTemplates();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [width, height, bgType, bgColor, bgGradientStart, bgGradientEnd, textContent, textSize, textColor, textPosition, textBold, textShadow]);

  const loadSites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://safewebedit.com/api/sites', {
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

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://safewebedit.com/api/visual-creator/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const applyTemplate = (template: Template) => {
    setWidth(template.width);
    setHeight(template.height);

    if (template.background.type === 'solid') {
      setBgType('solid');
      setBgColor(template.background.color);
    } else if (template.background.type === 'gradient') {
      setBgType('gradient');
      setBgGradientStart(template.background.colors[0]);
      setBgGradientEnd(template.background.colors[1]);
    }

    if (template.text.main) {
      setTextContent(template.text.main.content);
      setTextSize(template.text.main.size);
      setTextColor(template.text.main.color);
      setTextBold(template.text.main.bold || false);
      setTextShadow(template.text.main.shadow || false);
      setTextPosition(template.text.main.position);
    }

    showMessage('success', `Applied template: ${template.name}`);
  };

  const updatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Draw background
    if (bgType === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, bgGradientStart);
      gradient.addColorStop(1, bgGradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw text
    const fontWeight = textBold ? 'bold' : 'normal';
    ctx.font = `${fontWeight} ${textSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';

    let x = width / 2;
    let y = height / 2;

    if (textPosition === 'top') {
      y = height * 0.25;
    } else if (textPosition === 'bottom') {
      y = height * 0.75;
    }

    if (textShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }

    ctx.fillText(textContent, x, y);
  };

  const handleCreate = async () => {
    setCreating(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://safewebedit.com/api/visual-creator/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width,
          height,
          background: bgType === 'solid'
            ? { type: 'solid', color: bgColor }
            : { type: 'gradient', colors: [bgGradientStart, bgGradientEnd] },
          text: [{
            content: textContent,
            size: textSize,
            color: textColor,
            position: textPosition,
            bold: textBold,
            shadow: textShadow
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedImage(data.image);
        showMessage('success', 'Image created successfully!');
      } else {
        showMessage('error', 'Failed to create image');
      }
    } catch (err) {
      showMessage('error', 'Failed to create image');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveToWordPress = async () => {
    if (!createdImage || !selectedSite) return;

    setCreating(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://safewebedit.com/api/visual-creator/save-to-wordpress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_id: selectedSite,
          image_base64: createdImage,
          filename: `${textContent.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
        })
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', `Image uploaded to WordPress! ID: ${data.new_image.id}`);
        setCreatedImage(null);
      } else {
        showMessage('error', 'Failed to save to WordPress');
      }
    } catch (err) {
      showMessage('error', 'Failed to save to WordPress');
    } finally {
      setCreating(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
        Visual Image Creator
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Create stunning marketing images with custom text and backgrounds
      </p>

      {/* Message Banner */}
      {message && (
        <div
          style={{
            padding: '12px 20px',
            marginBottom: '24px',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Templates */}
      {templates.length > 0 && (
        <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Start Templates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{template.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{template.width}×{template.height}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left: Controls */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Image Settings</h2>

            {/* Size */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                Size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Background */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                Background
              </label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button
                  onClick={() => setBgType('solid')}
                  style={{
                    padding: '8px 16px',
                    border: `2px solid ${bgType === 'solid' ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: bgType === 'solid' ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: bgType === 'solid' ? '600' : 'normal'
                  }}
                >
                  Solid Color
                </button>
                <button
                  onClick={() => setBgType('gradient')}
                  style={{
                    padding: '8px 16px',
                    border: `2px solid ${bgType === 'gradient' ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: bgType === 'gradient' ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: bgType === 'gradient' ? '600' : 'normal'
                  }}
                >
                  Gradient
                </button>
              </div>

              {bgType === 'solid' ? (
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '100%', height: '40px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666' }}>Start Color</label>
                    <input
                      type="color"
                      value={bgGradientStart}
                      onChange={(e) => setBgGradientStart(e.target.value)}
                      style={{ width: '100%', height: '40px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666' }}>End Color</label>
                    <input
                      type="color"
                      value={bgGradientEnd}
                      onChange={(e) => setBgGradientEnd(e.target.value)}
                      style={{ width: '100%', height: '40px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Text */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                Text Content
              </label>
              <input
                type="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                placeholder="Enter your text..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Font Size</label>
                <input
                  type="number"
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {['top', 'center', 'bottom'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setTextPosition(pos as any)}
                    style={{
                      padding: '8px',
                      border: `2px solid ${textPosition === pos ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '6px',
                      backgroundColor: textPosition === pos ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontWeight: textPosition === pos ? '600' : 'normal'
                    }}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={textBold}
                  onChange={(e) => setTextBold(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Bold</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={textShadow}
                  onChange={(e) => setTextShadow(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Shadow</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: creating ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: creating ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {creating ? 'Creating...' : 'Create Image'}
            </button>

            {createdImage && selectedSite && (
              <button
                onClick={handleSaveToWordPress}
                disabled={creating}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: creating ? '#d1d5db' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                Save to WordPress
              </button>
            )}

            {createdImage && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
                Image created! Save to WordPress or adjust settings and create again.
              </p>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'sticky', top: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Live Preview</h2>
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              minHeight: '400px'
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
              {width} × {height} pixels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
