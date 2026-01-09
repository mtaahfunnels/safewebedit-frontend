'use client';

import { useState, useEffect } from 'react';

interface ImageOverlayEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (overlay: OverlayConfig) => void;
  image: {
    id: string;
    src: string;
    alt: string;
  } | null;
  existingOverlay?: OverlayConfig | null;
}

export interface OverlayConfig {
  text: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style: {
    fontSize: string;
    color: string;
    backgroundColor: string;
    padding: string;
  };
}

export default function ImageOverlayEditor({
  isOpen,
  onClose,
  onSave,
  image,
  existingOverlay
}: ImageOverlayEditorProps) {
  const [overlayText, setOverlayText] = useState('');
  const [position, setPosition] = useState<OverlayConfig['position']>('center');
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('rgba(0,0,0,0.5)');
  const [bgOpacity, setBgOpacity] = useState(0.5);

  // Load existing overlay if editing
  useEffect(() => {
    if (existingOverlay) {
      setOverlayText(existingOverlay.text);
      setPosition(existingOverlay.position);
      setFontSize(parseInt(existingOverlay.style.fontSize));
      setTextColor(existingOverlay.style.color);

      // Parse opacity from rgba
      const match = existingOverlay.style.backgroundColor.match(/rgba\((\d+),(\d+),(\d+),([0-9.]+)\)/);
      if (match) {
        setBgOpacity(parseFloat(match[4]));
      }
    } else {
      // Reset to defaults
      setOverlayText('');
      setPosition('center');
      setFontSize(32);
      setTextColor('#ffffff');
      setBgOpacity(0.5);
    }
  }, [existingOverlay, isOpen]);

  if (!isOpen || !image) return null;

  const handleSave = () => {
    const overlay: OverlayConfig = {
      text: overlayText,
      position: position,
      style: {
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: `rgba(0,0,0,${bgOpacity})`,
        padding: '20px',
      },
    };
    onSave(overlay);
  };

  // Position button configurations
  const positions: Array<{ value: OverlayConfig['position']; label: string }> = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center', label: 'Center' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  // Generate preview style for overlay
  const getPreviewStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${fontSize}px`,
      color: textColor,
      backgroundColor: `rgba(0,0,0,${bgOpacity})`,
      padding: '20px',
      borderRadius: '4px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      maxWidth: '80%',
      wordWrap: 'break-word',
    };

    // Position-specific styles
    const positionStyles: Record<OverlayConfig['position'], React.CSSProperties> = {
      'top-left': { top: '10%', left: '10%' },
      'top-center': { top: '10%', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '10%', right: '10%' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'bottom-left': { bottom: '10%', left: '10%' },
      'bottom-center': { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '10%', right: '10%' },
    };

    return { ...baseStyle, ...positionStyles[position] };
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '1200px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            {existingOverlay ? 'Edit' : 'Add'} Text Overlay
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left side - Controls */}
          <div>
            <h3 style={{ marginTop: 0 }}>Overlay Settings</h3>

            {/* Text input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Overlay Text
              </label>
              <textarea
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Enter text to display on image..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Position selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Position
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => setPosition(pos.value)}
                    style={{
                      padding: '10px',
                      border: position === pos.value ? '2px solid #3b82f6' : '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: position === pos.value ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: position === pos.value ? '600' : '400',
                    }}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size slider */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Text color */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Text Color
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
            </div>

            {/* Background opacity */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Background Opacity: {Math.round(bgOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleSave}
                disabled={!overlayText.trim()}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: overlayText.trim() ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: overlayText.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Save Overlay
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right side - Preview */}
          <div>
            <h3 style={{ marginTop: 0 }}>Preview</h3>
            <div
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                overflow: 'hidden',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                }}
              />
              {overlayText && (
                <div style={getPreviewStyle()}>
                  {overlayText}
                </div>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
              Live preview of your text overlay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
