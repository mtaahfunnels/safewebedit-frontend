"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
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

      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)"
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          color: "#333"
        }}>
          <h1 style={{
            fontSize: "56px",
            fontWeight: "700",
            marginBottom: "24px",
            lineHeight: "1.2",
            color: "#1a1a1a"
          }}>
            Edit Your Website
            <br />
            Without the Complex Dashboard
          </h1>
          <p style={{
            fontSize: "22px",
            marginBottom: "16px",
            color: "#555"
          }}>
            Click what you see, edit in place, publish instantly.
          </p>
          <p style={{
            fontSize: "16px",
            marginBottom: "40px",
            color: "#777"
          }}>
            WordPress support available now. More platforms coming soon.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link href="/onboard" style={{
              padding: "16px 40px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              Start Free Trial
            </Link>
          </div>
          <div style={{
            marginTop: "56px",
            display: "flex",
            justifyContent: "center",
            gap: "64px"
          }}>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a" }}>1-Click</div>
              <div style={{ color: "#666" }}>To Edit Any Text</div>
            </div>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a" }}>Real-Time</div>
              <div style={{ color: "#666" }}>Live Updates</div>
            </div>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a" }}>5 min</div>
              <div style={{ color: "#666" }}>Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        borderTop: "1px solid #e0e0e0",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "40px", fontWeight: "700", marginBottom: "24px", color: "#1a1a1a" }}>
          Ready to Simplify Website Editing?
        </h2>
        <p style={{ fontSize: "18px", marginBottom: "32px", color: "#555" }}>
          Start editing your website the easy way
        </p>
        <Link href="/onboard" style={{
          display: "inline-block",
          padding: "16px 40px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "18px",
          fontWeight: "600"
        }}>
          Start Free Trial
        </Link>
      </section>

      <footer style={{ padding: "48px 24px", backgroundColor: "#1a1a1a", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>SafeWebEdit</div>
        <div style={{ fontSize: "14px", opacity: 0.6 }}>© 2025 SafeWebEdit. All rights reserved.</div>
      </footer>
    </div>
  );
}
