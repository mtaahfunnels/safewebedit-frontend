'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageOverlayEditor, { OverlayConfig } from '../../../components/ImageOverlayEditor';
import TextReplacementModal from '../../../components/TextReplacementModal';
import SwapImageModal from '../../../components/SwapImageModal';

interface Site {
  id: string;
  name: string;
  site_url: string;
}

interface Page {
  id: number;
  title: string;
  link: string;
}

interface Image {
  id: string;
  src: string;
  alt: string;
  width: string;
  height: string;
  selector: string;
  hasOverlay: boolean;
}

export default function ImageOverlay() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [savingOverlay, setSavingOverlay] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTextReplacementOpen, setIsTextReplacementOpen] = useState(false);
  const [isSwapImageOpen, setIsSwapImageOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadPages();
    }
  }, [selectedSite]);

  useEffect(() => {
    if (selectedPage) {
      loadImages();
    }
  }, [selectedPage]);

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
      showMessage('error', 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    if (!selectedSite) return;

    setLoadingPages(true);
    const token = localStorage.getItem('token');
    const site = sites.find(s => s.id === selectedSite);
    if (!site) return;

    try {
      const response = await fetch(`${site.site_url}/wp-json/wp/v2/pages?per_page=50&_fields=id,title,link`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.map((p: any) => ({
          id: p.id,
          title: p.title?.rendered || 'Untitled',
          link: p.link
        })));
        if (data.length > 0) {
          setSelectedPage(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
      showMessage('error', 'Failed to load pages');
    } finally {
      setLoadingPages(false);
    }
  };

  const loadImages = async () => {
    if (!selectedPage) return;

    setLoadingImages(true);
    const token = localStorage.getItem('token');
    const site = sites.find(s => s.id === selectedSite);
    if (!site) return;

    const page = pages.find(p => p.id === selectedPage);
    if (!page) return;

    try {
      const response = await fetch('https://safewebedit.com/api/image-overlay/detect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: page.link })
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        showMessage('error', 'Failed to detect images');
      }
    } catch (err) {
      console.error('Failed to load images:', err);
      showMessage('error', 'Failed to load images');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleEditImage = (image: Image) => {
    setSelectedImage(image);
    setIsEditorOpen(true);
  };

  const handleSaveOverlay = async (overlay: OverlayConfig) => {
    if (!selectedImage || !selectedSite || !selectedPage) return;

    setSavingOverlay(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://safewebedit.com/api/image-overlay/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_id: selectedSite,
          page_id: selectedPage,
          image_src: selectedImage.src,
          overlay: overlay
        })
      });

      if (response.ok) {
        showMessage('success', 'Text overlay saved successfully!');
        setIsEditorOpen(false);
        setSelectedImage(null);
        // Reload images to reflect changes
        await loadImages();
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to save overlay');
      }
    } catch (err) {
      console.error('Failed to save overlay:', err);
      showMessage('error', 'Failed to save overlay');
    } finally {
      setSavingOverlay(false);
    }
  };

  const handleReplaceText = (image: Image) => {
    setSelectedImage(image);
    setIsTextReplacementOpen(true);
  };

  const handleTextReplacementComplete = async (processedImageBase64: string) => {
    if (!selectedImage || !selectedSite) return;

    setSavingOverlay(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://safewebedit.com/api/image-text/save-to-wordpress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          site_id: selectedSite,
          processed_image_base64: processedImageBase64,
          filename: `replaced-${Date.now()}.png`,
          original_image_id: selectedImage.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', 'Text replaced and saved to WordPress!');
        setIsTextReplacementOpen(false);
        setSelectedImage(null);
        await loadImages();
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to save image');
      }
    } catch (err) {
      console.error('Failed to save replaced image:', err);
      showMessage('error', 'Failed to save image to WordPress');
    } finally {
      setSavingOverlay(false);
    }
  };

  const handleSwapImage = (image: Image) => {
    setSelectedImage(image);
    setIsSwapImageOpen(true);
  };

  const handleSwapComplete = async () => {
    showMessage('success', 'Image swapped successfully!');
    setIsSwapImageOpen(false);
    setSelectedImage(null);
    await loadImages();
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading sites...</p>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Sites Connected</h2>
        <p>Please connect a WordPress site first.</p>
        <button
          onClick={() => router.push('/dashboard/sites')}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Connect a Site
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
        Image Text Overlay
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Add text overlays to images on your WordPress pages without editing the image files
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

      {/* Site and Page Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Select WordPress Site
          </label>
          <select
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              setPages([]);
              setImages([]);
              setSelectedPage(null);
            }}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.site_url})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Select Page
          </label>
          <select
            value={selectedPage || ''}
            onChange={(e) => {
              setSelectedPage(parseInt(e.target.value));
              setImages([]);
            }}
            disabled={loadingPages}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="">
              {loadingPages ? 'Loading pages...' : 'Select a page'}
            </option>
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Images Grid */}
      {loadingImages ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#666' }}>Loading images...</p>
        </div>
      ) : images.length === 0 && selectedPage ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <p style={{ color: '#666', fontSize: '16px' }}>No images found on this page</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>
            Try selecting a different page or add images to your WordPress page first
          </p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
              Images on Page ({images.length})
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Click an image to add or edit text overlay
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => handleEditImage(image)}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backgroundColor: 'white',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    height: '200px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
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
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <div style={{ padding: '12px' }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {image.alt || 'Untitled image'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {image.width} × {image.height}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwapImage(image);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Swap Image
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(image);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Overlay
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceText(image);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Overlay Editor Modal */}
      <ImageOverlayEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedImage(null);
        }}
        onSave={handleSaveOverlay}
        image={selectedImage}
        existingOverlay={null}
      />

      {/* Text Replacement Modal */}
      {selectedImage && (
        <TextReplacementModal
          isOpen={isTextReplacementOpen}
          onClose={() => {
            setIsTextReplacementOpen(false);
            setSelectedImage(null);
          }}
          imageUrl={selectedImage.src}
          onReplacementComplete={handleTextReplacementComplete}
        />
      )}

      {/* Swap Image Modal */}
      {selectedImage && selectedSite && selectedPage && (
        <SwapImageModal
          isOpen={isSwapImageOpen}
          onClose={() => {
            setIsSwapImageOpen(false);
            setSelectedImage(null);
          }}
          imageUrl={selectedImage.src}
          imageWidth={selectedImage.width}
          imageHeight={selectedImage.height}
          siteId={selectedSite}
          pageId={selectedPage}
          onSwapComplete={handleSwapComplete}
        />
      )}

      {savingOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: '600' }}>Saving overlay...</p>
          </div>
        </div>
      )}
    </div>
  );
}
