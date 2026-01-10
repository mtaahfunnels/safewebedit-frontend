"use client";

import Link from 'next/link';

export default function FAQPage() {
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
            <Link href="/faq" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>FAQ</Link>
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
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95 }}>
            Everything you need to know about SafeWebEdit
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                What platforms do you support?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Currently, SafeWebEdit supports WordPress (no plugin required). We're actively developing support for other popular CMS platforms including Wix, Squarespace, Shopify, and more.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                Is my site login secure?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Yes. Your credentials are encrypted with bank-level security and never stored in plain text. We only use them to make authenticated requests to your website.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                Do I need technical knowledge?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Not at all. SafeWebEdit is designed for business owners, marketers, and content creators. If you can point and click, you can edit your website.
              </p>
            </div>
            <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                What happens after the free trial?
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                After 14 days, you'll be automatically enrolled in the Professional plan at $5.99/month. You can cancel anytime with no questions asked.
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
