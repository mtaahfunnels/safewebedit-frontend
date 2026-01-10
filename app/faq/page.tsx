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
            Everything you need to know about AI-powered website editing
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Getting Started */}
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px", color: "#333" }}>Getting Started</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  How does free discovery work?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Just paste any WordPress URL on our homepage. We'll instantly analyze your site and show you what's editable - no signup, no credit card required. You'll see a visual preview of your site with all editable zones highlighted. Hover over any zone to see it highlighted in real-time.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  Do I need to install anything on my WordPress site?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  No plugin required! SafeWebEdit connects directly to your WordPress site using its built-in REST API. Just provide your WordPress login credentials and you're ready to edit.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What platforms do you support?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Currently, we support WordPress with full AI image generation and visual editing. Our platform detection system also recognizes Shopify and Ghost sites. We're actively developing support for more platforms.
                </p>
              </div>

            </div>
          </div>

          {/* AI Features */}
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px", color: "#333" }}>AI Features</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What is AI image generation?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Our AI image generation lets you create professional images instantly. Click any image on your site, describe what you want, and our AI generates a high-quality replacement. Perfect for hero images, product photos, blog graphics, banners with text, promotional images, and more. Our AI can generate images with text embedded directly in them - perfect for marketing materials and social media graphics.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  How does image swapping work?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Click any image in the Visual Editor, generate a new one with AI (or upload your own), then click "Swap Image". We automatically upload the new image to your WordPress media library and replace the old one in your page content. Changes go live instantly.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  Can I swap any image on my site?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  You can swap images that are part of your page content. Images in your theme, header, footer, or widgets cannot be swapped since they're not stored in page content. Our system validates which images are swappable before showing them.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What AI model do you use?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  We use state-of-the-art AI image generation technology to create professional-quality images. Our models are constantly updated to ensure you get the best results.
                </p>
              </div>

            </div>
          </div>

          {/* Editing & Updates */}
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px", color: "#333" }}>Editing & Updates</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  How do I edit text on my site?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  In the Visual Editor, click any text zone you want to edit. Our AI Command Center will guide you through making changes. You can update text, adjust formatting, or rewrite content with AI assistance. Changes save automatically to your WordPress site.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  Do changes go live immediately?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Yes! All changes are published to your live site in real-time. You can preview before saving, but once you click save, it goes live immediately. No manual publishing or WordPress dashboard needed.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What if I make a mistake?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  WordPress keeps version history of your pages, so you can always revert changes through your WordPress dashboard if needed. We recommend previewing changes before saving.
                </p>
              </div>

            </div>
          </div>

          {/* Security & Reliability */}
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px", color: "#333" }}>Security & Reliability</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  Is my WordPress login secure?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Yes. Your credentials are encrypted with bank-level security and never stored in plain text. We only use them to make authenticated requests to your WordPress site via the official REST API. Your data never touches our servers except during active editing sessions.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What if something goes wrong?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  We have comprehensive diagnostic logging that tracks every step of the editing process. If an image swap or text edit fails, you'll see exactly what went wrong. Our system validates all changes before applying them to your live site.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  Do I need technical knowledge?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Not at all. SafeWebEdit is designed for business owners, marketers, and content creators. If you can point and click, you can edit your website. No HTML, CSS, or coding knowledge required.
                </p>
              </div>

            </div>
          </div>

          {/* Pricing & Plans */}
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px", color: "#333" }}>Pricing & Plans</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What's included in the free plan?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Free Discovery includes platform detection, zone discovery, and visual preview. You can see exactly what's editable on your site before signing up. No credit card required.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  What do I get with Pro?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Pro ($29/month) includes AI image generation, image swapping, text editing, unlimited sites, unlimited edits, real-time updates, and priority support. You get the full visual editing experience with AI capabilities.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  Can I cancel anytime?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  Yes! Cancel anytime with no questions asked. Your access continues until the end of your billing period. No cancellation fees or hidden charges.
                </p>
              </div>

              <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#007bff" }}>
                  How many sites can I edit?
                </h3>
                <p style={{ color: "#666", lineHeight: "1.8" }}>
                  With Pro, you get unlimited sites. Add as many WordPress sites as you need and edit them all from one dashboard.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "40px", fontWeight: "700", marginBottom: "24px" }}>
          Still have questions?
        </h2>
        <p style={{ fontSize: "18px", marginBottom: "32px", opacity: 0.95 }}>
          Try free discovery or contact us - we're here to help
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
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
          <Link href="/contact" style={{
            display: "inline-block",
            padding: "16px 40px",
            backgroundColor: "transparent",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "600"
          }}>
            Contact Us
          </Link>
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
