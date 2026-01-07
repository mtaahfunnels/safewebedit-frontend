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
            Simple Pricing
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95 }}>
            Start free, upgrade when ready
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            padding: "48px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "16px",
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            <h3 style={{ fontSize: "24px", marginBottom: "8px" }}>Professional</h3>
            <div style={{ fontSize: "56px", fontWeight: "700", marginBottom: "8px" }}>$5.99</div>
            <div style={{ marginBottom: "32px" }}>per month</div>
            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              <div style={{ padding: "8px 0" }}>✓ Up to 5 websites</div>
              <div style={{ padding: "8px 0" }}>✓ Unlimited edits</div>
              <div style={{ padding: "8px 0" }}>✓ Real-time updates</div>
              <div style={{ padding: "8px 0" }}>✓ Priority support</div>
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
              Start Free Trial
            </Link>
          </div>
          <p style={{ marginTop: "24px", color: "#666" }}>
            14-day free trial • No credit card required
          </p>
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
