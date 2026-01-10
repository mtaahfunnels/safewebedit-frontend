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
            Website Editing Should Be Simple
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95 }}>
            We're making AI-powered visual editing accessible to everyone
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "24px", color: "#333" }}>Our Mission</h2>
            <p style={{ fontSize: "20px", color: "#666", lineHeight: "1.8" }}>
              Eliminate the gap between seeing a change you want and making it happen on your website.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
            <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>Zero Friction</h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                No WordPress dashboard. No searching for pages. Just click what you see and edit it.
              </p>
            </div>
            <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>AI-First</h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Generate professional images, rewrite content, and get suggestions - all powered by AI.
              </p>
            </div>
            <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>Instant</h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Changes go live immediately. No waiting, no manual publishing, no delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "32px", color: "#333", textAlign: "center" }}>Why We Built This</h2>

          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "18px", color: "#666", lineHeight: "1.8", marginBottom: "24px" }}>
              We've watched business owners struggle with WordPress for too long. Logging into the dashboard,
              navigating through menus, finding the right page, locating the right section, making changes,
              previewing, publishing... it's exhausting.
            </p>
            <p style={{ fontSize: "18px", color: "#666", lineHeight: "1.8", marginBottom: "24px" }}>
              Most business owners don't want to become WordPress experts. They just want to update
              their hero image, fix a typo, or refresh their pricing. Simple changes shouldn't require
              complex workflows.
            </p>
            <p style={{ fontSize: "18px", color: "#666", lineHeight: "1.8" }}>
              So we built SafeWebEdit: a visual editor that works the way you think. See your actual
              website, click what you want to change, and edit it. AI helps you generate images, improve
              content, and make smart suggestions. Changes go live instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "48px", color: "#333", textAlign: "center" }}>
            How It Works
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
              <div style={{
                minWidth: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#007bff",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold"
              }}>1</div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                  Free Discovery
                </h3>
                <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                  Paste any WordPress URL. Our system analyzes your site and shows you exactly what's editable.
                  No signup required - see the full potential before you commit.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
              <div style={{
                minWidth: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#007bff",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold"
              }}>2</div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                  Smart Zone Validation
                </h3>
                <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                  We automatically filter out non-editable zones (headers, footers, navigation). Only show you
                  content you can actually change. No false positives, no confusion.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
              <div style={{
                minWidth: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#007bff",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold"
              }}>3</div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                  Visual Editing
                </h3>
                <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                  Click any text or image to edit. Our AI Command Center guides you through changes. Generate
                  new images, rewrite content, or make quick updates - all visually.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "start" }}>
              <div style={{
                minWidth: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#007bff",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold"
              }}>4</div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                  Instant Publishing
                </h3>
                <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                  Changes go live immediately via WordPress REST API. We handle uploads, content updates, and
                  publishing automatically. Comprehensive logging ensures everything works perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "48px", color: "#333", textAlign: "center" }}>
            What We Believe
          </h2>

          <div style={{ display: "grid", gap: "24px" }}>
            <div style={{ padding: "32px", backgroundColor: "#f8f9fa", borderRadius: "12px", borderLeft: "4px solid #007bff" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                Simplicity Over Features
              </h3>
              <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                We could add a hundred features. Instead, we focus on making the core experience perfect.
                Less is more when it's done right.
              </p>
            </div>

            <div style={{ padding: "32px", backgroundColor: "#f8f9fa", borderRadius: "12px", borderLeft: "4px solid #007bff" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                AI Should Assist, Not Replace
              </h3>
              <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                AI is powerful, but you're still in control. We use AI to speed up your workflow and suggest
                improvements, never to make decisions for you.
              </p>
            </div>

            <div style={{ padding: "32px", backgroundColor: "#f8f9fa", borderRadius: "12px", borderLeft: "4px solid #007bff" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                Try Before You Buy
              </h3>
              <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                Free discovery isn't a marketing trick. We genuinely want you to see if SafeWebEdit works
                for your site before asking for payment. No bait and switch.
              </p>
            </div>

            <div style={{ padding: "32px", backgroundColor: "#f8f9fa", borderRadius: "12px", borderLeft: "4px solid #007bff" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                Transparency Builds Trust
              </h3>
              <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.8" }}>
                Comprehensive diagnostic logging shows exactly what's happening at every step. If something
                fails, you know why. No black boxes, no guesswork.
              </p>
            </div>
          </div>
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
          Join Us in Simplifying Website Editing
        </h2>
        <p style={{ fontSize: "18px", marginBottom: "32px", opacity: 0.95 }}>
          Try free discovery and see what SafeWebEdit can do for your site
        </p>
        <Link href="/" style={{
          display: "inline-block",
          padding: "16px 40px",
          backgroundColor: "white",
          color: "#667eea",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "18px",
          fontWeight: "600"
        }}>
          Try Free Discovery
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
