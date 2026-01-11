'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CreditBalanceWidget from '@/components/CreditBalanceWidget';

// ============================================
// TAB CONFIGURATION
// Add new tabs here - that's it!
// ============================================
const DASHBOARD_TABS = [
  { id: 'home', label: 'Home', path: '/dashboard', icon: '🏠' },
  { id: 'wordpress', label: 'Websites', path: '/dashboard/wordpress', icon: '🌐' },
  { id: 'visual', label: 'Visual Editor', path: '/dashboard/visual', icon: '🎨' },
  { id: 'credits', label: 'Credits', path: '/dashboard/credits', icon: '💳' },
  { id: 'settings', label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("[LOGOUT] Error:", error);
      localStorage.clear();
      router.push("/login");
    }
  };

  const isActiveTab = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? '60px' : '240px',
          backgroundColor: '#2c3e50',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100
        }}
      >
        {/* Header */}
        <div style={{
          padding: sidebarCollapsed ? '20px 10px' : '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!sidebarCollapsed && (
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>SafeWebEdit</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px'
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {DASHBOARD_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: sidebarCollapsed ? '12px 16px' : '12px 20px',
                textDecoration: 'none',
                color: isActiveTab(tab.path) ? '#fff' : 'rgba(255,255,255,0.7)',
                backgroundColor: isActiveTab(tab.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActiveTab(tab.path) ? '3px solid #3498db' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
              title={sidebarCollapsed ? tab.label : undefined}
            >
              <span style={{ fontSize: '20px', minWidth: '20px' }}>{tab.icon}</span>
              {!sidebarCollapsed && (
                <span style={{ fontSize: '14px', fontWeight: isActiveTab(tab.path) ? '600' : '400' }}>
                  {tab.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: sidebarCollapsed ? '12px 10px' : '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Credit Balance Widget */}
        <CreditBalanceWidget collapsed={sidebarCollapsed} />

        <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: sidebarCollapsed ? '8px' : '10px 12px',
              background: 'rgba(231, 76, 60, 0.2)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '60px' : '240px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}
