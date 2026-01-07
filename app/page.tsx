"use client";

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
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#007bff" }}>
            SafeWebEdit
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <a href="#" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Home</a>
            <a href="#features" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Features</a>
            <a href="#pricing" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Pricing</a>
            <a href="#faq" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>FAQ</a>
            <a href="#about" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>About</a>
            <a href="#contact" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Contact</a>
            <a href="/dashboard" style={{ color: "#333", textDecoration: "none", fontSize: "14px" }}>Business Portal</a>
            <a href="/onboard" style={{
              padding: "10px 24px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          color: "white"
        }}>
          <h1 style={{
            fontSize: "56px",
            fontWeight: "700",
            marginBottom: "24px",
            lineHeight: "1.2"
          }}>
            Edit Your Website
            <br />
            Without the Complex Dashboard
          </h1>
          <p style={{
            fontSize: "22px",
            marginBottom: "16px",
            opacity: 0.95
          }}>
            Click what you see, edit in place, publish instantly.
          </p>
          <p style={{
            fontSize: "16px",
            marginBottom: "40px",
            opacity: 0.85
          }}>
            WordPress support available now. More platforms coming soon.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <a href="/onboard" style={{
              padding: "16px 40px",
              backgroundColor: "white",
              color: "#667eea",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              Start Free Trial
            </a>
          </div>
          <div style={{
            marginTop: "56px",
            display: "flex",
            justifyContent: "center",
            gap: "64px"
          }}>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "700" }}>1-Click</div>
              <div>To Edit Any Text</div>
            </div>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "700" }}>Real-Time</div>
              <div>Live Updates</div>
            </div>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "700" }}>5 min</div>
              <div>Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "700", textAlign: "center", marginBottom: "64px" }}>
            Everything You Need
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px"
          }}>
            <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Visual Editing</h3>
              <p style={{ color: "#666" }}>Click any text to edit. See changes in real-time on your actual website.</p>
            </div>
            <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Instant Updates</h3>
              <p style={{ color: "#666" }}>Changes go live immediately. No delays, no complicated publishing workflows.</p>
            </div>
            <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Secure</h3>
              <p style={{ color: "#666" }}>Bank-level encryption for your credentials. Your data is safe with us.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>
            Simple Pricing
          </h2>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "48px" }}>
            Start free, upgrade when ready
          </p>
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
            <a href="/onboard" style={{
              display: "block",
              padding: "14px",
              backgroundColor: "white",
              color: "#007bff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600"
            }}>
              Start Free Trial
            </a>
          </div>
          <p style={{ marginTop: "24px", color: "#666" }}>
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      <section id="faq" style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "700", textAlign: "center", marginBottom: "64px" }}>
            Frequently Asked Questions
          </h2>
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

      <section id="about" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "700", marginBottom: "24px" }}>
            About SafeWebEdit
          </h2>
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

      <section id="contact" style={{ padding: "80px 24px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "700", marginBottom: "24px" }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "40px" }}>
            Questions? We're here to help.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <a href="mailto:support@safewebedit.com" style={{
              fontSize: "20px",
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "500"
            }}>
              support@safewebedit.com
            </a>
            <p style={{ fontSize: "14px", color: "#666" }}>
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </section>

      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "40px", fontWeight: "700", marginBottom: "24px" }}>
          Ready to Simplify Website Editing?
        </h2>
        <p style={{ fontSize: "18px", marginBottom: "32px", opacity: 0.95 }}>
          Start editing your website the easy way
        </p>
        <a href="/onboard" style={{
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
        </a>
      </section>

      <footer style={{ padding: "48px 24px", backgroundColor: "#1a1a1a", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>SafeWebEdit</div>
        <div style={{ fontSize: "14px", opacity: 0.6 }}>© 2025 SafeWebEdit. All rights reserved.</div>
      </footer>
    </div>
  );
}
