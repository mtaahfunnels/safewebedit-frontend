'use client';

import { useState } from 'react';

interface TextRegion {
  id: string;
  text: string;
  confidence?: number;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  engine?: string;
}

interface TextReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onReplacementComplete: (processedImageUrl: string) => void;
}

export default function TextReplacementModal({
  isOpen,
  onClose,
  imageUrl,
  onReplacementComplete
}: TextReplacementModalProps) {
  const [step, setStep] = useState<'detect' | 'edit' | 'preview' | 'processing'>('detect');
  const [detectedRegions, setDetectedRegions] = useState<TextRegion[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [replacements, setReplacements] = useState<Record<string, string>>({});
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetectText = async () => {
    setDetecting(true);
    setError(null);

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

      if (!response.ok) {
        throw new Error('Text detection failed');
      }

      const data = await response.json();

      if (data.text_regions && data.text_regions.length > 0) {
        setDetectedRegions(data.text_regions);
        setStep('edit');
      } else {
        setError('No text found in this image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect text');
    } finally {
      setDetecting(false);
    }
  };

  const toggleRegionSelection = (regionId: string) => {
    const newSelected = new Set(selectedRegions);
    if (newSelected.has(regionId)) {
      newSelected.delete(regionId);
      const newReplacements = { ...replacements };
      delete newReplacements[regionId];
      setReplacements(newReplacements);
    } else {
      newSelected.add(regionId);
    }
    setSelectedRegions(newSelected);
  };

  const handleReplacementTextChange = (regionId: string, newText: string) => {
    setReplacements({
      ...replacements,
      [regionId]: newText
    });
  };

  const handleReplaceText = async () => {
    setProcessing(true);
    setError(null);
    setStep('processing');

    try {
      const token = localStorage.getItem('token');

      // Build replacements array
      const replacementsList = Array.from(selectedRegions).map(regionId => {
        const region = detectedRegions.find(r => r.id === regionId);
        return {
          region: region!.region,
          new_text: replacements[regionId] || '',
          style: {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'Arial',
            shadow: true
          }
        };
      });

      const response = await fetch('https://safewebedit.com/api/image-text/replace', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl,
          replacements: replacementsList
        })
      });

      if (!response.ok) {
        throw new Error('Text replacement failed');
      }

      const data = await response.json();

      if (data.processed_image) {
        setProcessedImage(data.processed_image);
        setStep('preview');
      } else {
        throw new Error('No processed image returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace text');
      setStep('edit');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    if (processedImage) {
      onReplacementComplete(processedImage);
      onClose();
    }
  };

  const handleReset = () => {
    setStep('detect');
    setDetectedRegions([]);
    setSelectedRegions(new Set());
    setReplacements({});
    setProcessedImage(null);
    setError(null);
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Replace Text in Image
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

        {/* Step: Detect */}
        {step === 'detect' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <img
              src={imageUrl}
              alt="Image to process"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                marginBottom: '20px',
                borderRadius: '8px'
              }}
            />
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Click the button below to detect text in this image
            </p>
            <button
              onClick={handleDetectText}
              disabled={detecting}
              style={{
                padding: '12px 32px',
                backgroundColor: detecting ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: detecting ? 'not-allowed' : 'pointer'
              }}
            >
              {detecting ? 'Detecting Text...' : 'Detect Text'}
            </button>
          </div>
        )}

        {/* Step: Edit */}
        {step === 'edit' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left: Image with regions */}
            <div>
              <h3 style={{ marginTop: 0 }}>Detected Text ({detectedRegions.length})</h3>
              <div style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <img
                  src={imageUrl}
                  alt="Original"
                  style={{ width: '100%', display: 'block' }}
                />
                {/* Overlay detected regions */}
                {detectedRegions.map(region => (
                  <div
                    key={region.id}
                    onClick={() => toggleRegionSelection(region.id)}
                    style={{
                      position: 'absolute',
                      left: `${(region.region.x / 800) * 100}%`,
                      top: `${(region.region.y / 600) * 100}%`,
                      width: `${(region.region.width / 800) * 100}%`,
                      height: `${(region.region.height / 600) * 100}%`,
                      border: selectedRegions.has(region.id) ? '3px solid #3b82f6' : '2px solid #ef4444',
                      backgroundColor: selectedRegions.has(region.id) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title={`Click to ${selectedRegions.has(region.id) ? 'deselect' : 'select'}: "${region.text}"`}
                  />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Click on red boxes to select text for replacement
              </p>
            </div>

            {/* Right: Replacement inputs */}
            <div>
              <h3 style={{ marginTop: 0 }}>Replacement Text</h3>
              {selectedRegions.size === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Select text regions on the left to replace them
                </p>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {Array.from(selectedRegions).map(regionId => {
                    const region = detectedRegions.find(r => r.id === regionId);
                    return (
                      <div key={regionId} style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
                          Original: "{region?.text}"
                        </label>
                        <input
                          type="text"
                          placeholder="Enter new text..."
                          value={replacements[regionId] || ''}
                          onChange={(e) => handleReplacementTextChange(regionId, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleReplaceText}
                  disabled={selectedRegions.size === 0 || processing}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: (selectedRegions.size === 0 || processing) ? '#d1d5db' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (selectedRegions.size === 0 || processing) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Processing...' : `Replace ${selectedRegions.size} Text${selectedRegions.size !== 1 ? 's' : ''}`}
                </button>
                <button
                  onClick={onClose}
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
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
            <h3>Processing Image...</h3>
            <p style={{ color: '#666' }}>
              Removing old text and adding new text
            </p>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && processedImage && (
          <div>
            <h3 style={{ marginTop: 0 }}>Preview Result</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Before</p>
                <img src={imageUrl} alt="Before" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>After</p>
                <img src={processedImage} alt="After" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
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
                Start Over
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Use This Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
