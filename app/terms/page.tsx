'use client';

import AccessibleLayout from '@/components/layout/AccessibleLayout';

export default function TermsOfService() {
  return (
    <AccessibleLayout title="Terms of Service">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <section aria-labelledby="agreement" className="mb-10">
          <h2 id="agreement" className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using OBAI (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>
        
        <section aria-labelledby="intellectual" className="mb-10">
          <h2 id="intellectual" className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
          <p className="mb-4">
            The Service and its original content, features, and functionality are and will remain the exclusive property of OBAI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>
          <p className="mb-4">
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of OBAI.
          </p>
        </section>
        
        <section aria-labelledby="user-content" className="mb-10">
          <h2 id="user-content" className="text-2xl font-semibold mb-4">User Generated Content</h2>
          <p className="mb-4">
            When you create, upload, submit, store, send, or receive content to or through our Service, you give OBAI a worldwide license to use, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display and distribute such content.
          </p>
          <p className="mb-4">
            You represent and warrant that:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>You own or have the necessary rights to use and authorize us to use all intellectual property rights in and to any content that you submit.</li>
            <li>The posting and use of your content on or through the Service does not violate, misappropriate or infringe on the rights of any third party.</li>
          </ul>
        </section>
        
        <section aria-labelledby="prohibited" className="mb-10">
          <h2 id="prohibited" className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
          <p className="mb-4">
            You agree not to use the Service:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>In any way that violates any applicable local, state, national, or international law or regulation.</li>
            <li>To impersonate or attempt to impersonate OBAI, an OBAI employee, another user, or any other person or entity.</li>
            <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation.</li>
            <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
            <li>To attack the Service via a denial-of-service attack or a distributed denial-of-service attack.</li>
            <li>To use the Service to generate content that is harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
          </ul>
        </section>
        
        <section aria-labelledby="termination" className="mb-10">
          <h2 id="termination" className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
          </p>
          <p className="mb-4">
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
          </p>
        </section>
        
        <section aria-labelledby="limitation" className="mb-10">
          <h2 id="limitation" className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall OBAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Your access to or use of or inability to access or use the Service.</li>
            <li>Any conduct or content of any third party on the Service.</li>
            <li>Any content obtained from the Service.</li>
            <li>Unauthorized access, use or alteration of your transmissions or content.</li>
          </ul>
        </section>
        
        <section aria-labelledby="disclaimer" className="mb-10">
          <h2 id="disclaimer" className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <p className="mb-4">
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </p>
        </section>
        
        <section aria-labelledby="governing-law" className="mb-10">
          <h2 id="governing-law" className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section aria-labelledby="changes-to-terms" className="mb-10">
          <h2 id="changes-to-terms" className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
        
        <section aria-labelledby="contact-us" className="mb-10">
          <h2 id="contact-us" className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mb-4">
            <a href="mailto:terms@obai.com" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">terms@obai.com</a>
          </p>
        </section>
      </div>
    </AccessibleLayout>
  );
}
