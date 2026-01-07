'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Slot {
  id: string;
  slot_label: string;
  slot_name: string;
  marker_name: string;
  wp_page_title: string;
  site_name: string;
  content: string;
  error?: string;
}

export default function ContentEditorPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://safewebedit.com/api/content-editor/slots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);

        // Initialize edit content
        const initialContent: { [key: string]: string } = {};
        data.slots.forEach((slot: Slot) => {
          initialContent[slot.id] = slot.content;
        });
        setEditContent(initialContent);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slotId: string) => {
    setEditingSlot(slotId);
  };

  const handleCancel = (slotId: string) => {
    // Reset to original content
    const originalSlot = slots.find(s => s.id === slotId);
    if (originalSlot) {
      setEditContent(prev => ({ ...prev, [slotId]: originalSlot.content }));
    }
    setEditingSlot(null);
  };

  const handleSave = async (slotId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setSaving(slotId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`https://safewebedit.com/api/content-editor/slots/${slotId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent[slotId] })
      });

      if (response.ok) {
        // Update local state
        setSlots(prev => prev.map(slot =>
          slot.id === slotId ? { ...slot, content: editContent[slotId] } : slot
        ));
        setMessage('✓ Content updated successfully!');
        setEditingSlot(null);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save content');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save content');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(null);
    }
  };

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
          <p style={{ marginTop: '16px', color: '#666' }}>Loading content...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Content Editor</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Edit your WordPress content directly from here</p>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '16px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {slots.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '48px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
            No content slots found. Create slots first to start editing.
          </p>
          <button
            onClick={() => router.push('/dashboard/slots')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Create Slots
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '24px',
                border: editingSlot === slot.id ? '2px solid #007bff' : '1px solid #e0e0e0'
              }}
            >
              {/* Slot Header */}
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #e0e0e0', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>
                  {slot.slot_label}
                </h3>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {slot.site_name} → {slot.wp_page_title}
                </div>
              </div>

              {/* Content Editor */}
              {editingSlot === slot.id ? (
                <div>
                  <textarea
                    value={editContent[slot.id] || ''}
                    onChange={(e) => setEditContent(prev => ({ ...prev, [slot.id]: e.target.value }))}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '12px'
                    }}
                    placeholder="Enter your content here..."
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleSave(slot.id)}
                      disabled={saving === slot.id}
                      style={{
                        padding: '8px 20px',
                        backgroundColor: saving === slot.id ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving === slot.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {saving === slot.id ? 'Saving...' : '💾 Save to WordPress'}
                    </button>
                    <button
                      onClick={() => handleCancel(slot.id)}
                      disabled={saving === slot.id}
                      style={{
                        padding: '8px 20px',
                        backgroundColor: 'white',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: saving === slot.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {slot.error ? (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '4px',
                      color: '#856404',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}>
                      {slot.error}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        minHeight: '100px',
                        marginBottom: '12px',
                        fontSize: '14px',
                        color: '#333',
                        whiteSpace: 'pre-wrap'
                      }}
                      dangerouslySetInnerHTML={{ __html: slot.content || '<em style="color: #999;">No content yet</em>' }}
                    />
                  )}
                  <button
                    onClick={() => handleEdit(slot.id)}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    ✏️ Edit Content
                  </button>
                </div>
              )}
            </div>
          ))}
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
