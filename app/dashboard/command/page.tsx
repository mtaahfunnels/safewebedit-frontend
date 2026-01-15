'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Site {
  id: string;
  name: string;
  url: string;
}

export default function CommandCenter() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [command, setCommand] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    loadSites();
  }, []);

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

  const executeCommand = async () => {
    if (!command.trim() || !selectedSite) return;

    setProcessing(true);
    setResult(null);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://safewebedit.com/api/command', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: command.trim(),
          site_id: selectedSite
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Refresh preview after successful update
        setTimeout(() => {
          setPreviewKey(prev => prev + 1);
          setCommand('');
        }, 1500);
      }

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to execute command'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      executeCommand();
    }
  };

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  const currentSite = sites.find(s => s.id === selectedSite);
  const currentUrl = currentSite?.url || '';

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      position: 'relative'
    }}>
      {/* Left Panel - Command Interface */}
      <div style={{
        width: '420px',
        backgroundColor: 'white',
        borderRight: '1px solid #e0e0e0',
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#1a1a1a'
          }}>
            AI Command Center
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '16px'
          }}>
            Tell us what to change. Watch it happen live.
          </p>

          {/* Site Selector */}
          {sites.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                Editing Site:
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Example Commands */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <p style={{
            fontWeight: '600',
            marginBottom: '8px',
            color: '#333'
          }}>
            Try commands like:
          </p>
          <ul style={{
            margin: 0,
            paddingLeft: '16px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            <li>Change the hero to Welcome Home</li>
            <li>Update homepage title to Get Started</li>
            <li>Replace about page intro with [text]</li>
          </ul>
        </div>

        {/* Command Input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
            Your Command:
          </label>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your command here..."
            disabled={processing}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '2px solid #e0e0e0',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              backgroundColor: processing ? '#f5f5f5' : 'white'
            }}
          />
          <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Press Cmd/Ctrl + Enter to execute
          </p>
        </div>

        {/* Execute Button */}
        <button
          onClick={executeCommand}
          disabled={processing || !command.trim() || !selectedSite}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: processing ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: processing || !command.trim() ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            opacity: (!command.trim() || !selectedSite) ? 0.5 : 1
          }}
        >
          {processing ? 'Processing...' : 'Execute Command'}
        </button>

        {/* Result Display */}
        {result && (
          <div style={{
            padding: '12px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <div style={{
              fontWeight: '600',
              marginBottom: '8px',
              color: result.success ? '#155724' : '#721c24'
            }}>
              {result.success ? 'Success!' : 'Error'}
            </div>
            <div style={{
              color: result.success ? '#155724' : '#721c24',
              marginBottom: '8px',
              lineHeight: '1.5'
            }}>
              {result.message}
            </div>
            {result.changes && result.changes.length > 0 && (
              <ul style={{
                margin: 0,
                paddingLeft: '16px',
                fontSize: '12px',
                color: '#155724',
                lineHeight: '1.6'
              }}>
                {result.changes.map((change: string, i: number) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Help Text */}
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#666',
          lineHeight: '1.5',
          marginTop: 'auto'
        }}>
          <strong>Pro tip:</strong> Be specific about which page and section you want to change. The system will find the right zone and update it safely.
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        position: 'relative'
      }}>
        {/* Preview Header */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '13px', color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Preview: {currentUrl || 'Select a site'}
          </div>
          <button
            onClick={refreshPreview}
            disabled={!currentUrl}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: currentUrl ? 'pointer' : 'not-allowed',
              marginLeft: '12px'
            }}
          >
            Refresh
          </button>
        </div>

        {/* Preview Iframe */}
        {currentUrl ? (
          <iframe
            key={previewKey}
            src={`https://safewebedit.com/api/visual-proxy?url=${encodeURIComponent(currentUrl)}&_t=${Date.now()}`}
            style={{
              flex: 1,
              width: '100%',
              border: 'none'
            }}
          />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            Select a site to see preview
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            zIndex: 1000
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid white',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '16px'
            }}></div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              Updating your website...
            </div>
            <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
              This will only take a moment
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
