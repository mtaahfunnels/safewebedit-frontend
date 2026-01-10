'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function OnboardPage() {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const processingSteps = [
    'Creating your account...',
    'Setting up your workspace...',
    'Preparing payment...',
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(processingSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Submit to backend
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert('Onboarding failed: ' + (data.error || 'Unknown error'));
        setIsSubmitting(false);
        setProcessingStep('');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert('Error during onboarding: ' + error.message);
      setIsSubmitting(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to SafeWebEdit</h1>
          <p className="text-lg text-gray-600">
            Edit your website without the complex dashboard
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          {isSubmitting ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">
                {processingStep}
              </p>
              <p className="text-gray-600">Please wait while we set up your account</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Get started with your 14-day free trial
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Plan Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SafeWebEdit Professional</span>
                      <span className="font-semibold">$5.99/month</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>✓ Visual website editing</div>
                      <div>✓ Up to 5 websites</div>
                      <div>✓ Unlimited edits</div>
                      <div>✓ Real-time updates</div>
                      <div>✓ Priority support</div>
                    </div>
                  </div>
                  <div className="border-t border-purple-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      14-day free trial, then $5.99/month
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Due Today</span>
                      <span className="text-2xl font-bold text-purple-600">$0.00</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                  Start Free Trial
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy.<br />
                  Add your websites after signup. WordPress supported now, more platforms coming soon.
                </p>
              </div>
            </form>
          )}
        </Card>

        {/* Trust Indicators */}
        {!isSubmitting && (
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
