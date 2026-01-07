"use client";

import Link from 'next/link';

export default function ContactPage() {
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
            <Link href="/about" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>About</Link>
            <Link href="/contact" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Contact</Link>
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
            Get in Touch
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95 }}>
            Questions? We're here to help
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <a href="mailto:support@safewebedit.com" style={{
              fontSize: "24px",
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "600",
              padding: "20px 40px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              support@safewebedit.com
            </a>
            <p style={{ fontSize: "16px", color: "#666", marginTop: "16px" }}>
              We typically respond within 24 hours
            </p>
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
