'use client';

import AccessibleLayout from '@/components/layout/AccessibleLayout';

export default function PrivacyPolicy() {
  return (
    <AccessibleLayout title="Privacy Policy">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <section aria-labelledby="introduction" className="mb-10">
          <h2 id="introduction" className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            OBAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </p>
          <p className="mb-4">
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
          </p>
        </section>
        
        <section aria-labelledby="collection" className="mb-10">
          <h2 id="collection" className="text-2xl font-semibold mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3 mt-6">Personal Information</h3>
          <p className="mb-4">
            We may collect personal information that you voluntarily provide when using our service, including but not limited to:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Name and contact information (email address, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Profile information (profile pictures, biographical information)</li>
            <li>Payment information (stored securely via third-party payment processors)</li>
            <li>Communications with us</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3 mt-6">Automatically Collected Information</h3>
          <p className="mb-4">
            When you access or use our service, we may automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Device information (device type, operating system, browser type)</li>
            <li>Usage data (interactions with our service, chat history, personas created)</li>
            <li>IP address and approximate location based on IP</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>
        
        <section aria-labelledby="use" className="mb-10">
          <h2 id="use" className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We may use the information we collect for various purposes, including to:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about service-related matters</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Detect, prevent, and address technical issues or fraudulent activities</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <section aria-labelledby="sharing" className="mb-10">
          <h2 id="sharing" className="text-2xl font-semibold mb-4">Information Sharing and Disclosure</h2>
          <p className="mb-4">
            We may share your information in the following situations:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors who perform services on our behalf.</li>
            <li><strong>Compliance with Laws:</strong> We may disclose your information to comply with applicable laws and regulations.</li>
            <li><strong>Protection of Rights:</strong> We may disclose information to protect our rights or the rights of our users.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            <li><strong>With Your Consent:</strong> We may share your information with third parties when you have given consent.</li>
          </ul>
        </section>
        
        <section aria-labelledby="security" className="mb-10">
          <h2 id="security" className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section aria-labelledby="retention" className="mb-10">
          <h2 id="retention" className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We will retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>
        </section>
        
        <section aria-labelledby="children" className="mb-10">
          <h2 id="children" className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">
            Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
          </p>
        </section>
        
        <section aria-labelledby="changes" className="mb-10">
          <h2 id="changes" className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
        
        <section aria-labelledby="contact" className="mb-10">
          <h2 id="contact" className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mb-4">
            <a href="mailto:privacy@obai.com" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">privacy@obai.com</a>
          </p>
        </section>
      </div>
    </AccessibleLayout>
  );
}
