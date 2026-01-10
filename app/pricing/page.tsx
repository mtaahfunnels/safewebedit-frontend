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
        padding: "100px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "56px", fontWeight: "700", marginBottom: "20px", lineHeight: "1.2" }}>
            Simple, Pay-As-You-Go Pricing
          </h1>
          <p style={{ fontSize: "22px", opacity: 0.95, marginBottom: "40px" }}>
            Start free. Top up when you need more. No subscriptions.
          </p>
        </div>
      </section>

      {/* Simple 2-Option Pricing */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "32px"
          }}>
            {/* Option 1: Free to Start */}
            <div style={{
              padding: "48px 40px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "2px solid #e0e0e0",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#666", marginBottom: "16px" }}>
                Start Free
              </div>
              <div style={{ fontSize: "72px", fontWeight: "700", marginBottom: "12px", color: "#2c3e50" }}>
                $0
              </div>
              <div style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>
                10 free credits to try it out
              </div>

              <div style={{
                textAlign: "left",
                marginBottom: "32px",
                padding: "24px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px"
              }}>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                  <strong style={{ color: "#2c3e50" }}>What you get:</strong>
                </div>
                <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8" }}>
                  • 10 text edits<br />
                  • or 5 image swaps<br />
                  • or 1 AI-generated image<br />
                  • No signup required
                </div>
              </div>

              <Link href="/" style={{
                display: "block",
                padding: "16px",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                Try Now
              </Link>
            </div>

            {/* Option 2: Pay As You Go */}
            <div style={{
              padding: "48px 40px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "3px solid #007bff",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 8px 24px rgba(0,123,255,0.15)"
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
                fontWeight: "700",
                letterSpacing: "0.5px"
              }}>
                RECOMMENDED
              </div>

              <div style={{ fontSize: "18px", fontWeight: "600", color: "#666", marginBottom: "16px" }}>
                Pay As You Go
              </div>
              <div style={{ fontSize: "72px", fontWeight: "700", marginBottom: "12px", color: "#2c3e50" }}>
                $10+
              </div>
              <div style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>
                Simple top-ups, no commitment
              </div>

              <div style={{
                textAlign: "left",
                marginBottom: "32px",
                padding: "24px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px"
              }}>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                  <strong style={{ color: "#2c3e50" }}>Quick buy options:</strong>
                </div>
                <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8" }}>
                  • $10 → 50 text edits<br />
                  • $20 → 100 text edits<br />
                  • $50 → 250 text edits<br />
                  • Custom amount ($5-$1000)
                </div>
              </div>

              <Link href="/dashboard/credits" style={{
                display: "block",
                padding: "16px",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                Get Started
              </Link>
            </div>
          </div>

          {/* Credit Pricing Guide */}
          <div style={{
            marginTop: "60px",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px solid #e0e0e0"
          }}>
            <h3 style={{ fontSize: "24px", fontWeight: "600", textAlign: "center", marginBottom: "32px", color: "#2c3e50" }}>
              How Credits Work
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "32px",
              textAlign: "center"
            }}>
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✏️</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#2c3e50", marginBottom: "8px" }}>1</div>
                <div style={{ fontSize: "14px", color: "#666" }}>credit per text edit</div>
              </div>
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🖼️</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#2c3e50", marginBottom: "8px" }}>2</div>
                <div style={{ fontSize: "14px", color: "#666" }}>credits per image swap</div>
              </div>
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎨</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#2c3e50", marginBottom: "8px" }}>10</div>
                <div style={{ fontSize: "14px", color: "#666" }}>credits per AI image</div>
              </div>
            </div>
            <div style={{
              marginTop: "32px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "14px",
              color: "#666"
            }}>
              💡 <strong style={{ color: "#2c3e50" }}>Credits never expire.</strong> Use them whenever you need, on unlimited sites.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: "60px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", textAlign: "center", marginBottom: "48px", color: "#333" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "grid", gap: "24px" }}>
            <div style={{ padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                Do credits expire?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                No! Your credits never expire. Buy them once, use them whenever you need.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                How do I add more credits?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Just click "Add Credits" in your dashboard and choose $10, $20, $50, or enter a custom amount. It's instant.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                What payment methods do you accept?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                We accept all major credit cards via Stripe (Visa, Mastercard, American Express).
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                Can I get a refund?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Yes, we offer full refunds within 30 days if you haven't used any credits.
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
