'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Syncs NextAuth session token to localStorage for API calls
 */
export default function AuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const token = (session.user as any).accessToken;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('organizationId', (session.user as any).organizationId || '');
        console.log('[AuthSync] Token synced to localStorage');
      }
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('token');
      localStorage.removeItem('organizationId');
      console.log('[AuthSync] Token removed from localStorage');
    }
  }, [session, status]);

  return null;
}
