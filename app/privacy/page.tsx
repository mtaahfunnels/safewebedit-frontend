export default function PrivacyPage() {
  return (
    <div style={{ padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Last updated: January 10, 2026</p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>1. Information We Collect</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          When you sign up for SafeWebEdit, we collect your business name and email address. 
          We use passwordless authentication, so we never store passwords. We also collect 
          information about the WordPress sites you connect to our service.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>2. How We Use Your Information</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          We use your email to send magic login links and service notifications. We use your 
          WordPress site information to provide editing services. We do not sell your data to third parties.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>3. Data Security</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          All data is transmitted over HTTPS. Login tokens expire after use. Sessions automatically 
          expire after 15 minutes of inactivity. We use industry-standard encryption for data at rest.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>4. Your Rights</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          You can request deletion of your account and all associated data at any time. 
          Contact us at support@safewebedit.com to exercise your data rights.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>5. Cookies</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          We use essential cookies to maintain your logged-in session. We do not use tracking 
          cookies or third-party analytics beyond basic server logs.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>6. Contact Us</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          If you have questions about this Privacy Policy, please contact us at:<br />
          Email: support@safewebedit.com<br />
          Website: https://safewebedit.com/contact
        </p>
      </section>
    </div>
  );
}
