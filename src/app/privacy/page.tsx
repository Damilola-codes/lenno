export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <h2>1. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Email address (for account notifications and security)</li>
              <li>User ID or account identifier (for authentication and payments)</li>
            <li>Profile information you choose to share</li>
            <li>Communication data within our platform</li>
          </ul>
          
          <h3>Usage Information</h3>
          <ul>
            <li>Platform activity and interaction data</li>
            <li>Transaction history and project details</li>
            <li>Device and browser information</li>
          </ul>
          
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Facilitate connections between clients and freelancers</li>
            <li>Process payments and maintain transaction records</li>
            <li>Send important account and security notifications</li>
            <li>Improve platform functionality and user experience</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
          
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, rent, or share your personal information with third parties except:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal requirements</li>
            <li>To protect our platform and users from fraud or abuse</li>
              <li>In connection with payment processors and payout providers as necessary</li>
          </ul>
          
          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul>
            <li>End-to-end encryption for sensitive communications</li>
            <li>Secure storage with regular security audits</li>
              <li>We do not store third-party payment provider credentials</li>
            <li>Regular security updates and monitoring</li>
          </ul>
          
          <h2>5. Payment Providers</h2>
          <p>
          Our platform integrates with third-party payment providers to process payouts and handle payment infrastructure. 
          We do not collect or store credentials for those providers; they remain under the control of the provider.
          </p>
          
          <h2>6. Data Retention</h2>
          <p>
            We retain your data only as long as necessary for providing our services:
          </p>
          <ul>
            <li>Active account data: Retained while account is active</li>
            <li>Transaction records: Retained for 7 years for legal compliance</li>
            <li>Communication logs: Retained for 2 years for dispute resolution</li>
          </ul>
          
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request data deletion (subject to legal requirements)</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          
          <h2>8. Cookies and Tracking</h2>
          <p>
            We use essential cookies for platform functionality and security. 
            We do not use tracking cookies for advertising purposes.
          </p>
          
          <h2>9. International Users</h2>
          <p>
          Our platform is designed for global professionals and businesses. 
          Data may be processed in various countries where our services operate.
          </p>
          
          <h2>10. Changes to This Policy</h2>
          <p>
            We will notify users of significant changes to this privacy policy 
            via email and platform notifications.
          </p>
          
          <h2>11. Contact Us</h2>
          <p>
            For privacy-related questions or to exercise your rights, 
            contact us at privacy@lenno.com
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Last updated: October 7, 2025
          </p>
        </div>
      </div>
    </div>
  )
}