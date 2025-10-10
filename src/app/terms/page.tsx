export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Lenno, the exclusive freelance marketplace for Pi Network pioneers. 
            By accessing or using our platform, you agree to these Terms of Service.
          </p>
          
          <h2>2. Eligibility</h2>
          <p>
            To use Lenno, you must be a verified Pi Network pioneer with an active Pi Network account. 
            You must be at least 18 years old and legally capable of entering into contracts.
          </p>
          
          <h2>3. Platform Purpose</h2>
          <p>
            Lenno facilitates connections between clients and freelancers within the Pi Network ecosystem. 
            All transactions are conducted using Pi cryptocurrency.
          </p>
          
          <h2>4. User Responsibilities</h2>
          <ul>
            <li>Maintain accurate and up-to-date profile information</li>
            <li>Deliver quality work as agreed upon in contracts</li>
            <li>Communicate professionally and respectfully</li>
            <li>Comply with Pi Network community guidelines</li>
          </ul>
          
          <h2>5. Payment Terms</h2>
          <p>
            All payments are processed through Pi Network&apos;s payment system. 
            Lenno charges an 8% platform fee on completed transactions.
          </p>
          
          <h2>6. Privacy and Security</h2>
          <p>
            We protect your personal information as outlined in our Privacy Policy. 
            Your Pi Network credentials are never stored on our servers.
          </p>
          
          <h2>7. Dispute Resolution</h2>
          <p>
            Disputes between users should first be resolved through our platform&apos;s messaging system. 
            Unresolved disputes may be escalated to our support team.
          </p>
          
          <h2>8. Platform Availability</h2>
          <p>
            We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. 
            Planned maintenance will be announced in advance.
          </p>
          
          <h2>9. Modifications</h2>
          <p>
            We reserve the right to modify these terms with reasonable notice to users.
          </p>
          
          <h2>10. Contact</h2>
          <p>
            For questions about these terms, please contact us at support@lenno.com
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