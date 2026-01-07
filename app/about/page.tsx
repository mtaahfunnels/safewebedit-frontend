"use client";

import Link from 'next/link';

export default function AboutPage() {
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
            <Link href="/pricing" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Pricing</Link>
            <Link href="/faq" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>FAQ</Link>
            <Link href="/about" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>About</Link>
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
            About SafeWebEdit
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95 }}>
            Making website editing simple for everyone
          </p>
        </div>
      </section>

      {/* About Content */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#666", lineHeight: "1.8", marginBottom: "32px" }}>
            We believe website editing should be simple. No more navigating complex dashboards,
            searching for the right page, or getting lost in settings. Just click what you see and edit it.
          </p>
          <p style={{ fontSize: "18px", color: "#666", lineHeight: "1.8" }}>
            Built for business owners, marketers, and anyone who wants to update their website
            without the technical headache. SafeWebEdit makes content management as easy as it should be—
            starting with WordPress and expanding to all major platforms.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "40px", fontWeight: "700", marginBottom: "24px" }}>
          Join us on our mission
        </h2>
        <p style={{ fontSize: "18px", marginBottom: "32px", opacity: 0.95 }}>
          Start editing your website the easy way
        </p>
        <Link href="/onboard" style={{
          display: "inline-block",
          padding: "16px 40px",
          backgroundColor: "white",
          color: "#667eea",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "18px",
          fontWeight: "600"
        }}>
          Start Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", backgroundColor: "#1a1a1a", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>SafeWebEdit</div>
        <div style={{ fontSize: "14px", opacity: 0.6 }}>© 2025 SafeWebEdit. All rights reserved.</div>
      </footer>
    </div>
  );
}
