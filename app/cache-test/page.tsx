'use client';

import { useEffect, useState } from 'react';

export default function CacheTestPage() {
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const BUILD_VERSION = 'CLIENT_v4.0_' + Date.now();
  
  useEffect(() => {
    // Immediate console log
    console.log('🔴🔴🔴 CACHE TEST PAGE LOADED! Version:', BUILD_VERSION);
    
    // Fetch server diagnostics
    fetch('https://safewebedit.com/api/diagnostics')
      .then(r => r.json())
      .then(data => {
        setServerInfo(data);
        setLoading(false);
        console.log('✅ Server diagnostics:', data);
      })
      .catch(err => {
        console.error('❌ Failed to load diagnostics:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#00ff00', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#00ff00' }}>
        🔬 CACHE DIAGNOSTIC PAGE
      </h1>
      
      <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#ffff00' }}>
          👁️ CLIENT INFO (What YOUR browser loaded)
        </h2>
        <p><strong>Client Version:</strong> {BUILD_VERSION}</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
      </div>

      {loading ? (
        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
          <p>Loading server info...</p>
        </div>
      ) : serverInfo ? (
        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#ffff00' }}>
            🖥️ SERVER INFO (What VPS has deployed)
          </h2>
          <p><strong>Server:</strong> {serverInfo.server}</p>
          <p><strong>Build ID:</strong> {serverInfo.buildId}</p>
          <p><strong>Git Branch:</strong> {serverInfo.gitBranch}</p>
          <p><strong>Last Modified:</strong> {serverInfo.visualPageTsxModified}</p>
          <p><strong>File Lines:</strong> {serverInfo.visualPageLineCount}</p>
          
          <h3 style={{ fontSize: '16px', marginTop: '20px', marginBottom: '10px', color: '#00ffff' }}>
            Code Verification:
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>Cache Busting: {serverInfo.codeChecks.hasCacheBustingCode ? '✅' : '❌'}</li>
            <li>Test Button: {serverInfo.codeChecks.hasTestButton ? '✅' : '❌'}</li>
            <li>Component Logs: {serverInfo.codeChecks.hasComponentRenderLog ? '✅' : '❌'}</li>
            <li>Listener Status: {serverInfo.codeChecks.hasListenerStatus ? '✅' : '❌'}</li>
          </ul>
          
          <h3 style={{ fontSize: '16px', marginTop: '20px', marginBottom: '10px', color: '#00ffff' }}>
            Recent Commits:
          </h3>
          <ul style={{ fontSize: '12px', lineHeight: '1.8' }}>
            {serverInfo.recentCommits.map((commit: string, i: number) => (
              <li key={i}>{commit}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px', color: '#ff0000' }}>
          <p>❌ Failed to load server info</p>
        </div>
      )}

      <div style={{ backgroundColor: '#ff4444', padding: '20px', borderRadius: '8px', marginTop: '20px', color: '#fff' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>
          ⚠️ NEXT STEPS
        </h2>
        <ol style={{ lineHeight: '2' }}>
          <li>Check the console for "🔴🔴🔴 CACHE TEST PAGE LOADED" message</li>
          <li>Verify the Client Version timestamp is recent</li>
          <li>Compare Build IDs between client and server</li>
          <li>If server checks all pass (✅) but Visual Editor still broken → Browser Cache Issue</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a 
          href="/dashboard/visual" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            backgroundColor: '#00ff00', 
            color: '#000', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          → Go to Visual Editor
        </a>
      </div>
    </div>
  );
}
