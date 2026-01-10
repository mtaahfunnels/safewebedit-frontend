'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Site {
  id: string;
  name: string;
  url: string;
}

interface Slot {
  id: string;
  marker_name: string;
  slot_label: string;
  content: string;
  wp_page_title: string;
  wp_page_id: number;
  site_name: string;
}

interface ImageData {
  cssSelector: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: string;
}

export default function VisualEditorPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Image swap state
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [originalMetadata, setOriginalMetadata] = useState<ImageMetadata | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [includeTextInPrompt, setIncludeTextInPrompt] = useState(true);
  const [hasTextOverlay, setHasTextOverlay] = useState(false);
  const [overlayInfo, setOverlayInfo] = useState<any>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [newMetadata, setNewMetadata] = useState<ImageMetadata | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Navigation tracking state
  const [currentPageId, setCurrentPageId] = useState<number>(15);
  const [currentPageTitle, setCurrentPageTitle] = useState('Home');
  const [currentPath, setCurrentPath] = useState('/');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      const site = sites.find(s => s.id === selectedSite);
      if (site) {
        setCurrentUrl(site.url);
        loadSlotsForSite();
      }
    }
  }, [selectedSite]);

  // Track iframe navigation and update zones
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !selectedSite) return;

    const handleIframeLoad = async () => {
      try {
        let iframeHref;
        try {
          iframeHref = iframe.contentWindow?.location.href;
        } catch (e) {
          console.log('[Visual Editor] CORS restriction on iframe URL');
          return;
        }
        if (!iframeHref) return;

        let actualUrl = iframeHref;
        if (iframeHref.includes('/api/visual-proxy?url=')) {
          try {
            const proxyUrl = new URL(iframeHref);
            const urlParam = proxyUrl.searchParams.get('url');
            if (urlParam) {
              actualUrl = decodeURIComponent(urlParam);
            }
          } catch (e) {
            console.error('[Visual Editor] Failed to parse proxy URL:', e);
          }
        }

        if (!actualUrl.includes(currentUrl)) return;

        const url = new URL(actualUrl);
        const path = url.pathname;

        if (path === currentPath) return;

        console.log('[Visual Editor] Navigation detected:', path);
        setCurrentPath(path);

        const token = localStorage.getItem('token');
        const response = await fetch(
          `https://safewebedit.com/api/wordpress/page-id?url=${encodeURIComponent(path)}&site_id=${selectedSite}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentPageId(data.pageId);
          setCurrentPageTitle(data.title);
          await loadSlotsForSite();
          setMessage(`Navigated to: ${data.title}`);
          setTimeout(() => setMessage(''), 3000);
        }

      } catch (error) {
        console.error('[Visual Editor] Navigation tracking error:', error);
      }
    };

    iframe.addEventListener('load', handleIframeLoad);
    return () => iframe.removeEventListener('load', handleIframeLoad);
  }, [selectedSite, currentPath, currentUrl]);

  // Listen for element and image clicks from iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle image clicks
      if (event.data.type === 'IMAGE_CLICKED') {
        console.log('[Visual Editor] Image clicked:', event.data.data);
        const imageData = event.data.data as ImageData;

        // Close text editor if open
        setEditingSlot(null);

        // Set image editing mode
        setEditingImage(imageData);
        setGeneratedImage('');
        setNewMetadata(null);
        setImagePrompt(''); // Clear old prompt

        // Extract metadata from original image
        const metadata: ImageMetadata = {
          width: imageData.width || 800,
          height: imageData.height || 600,
          format: imageData.src.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          size: 0, // Will be fetched
          aspectRatio: imageData.width && imageData.height
            ? `${imageData.width}:${imageData.height}`
            : 'Unknown'
        };
        setOriginalMetadata(metadata);

        // Fetch image size
        fetchImageSize(imageData.src);

        // Detect text from the image
        detectTextFromImage(imageData.src);

        // ANALYZE IMAGE TO GENERATE PROMPT
        analyzeImageToPrompt(imageData.src);

        return;
      }

      // Handle element clicks (text)
      if (event.data.type === 'ELEMENT_CLICKED') {
        console.log('[Visual Editor] Element clicked:', event.data.data);
        const { cssSelector, textContent, elementText } = event.data.data;

        // Close image editor if open
        setEditingImage(null);

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          setMessage('Creating editable zone...');

          const response = await fetch('https://safewebedit.com/api/auto-discovery/create-slot', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              site_id: selectedSite,
              cssSelector: cssSelector,
              content: textContent,
              elementText: elementText,
              pageId: currentPageId,
              pageTitle: currentPageTitle,
              pageUrl: currentUrl
            })
          });

          if (response.ok) {
            const data = await response.json();
            const slot = data.slot;

            if (data.created) {
              setSlots(prev => [...prev, {
                id: slot.id,
                marker_name: slot.marker_name,
                slot_label: slot.slot_label,
                content: slot.current_content || textContent,
                wp_page_title: slot.wp_page_title,
                wp_page_id: slot.wp_page_id || currentPageId || 0,
                site_name: ''
              }]);
            }

            setEditingSlot({
              id: slot.id,
              marker_name: slot.marker_name,
              slot_label: slot.slot_label,
              content: slot.current_content || textContent,
              wp_page_title: slot.wp_page_title,
              wp_page_id: slot.wp_page_id || currentPageId || 0,
              site_name: ''
            });
            setEditContent(slot.current_content || textContent);
            setMessage('');

          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to create editable zone');
            setTimeout(() => setError(''), 5000);
          }

        } catch (err: any) {
          console.error('[Visual Editor] Error creating slot:', err);
          setError('Failed to create editable zone');
          setTimeout(() => setError(''), 5000);
        }
      }

      if (event.data.type === 'SLOT_CLICKED') {
        const slot = slots.find(s => s.marker_name === event.data.markerName);
        if (slot) {
          setEditingSlot(slot);
          setEditContent(slot.content);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [slots, selectedSite, currentPageId]);

  const fetchImageSize = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      setOriginalMetadata(prev => prev ? { ...prev, size: blob.size } : null);
    } catch (err) {
      console.log('[Visual Editor] Could not fetch image size');
    }
  };

  const detectTextFromImage = async (imageUrl: string) => {
    try {
      setDetectedText('Detecting text...');
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
          const detectedTexts = data.text_regions.map((r: any) => r.text).join(' ');
          setDetectedText(detectedTexts);
          console.log('[Visual Editor] Detected text:', detectedTexts);
        } else {
          setDetectedText('No text detected');
        }
      } else {
        setDetectedText('No text detected');
      }
    } catch (err) {
      console.log('[Visual Editor] Could not detect text from image');
      setDetectedText('Text detection failed');
    }
  };

  const analyzeImageToPrompt = async (imageUrl: string) => {
    try {
      setAnalyzingImage(true);
      setImagePrompt('Analyzing image...');

      const token = localStorage.getItem('token');
      const response = await fetch('https://safewebedit.com/api/ai-image-gen/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setImagePrompt(data.prompt || 'A professional image');
        console.log('[Visual Editor] Generated prompt:', data.prompt);
      } else {
        setImagePrompt('A professional marketing image with gradient background');
      }
    } catch (err) {
      console.log('[Visual Editor] Could not analyze image');
      setImagePrompt('A professional marketing image with gradient background');
    } finally {
      setAnalyzingImage(false);
    }
  };

  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file too large. Maximum size is 10MB');
      return;
    }

    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        // Create image to extract metadata
        const img = new Image();
        img.onload = () => {
          const metadata: ImageMetadata = {
            width: img.width,
            height: img.height,
            format: file.type.split('/')[1].toUpperCase(),
            size: file.size,
            aspectRatio: (img.width / img.height).toFixed(2)
          };

          setGeneratedImage(dataUrl);
          setNewMetadata(metadata);
          setMessage('Image uploaded successfully. Click "Swap Image" to apply.');
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    }
  };

const handleGenerateImage = async () => {
    if (!editingImage || !originalMetadata || !imagePrompt.trim()) {
      setError('Please enter a prompt to generate the image');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setGeneratingImage(true);
    setMessage('Generating image with AI...');
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Build full prompt including detected text if available
      let fullPrompt = imagePrompt.trim();
      if (includeTextInPrompt && detectedText && detectedText !== 'No text detected' && detectedText !== 'Detecting text...' && detectedText !== 'Text detection failed') {
        fullPrompt = `${imagePrompt.trim()}. Include this text in the image: "${detectedText}"`;
      }

      const response = await fetch('https://safewebedit.com/api/ai-image-gen/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          width: originalMetadata.width,
          height: originalMetadata.height,
          user_tier: 'pro'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.image);

        // Extract metadata from generated image
        const base64Data = data.image.split(',')[1];
        const binaryData = atob(base64Data);
        const imageSize = binaryData.length;

        setNewMetadata({
          width: originalMetadata.width,
          height: originalMetadata.height,
          format: 'PNG',
          size: imageSize,
          aspectRatio: originalMetadata.aspectRatio
        });

        setMessage('✓ Image generated! Review and compare metadata.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate image');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError('Failed to generate image');
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSwapImage = async () => {
    if (!editingImage || !generatedImage) return;

    setSaving(true);
    setMessage('Swapping image in WordPress...');

    try {
      const token = localStorage.getItem('token');

      
      console.log("\n" + "=".repeat(80));
      console.log("[FRONTEND] IMAGE SWAP - Starting request");
      console.log("[FRONTEND] Site ID:", selectedSite);
      console.log("[FRONTEND] Page ID:", currentPageId);
      console.log("[FRONTEND] Replacing:", editingImage.src);
      console.log("=".repeat(80));

      const response = await fetch('https://safewebedit.com/api/visual-creator/save-to-wordpress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          site_id: selectedSite,
          image_base64: generatedImage,
          filename: `ai-gen-${Date.now()}.png`,
          replace_image_url: editingImage?.src,
          page_id: currentPageId
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("\n" + "=".repeat(80));
        console.log("[FRONTEND] SWAP RESPONSE:", JSON.stringify(responseData, null, 2));
        console.log("=".repeat(80) + "\n");
        
        setMessage('✓ Image swapped successfully! Refreshing preview...');

        const iframe = document.getElementById('wp-preview') as HTMLIFrameElement;
        if (iframe) {
          setTimeout(() => {
            iframe.src = iframe.src;
            setEditingImage(null);
            setGeneratedImage('');
            setMessage('✓ Image updated successfully!');
            setTimeout(() => setMessage(''), 3000);
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to swap image');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError('Failed to swap image');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const loadSites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://safewebedit.com/api/visual-editor/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
        if (data.sites?.length > 0) {
          setSelectedSite(data.sites[0].id);
          setCurrentUrl(data.sites[0].url);
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

  const loadSlotsForSite = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `https://safewebedit.com/api/content-editor/slots`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (err: any) {
      console.error('Failed to load slots:', err);
    }
  };

  const handleSave = async () => {
    if (!editingSlot) return;

    const token = localStorage.getItem('token');
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `https://safewebedit.com/api/auto-discovery/update-content`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slotId: editingSlot.id,
            content: editContent,
            pageId: currentPageId
          })
        }
      );

      if (response.ok) {
        setMessage('✓ Content saved to WordPress! Refreshing preview...');
        setSlots(prev => prev.map(s =>
          s.id === editingSlot.id ? { ...s, content: editContent } : s
        ));

        const iframe = document.getElementById('wp-preview') as HTMLIFrameElement;
        if (iframe) {
          setTimeout(() => {
            iframe.src = iframe.src;
            setMessage('✓ Content updated successfully!');
            setTimeout(() => setMessage(''), 3000);
          }, 1000);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Calculating...';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
      <div style={{
        padding: '16px 24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Visual Editor</h1>

        <select
          value={selectedSite}
          onChange={(e) => {
            setSelectedSite(e.target.value);
            const site = sites.find(s => s.id === e.target.value);
            if (site) {
              setCurrentUrl(site.url);
            }
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
          Click any text or image to edit
        </div>
      </div>

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

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          flex: (editingSlot || editingImage) ? '0 0 calc(100% - 450px)' : '1',
          backgroundColor: '#f5f5f5',
          position: 'relative',
          overflow: 'hidden',
          transition: 'flex 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {currentUrl ? (
            <iframe ref={iframeRef}
              id="wp-preview"
              src={`https://safewebedit.com/api/visual-proxy?url=${encodeURIComponent(currentUrl)}`}
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

        {/* TEXT EDITOR SIDEBAR */}
        {editingSlot && (
          <div style={{
            flex: '0 0 450px',
            backgroundColor: 'white',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                {editingSlot.slot_label}
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
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

            <div style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                <strong>Page:</strong> {editingSlot.wp_page_title}
              </div>
              <div style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                {editingSlot.marker_name}
              </div>
            </div>

            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '300px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
                placeholder="Enter content..."
              />
            </div>

            <div style={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  backgroundColor: saving ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save to WordPress'}
              </button>
              <button
                onClick={() => {
                  setEditingSlot(null);
                  setEditContent('');
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
          </div>
        )}

        {/* IMAGE AI GENERATION SIDEBAR */}
        {editingImage && (
          <div style={{
            flex: '0 0 450px',
            backgroundColor: 'white',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                🔄 AI Image Generator
              </h3>
              <button
                onClick={() => {
                  setEditingImage(null);
                  setGeneratedImage('');
                }}
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

            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
              {/* Original Image */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                  Original Image
                </h4>
                <img
                  src={editingImage.src}
                  alt="Original"
                  style={{
                    width: '100%',
                    height: 'auto',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}
                />
                {originalMetadata && (
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#4b5563'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Dimensions:</strong></span>
                      <span>{originalMetadata.width} × {originalMetadata.height}px</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Format:</strong></span>
                      <span>{originalMetadata.format}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Size:</strong></span>
                      <span>{formatFileSize(originalMetadata.size)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>Aspect Ratio:</strong></span>
                      <span>{originalMetadata.aspectRatio}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detected Text */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                  Text in Image
                </h4>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#78350f',
                  fontStyle: detectedText === 'Detecting text...' ? 'italic' : 'normal'
                }}>
                  {detectedText || 'Detecting text...'}
                </div>
              </div>

              {/* Prompt Input - PRE-FILLED WITH AI ANALYSIS */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                    Image Prompt {analyzingImage && <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'normal' }}>(Analyzing...)</span>}
                  </h4>
                  {!analyzingImage && imagePrompt && (
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '600' }}>
                      ✓ Auto-generated
                    </span>
                  )}
                </div>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  disabled={analyzingImage}
                  placeholder="AI is analyzing the image to generate a prompt..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    backgroundColor: analyzingImage ? '#f9fafb' : 'white',
                    opacity: analyzingImage ? 0.7 : 1
                  }}
                />
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  💡 This prompt was reverse-engineered from your image. Modify it to change specific aspects.
                </div>
                {detectedText && detectedText !== 'No text detected' && detectedText !== 'Detecting text...' && detectedText !== 'Text detection failed' && (
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', color: '#166534' }}>
                      <input
                        type="checkbox"
                        checked={includeTextInPrompt}
                        onChange={(e) => setIncludeTextInPrompt(e.target.checked)}
                        style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: '600' }}>Include detected text in new image: </span>
                      <span style={{ marginLeft: '4px', fontStyle: 'italic' }}>"{detectedText}"</span>
                    </label>
                    <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', marginLeft: '24px' }}>
                      {includeTextInPrompt ? '✓ Text will be included in AI prompt' : '✗ Text will be omitted from generated image'}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleGenerateImage}
                  disabled={generatingImage || analyzingImage || !imagePrompt.trim()}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    backgroundColor: generatingImage || analyzingImage || !imagePrompt.trim() ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: generatingImage || analyzingImage || !imagePrompt.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {generatingImage ? '🎨 Generating...' : '✨ Generate Image'}
                </button>

                {/* Upload Option */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    — or —
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzingImage || generatingImage}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: analyzingImage || generatingImage ? '#d1d5db' : 'white',
                      color: analyzingImage || generatingImage ? '#9ca3af' : '#3b82f6',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: analyzingImage || generatingImage ? 'not-allowed' : 'pointer'
                    }}
                  >
                    📤 Upload Your Own Image
                  </button>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginTop: '6px',
                    textAlign: 'center'
                  }}>
                    Max 10MB • JPG, PNG, WEBP
                  </div>
                </div>
              </div>

              {/* Generated Image */}
              {generatedImage && newMetadata && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                    Generated Image
                  </h4>
                  <img
                    src={generatedImage}
                    alt="Generated"
                    style={{
                      width: '100%',
                      height: 'auto',
                      border: '2px solid #10b981',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}
                  />
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#065f46'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Dimensions:</strong></span>
                      <span>{newMetadata.width} × {newMetadata.height}px</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Format:</strong></span>
                      <span>{newMetadata.format}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Size:</strong></span>
                      <span>{formatFileSize(newMetadata.size)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>Aspect Ratio:</strong></span>
                      <span>{newMetadata.aspectRatio}</span>
                    </div>
                  </div>

                  {/* Metadata Comparison */}
                  {originalMetadata && (
                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '6px' }}>
                        ✓ Metadata Match
                      </div>
                      <div style={{ fontSize: '11px', color: '#3730a3' }}>
                        {newMetadata.width === originalMetadata.width && newMetadata.height === originalMetadata.height
                          ? '✓ Dimensions match perfectly'
                          : '🔧 Will auto-resize to match original'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: '8px'
            }}>
              {generatedImage ? (
                <>
                  <button
                    onClick={handleSwapImage}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      backgroundColor: saving ? '#ccc' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? 'Swapping...' : '🔄 Swap Image'}
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedImage('');
                      setNewMetadata(null);
                    }}
                    disabled={saving}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'white',
                      color: '#666',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditingImage(null);
                    setImagePrompt('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'white',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
