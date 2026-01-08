'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// PLATFORM CONFIGURATION
// All supported and planned platforms
// ============================================
const PLATFORMS = {
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    icon: '📝',
    color: '#21759b',
    available: true,
    description: 'World\'s most popular CMS'
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    color: '#96bf48',
    available: true,
    description: 'E-commerce platform'
  },
  wix: {
    id: 'wix',
    name: 'Wix',
    icon: '🎨',
    color: '#0c6ebd',
    available: false,
    description: 'Website builder'
  },
  squarespace: {
    id: 'squarespace',
    name: 'Squarespace',
    icon: '⬛',
    color: '#000000',
    available: false,
    description: 'All-in-one platform'
  },
  webflow: {
    id: 'webflow',
    name: 'Webflow',
    icon: '🌊',
    color: '#4353ff',
    available: false,
    description: 'Visual web design'
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    icon: '👻',
    color: '#15171a',
    available: true,
    description: 'Modern publishing platform'
  },
  drupal: {
    id: 'drupal',
    name: 'Drupal',
    icon: '💧',
    color: '#0077c0',
    available: false,
    description: 'Enterprise CMS'
  },
  joomla: {
    id: 'joomla',
    name: 'Joomla',
    icon: '🔷',
    color: '#f44321',
    available: false,
    description: 'Open source CMS'
  },
  custom: {
    id: 'custom',
    name: 'Custom/Other',
    icon: '⚙️',
    color: '#6c757d',
    available: false,
    description: 'Custom built sites'
  }
} as const;

type PlatformId = keyof typeof PLATFORMS;

interface Website {
  id: string;
  url: string;
  name: string;
  platform: PlatformId;
  created_at: string;
  status?: 'active' | 'inactive' | 'error';
}

export default function WebsitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | PlatformId>('all');
  const [formData, setFormData] = useState({
    platform: 'wordpress' as PlatformId,
    url: '',
    username: '',
    password: '',
    access_token: '' // For Shopify
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      const response = await fetch('https://safewebedit.com/api/wordpress/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map sites and add platform field (default to wordpress for now)
        const mappedSites = (data.sites || []).map((site: any) => ({
          ...site,
          platform: site.platform || 'wordpress',
          status: site.status || 'active'
        }));
        setSites(mappedSites);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Check if platform is available
    if (!PLATFORMS[formData.platform].available) {
      setError(`${PLATFORMS[formData.platform].name} support is coming soon! Currently WordPress, Shopify, and Ghost are available.`);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      let apiUrl, requestBody;

      if (formData.platform === "shopify") {
        // Shopify OAuth - redirect to authorization
        const shopDomain = formData.url.trim().replace(/^https?:\/\//, '').split('.')[0];
        window.location.href = `https://safewebedit.com/api/shopify/oauth/install?shop=${encodeURIComponent(shopDomain)}&organization_id=${token}`;
        return;
      } else {
        // WordPress API endpoint (default)
        apiUrl = "https://safewebedit.com/api/wordpress/connect";
        requestBody = {
          site_url: formData.url,
          site_name: new URL(formData.url).hostname,
          wp_username: formData.username,
          wp_app_password: formData.password,
          platform: formData.platform
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          site_url: formData.url,
          site_name: new URL(formData.url).hostname,
          wp_username: formData.username,
          wp_app_password: formData.password,
          platform: formData.platform
        })
      });

      if (response.ok) {
        setMessage(`✓ ${PLATFORMS[formData.platform].name} site added successfully`);
        setFormData({ platform: 'wordpress', url: '', username: '', password: '', access_token: '' });
        setShowAddForm(false);
        loadSites();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add site');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add site');
    }
  };

  const handleRemoveSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to remove this site?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://safewebedit.com/api/wordpress/sites/${siteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✓ Site removed successfully');
        loadSites();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove site');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove site');
    }
  };

  // Filter sites by platform
  const filteredSites = selectedPlatformFilter === 'all'
    ? sites
    : sites.filter(site => site.platform === selectedPlatformFilter);

  // Count sites per platform
  const platformCounts = Object.keys(PLATFORMS).reduce((acc, key) => {
    const platformId = key as PlatformId;
    acc[platformId] = sites.filter(s => s.platform === platformId).length;
    return acc;
  }, {} as Record<PlatformId, number>);

  const totalSites = sites.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
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

  // Get platform-specific instructions
  const getPlatformInstructions = (platform: PlatformId) => {
    const instructions: Record<PlatformId, string> = {
      wordpress: 'Create an Application Password in WordPress: Users → Profile → Application Passwords',
      shopify: 'After clicking Connect, you will be redirected to Shopify to authorize SafeWebEdit. Just click Install and you are done!',
      wix: 'Connect via Wix API (coming soon)',
      squarespace: 'Use your Squarespace account credentials (coming soon)',
      webflow: 'Connect via Webflow API (coming soon)',
      ghost: 'Get your Admin API Key from Ghost Admin → Integrations → Add custom integration → Copy API Key',
      drupal: 'Use your Drupal REST API credentials (coming soon)',
      joomla: 'Connect via Joomla API (coming soon)',
      custom: 'Contact support for custom integration options (coming soon)'
    };
    return instructions[platform];
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Websites</h1>
          <p style={{ color: '#666', margin: 0 }}>
            Manage all your websites in one place • {totalSites} {totalSites === 1 ? 'site' : 'sites'} connected
          </p>
        </div>
        <Link href="/dashboard" style={{
          padding: '10px 20px',
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          ← Dashboard
        </Link>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '6px',
          color: '#155724',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Platform Filter Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '16px',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* All Sites Tab */}
          <button
            onClick={() => setSelectedPlatformFilter('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedPlatformFilter === 'all' ? '#007bff' : 'transparent',
              color: selectedPlatformFilter === 'all' ? 'white' : '#333',
              border: selectedPlatformFilter === 'all' ? 'none' : '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>🌐</span>
            <span>All Sites</span>
            <span style={{
              padding: '2px 8px',
              backgroundColor: selectedPlatformFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {totalSites}
            </span>
          </button>

          {/* Platform Tabs */}
          {Object.values(PLATFORMS).map(platform => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatformFilter(platform.id)}
              disabled={!platform.available && platformCounts[platform.id] === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedPlatformFilter === platform.id ? platform.color : 'transparent',
                color: selectedPlatformFilter === platform.id ? 'white' : '#333',
                border: selectedPlatformFilter === platform.id ? 'none' : '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: platform.available || platformCounts[platform.id] > 0 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: !platform.available && platformCounts[platform.id] === 0 ? 0.5 : 1,
                transition: 'all 0.2s',
                position: 'relative'
              }}
              title={!platform.available ? `${platform.name} - Coming Soon` : platform.description}
            >
              <span>{platform.icon}</span>
              <span>{platform.name}</span>
              {platformCounts[platform.id] > 0 && (
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: selectedPlatformFilter === platform.id ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {platformCounts[platform.id]}
                </span>
              )}
              {!platform.available && platformCounts[platform.id] === 0 && (
                <span style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid #90caf9'
                }}>
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Website Form */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            <span>Add Website</span>
          </button>
        ) : (
          <form onSubmit={handleAddSite}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Add New Website</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>

            {/* Platform Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                Platform *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {Object.values(PLATFORMS).map(platform => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, platform: platform.id })}
                    disabled={!platform.available}
                    style={{
                      padding: '16px',
                      backgroundColor: formData.platform === platform.id ? platform.color : 'white',
                      color: formData.platform === platform.id ? 'white' : '#333',
                      border: formData.platform === platform.id ? 'none' : '2px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: platform.available ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: !platform.available ? 0.4 : 1,
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    title={!platform.available ? `${platform.name} - Coming Soon` : platform.description}
                  >
                    <span style={{ fontSize: '24px' }}>{platform.icon}</span>
                    <span style={{ fontSize: '13px', textAlign: 'center' }}>{platform.name}</span>
                    {!platform.available && (
                      <span style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        borderRadius: '4px',
                        fontWeight: '600',
                        position: 'absolute',
                        top: '8px',
                        right: '8px'
                      }}>
                        SOON
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Form Fields Based on Platform */}
            {formData.platform === 'shopify' ? (
              /* Shopify OAuth - Only Shop Domain */
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                  Shop Domain *
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="mystore or mystore.myshopify.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#96bf48'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '6px', lineHeight: '1.5' }}>
                  {getPlatformInstructions('shopify')}
                </p>
              </div>
            ) : formData.platform === 'ghost' ? (
              /* Ghost - Site URL + Admin API Key */
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Ghost Site URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://your-ghost-site.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#15171a'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Admin API Key *
                  </label>
                  <input
                    type="password"
                    value={formData.access_token}
                    onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                    placeholder="64ab1c2d3e4f5g6h7i8j9k0l:1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#15171a'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px', lineHeight: '1.5' }}>
                    {getPlatformInstructions('ghost')}
                  </p>
                </div>
              </>
            ) : (
              /* WordPress - Username + Password */
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Website URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21759b'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Admin Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="admin"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21759b'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Application Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="•••• •••• •••• ••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#21759b'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px', lineHeight: '1.5' }}>
                    {getPlatformInstructions('wordpress')}
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!PLATFORMS[formData.platform].available}
              style={{
                padding: '12px 24px',
                backgroundColor: PLATFORMS[formData.platform].available ? PLATFORMS[formData.platform].color : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: PLATFORMS[formData.platform].available ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{PLATFORMS[formData.platform].icon}</span>
              <span>Add {PLATFORMS[formData.platform].name} Site</span>
            </button>
          </form>
        )}
      </div>

      {/* Sites List */}
      {filteredSites.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '64px 24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            {selectedPlatformFilter === 'all'
              ? 'No websites added yet'
              : `No ${PLATFORMS[selectedPlatformFilter].name} sites added yet`
            }
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Click "Add Website" above to connect your first site
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredSites.map((site) => {
            const platform = PLATFORMS[site.platform];
            return (
              <div
                key={site.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${platform.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      {site.name || new URL(site.url).hostname}
                    </h3>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: `${platform.color}15`,
                      color: platform.color,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{platform.icon}</span>
                      <span>{platform.name}</span>
                    </span>
                    {site.status === 'active' && (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        ● ACTIVE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{site.url}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Added {new Date(site.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleRemoveSite(site.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#dc3545',
                      border: '1px solid #dc3545',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc3545';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#dc3545';
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
