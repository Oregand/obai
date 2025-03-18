'use client';

import AccessibleLayout from '@/components/layout/AccessibleLayout';

export default function AccessibilityStatement() {
  return (
    <AccessibleLayout title="Accessibility Statement">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Accessibility Statement</h1>
        
        <section aria-labelledby="commitment" className="mb-10">
          <h2 id="commitment" className="text-2xl font-semibold mb-4">Our Commitment to Accessibility</h2>
          <p className="mb-4">
            OBAI is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>
        </section>
        
        <section aria-labelledby="conformance" className="mb-10">
          <h2 id="conformance" className="text-2xl font-semibold mb-4">Conformance Status</h2>
          <p className="mb-4">
            The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
          </p>
          <p className="mb-4">
            OBAI is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
          </p>
        </section>
        
        <section aria-labelledby="technologies" className="mb-10">
          <h2 id="technologies" className="text-2xl font-semibold mb-4">Accessibility Features</h2>
          <p className="mb-4">OBAI includes the following accessibility features:</p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Keyboard navigation support throughout the application</li>
            <li>Proper heading structure for screen reader navigation</li>
            <li>Skip-to-content links to bypass navigation</li>
            <li>Adequate color contrast ratios</li>
            <li>Responsive design that works on various devices and screen sizes</li>
            <li>Text alternatives for non-text content</li>
            <li>ARIA attributes where appropriate</li>
          </ul>
        </section>
        
        <section aria-labelledby="limitations" className="mb-10">
          <h2 id="limitations" className="text-2xl font-semibold mb-4">Known Limitations</h2>
          <p className="mb-4">Despite our efforts, there might be some aspects of the site that are not fully accessible:</p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Some older content may not fully meet current accessibility standards</li>
            <li>Some third-party applications and components may not be fully accessible</li>
            <li>PDF documents may not be fully accessible to screen reader technology</li>
          </ul>
        </section>
        
        <section aria-labelledby="feedback" className="mb-10">
          <h2 id="feedback" className="text-2xl font-semibold mb-4">Feedback and Contact Information</h2>
          <p className="mb-4">
            We welcome your feedback on the accessibility of OBAI. Please let us know if you encounter accessibility barriers:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Email: <a href="mailto:accessibility@obai.com" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">accessibility@obai.com</a></li>
          </ul>
          <p className="mb-4">
            We try to respond to feedback within 2 business days.
          </p>
        </section>
        
        <section aria-labelledby="compliance" className="mb-10">
          <h2 id="compliance" className="text-2xl font-semibold mb-4">Assessment and Compliance Process</h2>
          <p className="mb-4">
            OBAI assesses the accessibility of our website by:
          </p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li>Regular internal evaluations using WAVE and axe automated testing tools</li>
            <li>User testing with assistive technologies</li>
            <li>Addressing accessibility issues as part of our development process</li>
          </ul>
        </section>
      </div>
    </AccessibleLayout>
  );
}
