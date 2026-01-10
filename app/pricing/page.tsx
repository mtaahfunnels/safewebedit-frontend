"use client";

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
      {/* Navigation */}
      <nav style={{
        position: "sticky",
        top: 0,
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        padding: "16px 0",
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Link href="/" style={{ fontSize: "24px", fontWeight: "700", color: "#007bff", textDecoration: "none" }}>
            SafeWebEdit
          </Link>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <Link href="/" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Home</Link>
            <Link href="/features" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Features</Link>
            <Link href="/pricing" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Pricing</Link>
            <Link href="/faq" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>FAQ</Link>
            <Link href="/about" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>About</Link>
            <Link href="/contact" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
            <Link href="/dashboard" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Business Portal</Link>
            <Link href="/onboard" style={{
              padding: "10px 24px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "80px 24px 60px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "16px" }}>
            Try Free, Upgrade for AI
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95 }}>
            Discover zones for free. Unlock AI editing when ready.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "32px"
          }}>
            {/* Free Plan */}
            <div style={{
              padding: "48px 32px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "2px solid #e0e0e0",
              textAlign: "center"
            }}>
              <h3 style={{ fontSize: "24px", marginBottom: "8px", color: "#333" }}>Free Discovery</h3>
              <div style={{ fontSize: "56px", fontWeight: "700", marginBottom: "8px", color: "#333" }}>$0</div>
              <div style={{ marginBottom: "32px", color: "#666" }}>forever</div>
              <div style={{ textAlign: "left", marginBottom: "32px", color: "#333" }}>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>✓</span> Platform detection
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>✓</span> Zone discovery
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>✓</span> Visual preview
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>✓</span> No signup required
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0", opacity: 0.4 }}>
                  <span style={{ color: "#999" }}>✗</span> Edit text
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0", opacity: 0.4 }}>
                  <span style={{ color: "#999" }}>✗</span> AI image generation
                </div>
                <div style={{ padding: "12px 0", opacity: 0.4 }}>
                  <span style={{ color: "#999" }}>✗</span> Image swapping
                </div>
              </div>
              <Link href="/" style={{
                display: "block",
                padding: "14px",
                backgroundColor: "#f0f0f0",
                color: "#333",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600"
              }}>
                Try Now
              </Link>
            </div>

            {/* Pro Plan */}
            <div style={{
              padding: "48px 32px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "16px",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 8px 24px rgba(0,123,255,0.3)"
            }}>
              <div style={{
                position: "absolute",
                top: "-16px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#28a745",
                color: "white",
                padding: "6px 20px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: "24px", marginBottom: "8px" }}>Pro</h3>
              <div style={{ fontSize: "56px", fontWeight: "700", marginBottom: "8px" }}>$29</div>
              <div style={{ marginBottom: "32px", opacity: 0.9 }}>per month</div>
              <div style={{ textAlign: "left", marginBottom: "32px" }}>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  ✓ Everything in Free, plus:
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  <strong>✓ AI Image Generation</strong> 
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  ✓ Image swapping (1-click)
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  ✓ Edit text zones
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  ✓ Unlimited sites
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  ✓ Unlimited edits
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  ✓ Real-time updates
                </div>
                <div style={{ padding: "12px 0" }}>
                  ✓ Priority support
                </div>
              </div>
              <Link href="/onboard" style={{
                display: "block",
                padding: "14px",
                backgroundColor: "white",
                color: "#007bff",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600"
              }}>
                Start 14-Day Free Trial
              </Link>
              <p style={{ marginTop: "16px", fontSize: "13px", opacity: 0.9 }}>
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: "60px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", textAlign: "center", marginBottom: "48px", color: "#333" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "grid", gap: "24px" }}>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                What's included in the free plan?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Free Discovery lets you paste any WordPress URL to see what's editable. You get platform detection, zone discovery, and visual preview - all without signup.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                What is AI image generation?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Pro members can generate professional images using . Click any image on your site, generate a new one with AI, and swap it instantly.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                Can I cancel anytime?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Yes! Cancel anytime, no questions asked. Your access continues until the end of your billing period.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                How many sites can I edit?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Pro plan includes unlimited sites. Discover and edit as many WordPress sites as you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", backgroundColor: "#1a1a1a", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>SafeWebEdit</div>
        <div style={{ fontSize: "14px", opacity: 0.6 }}>© 2025 SafeWebEdit. All rights reserved.</div>
      </footer>
    </div>
  );
}
