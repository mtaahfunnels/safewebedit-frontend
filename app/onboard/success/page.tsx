'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus(sessionId);
    } else {
      setStatus('error');
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const checkPaymentStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/onboard/session/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setCustomerEmail(data.customer_email);

        if (data.payment_status === 'paid' && data.status === 'complete') {
          setStatus('success');
        } else {
          setTimeout(() => checkPaymentStatus(sessionId), 2000);
        }
      } else {
        setStatus('error');
        setError(data.error || 'Failed to verify payment');
      }
    } catch (err: any) {
      setStatus('error');
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          {loading || status === 'processing' ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your subscription...
              </p>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to SafeWebEdit! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your account has been successfully created
              </p>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-8 mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Mail className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-purple-900">
                    Check Your Email
                  </h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  We've sent a password setup link to:
                </p>
                <p className="font-mono text-lg bg-white px-4 py-3 rounded-lg border-2 border-purple-300 text-center mb-4 text-purple-900 font-semibold">
                  {customerEmail}
                </p>
                <div className="bg-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-900 text-center font-medium">
                    📧 Click the link in your email to create your password and access your dashboard
                  </p>
                  <p className="text-xs text-purple-700 text-center mt-2">
                    (Link expires in 48 hours)
                  </p>
                </div>
              </div>

              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="px-8 py-6 text-lg border-2"
              >
                Already set your password? Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 mt-6">
                Need help? Contact us at support@safewebedit.com
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-gray-600 mb-8">
                {error || 'We could not verify your payment. Please contact support.'}
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/onboard'}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = 'mailto:support@safewebedit.com'}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function OnboardSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
