'use client';

import { useState, useEffect, useRef } from 'react';

interface SwapImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;
  siteId: string;
  pageId: number;
  onSwapComplete: () => void;
}

export default function SwapImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageWidth,
  imageHeight,
  siteId,
  pageId,
  onSwapComplete
}: SwapImageModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<'design' | 'preview' | 'swapping'>('design');

  // Image dimensions
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  // Background
  const [bgType, setBgType] = useState<'solid' | 'gradient'>('gradient');
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [bgGradientStart, setBgGradientStart] = useState('#1e3a8a');
  const [bgGradientEnd, setBgGradientEnd] = useState('#3b82f6');

  // Text
  const [textContent, setTextContent] = useState('Your Text Here');
  const [textSize, setTextSize] = useState(60);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [textBold, setTextBold] = useState(true);
  const [textShadow, setTextShadow] = useState(true);

  const [createdImage, setCreatedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Parse dimensions
      const w = parseInt(imageWidth) || 800;
      const h = parseInt(imageHeight) || 600;
      setWidth(w);
      setHeight(h);

      // Try to detect text from the image
      detectTextAndColors();
    }
  }, [isOpen, imageUrl, imageWidth, imageHeight]);

  useEffect(() => {
    if (step === 'design') {
      updatePreview();
    }
  }, [width, height, bgType, bgColor, bgGradientStart, bgGradientEnd, textContent, textSize, textColor, textPosition, textBold, textShadow]);

  const detectTextAndColors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://safewebedit.com/api/image-text/detect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text_regions && data.text_regions.length > 0) {
          // Use detected text
          const detectedTexts = data.text_regions.map((r: any) => r.text).join(' ');
          setTextContent(detectedTexts);
        }
      }
    } catch (err) {
      console.log('Could not detect text, using default');
    }
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

  const handleCreateAndSwap = async () => {
    setProcessing(true);
    setError(null);
    setStep('preview');

    try {
      const token = localStorage.getItem('token');

      // Step 1: Create the new image
      const createResponse = await fetch('https://safewebedit.com/api/visual-creator/create', {
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

      if (!createResponse.ok) {
        throw new Error('Failed to create image');
      }

      const createData = await createResponse.json();
      setCreatedImage(createData.image);
      setProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create image');
      setStep('design');
      setProcessing(false);
    }
  };

  const handleConfirmSwap = async () => {
    if (!createdImage) return;

    setProcessing(true);
    setStep('swapping');

    try {
      const token = localStorage.getItem('token');

      // Upload to WordPress and replace
      const response = await fetch('https://safewebedit.com/api/visual-creator/save-to-wordpress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_id: siteId,
          image_base64: createdImage,
          filename: `swapped-${Date.now()}.png`,
          replace_image_url: imageUrl,
          page_id: pageId
        })
      });

      if (response.ok) {
        onSwapComplete();
        onClose();
        handleReset();
      } else {
        throw new Error('Failed to swap image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to swap image');
      setStep('preview');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('design');
    setCreatedImage(null);
    setError(null);
    setTextContent('Your Text Here');
  };

  if (!isOpen) return null;

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
          maxWidth: '1400px',
          width: '95%',
          maxHeight: '95vh',
          overflow: 'auto',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              Swap Image
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
              Modify the text and colors, then replace the original image
            </p>
          </div>
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

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Step: Design */}
        {step === 'design' && (
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
            {/* Left: Controls */}
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              {/* Background */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px' }}>
                  Background
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={() => setBgType('solid')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: `2px solid ${bgType === 'solid' ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '6px',
                      backgroundColor: bgType === 'solid' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      fontWeight: bgType === 'solid' ? '600' : 'normal'
                    }}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => setBgType('gradient')}
                    style={{
                      flex: 1,
                      padding: '8px',
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
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '100%', height: '40px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666' }}>Start</label>
                      <input
                        type="color"
                        value={bgGradientStart}
                        onChange={(e) => setBgGradientStart(e.target.value)}
                        style={{ width: '100%', height: '40px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666' }}>End</label>
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
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
                  Text
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                  placeholder="Enter your text..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Size</label>
                  <input
                    type="number"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Color</label>
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

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
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

              <button
                onClick={handleCreateAndSwap}
                disabled={processing}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: processing ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Creating...' : 'Create Preview'}
              </button>
            </div>

            {/* Right: Preview */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px' }}>
                Live Preview
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                minHeight: '500px'
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
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                {width} × {height} pixels (matches original)
              </p>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && createdImage && (
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Preview - Ready to Swap?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Original Image</p>
                <img src={imageUrl} alt="Original" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>New Image</p>
                <img src={createdImage} alt="New" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Edit More
              </button>
              <button
                onClick={handleConfirmSwap}
                disabled={processing}
                style={{
                  padding: '12px 24px',
                  backgroundColor: processing ? '#d1d5db' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Swapping...' : 'Swap Image'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Swapping */}
        {step === 'swapping' && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
            <h3>Replacing Image...</h3>
            <p style={{ color: '#666' }}>
              Uploading new image and updating WordPress page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
