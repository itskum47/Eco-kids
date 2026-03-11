import React from 'react';
import Footer from '../../components/layout/Footer';

const cardClass = 'bg-white rounded-xl border border-teal-100 shadow-sm p-6 md:p-8';

const AccessibilityStatement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50">
      <main className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <p className="text-sm font-semibold tracking-wide uppercase text-teal-700">EcoKids India Accessibility</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Accessibility Statement</h1>
          <p className="text-gray-700 mt-4 leading-relaxed">
            EcoKids India is committed to providing an inclusive learning experience for all students, parents,
            teachers, and administrators. We aim to meet WCAG 2.1 Level AA standards across our web interfaces.
          </p>
          <p className="text-sm text-gray-500 mt-3">Last Reviewed: March 2026</p>
        </header>

        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900">1. Our Accessibility Commitments</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Keyboard-navigable interactions for primary workflows.</li>
              <li>Descriptive labels for form controls and action buttons.</li>
              <li>Alternative text for informative images and graphics.</li>
              <li>Color contrast and readable typography for clarity.</li>
              <li>Clear focus indicators for interactive elements.</li>
            </ul>
          </section>

          <section className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900">2. Supported Assistive Use</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Screen reader-compatible semantic page structure on major pages.</li>
              <li>Logical heading hierarchy and landmark regions where possible.</li>
              <li>Consistent navigation and predictable interaction behavior.</li>
            </ul>
          </section>

          <section className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900">3. Known Gaps and Ongoing Improvements</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Some legacy pages and older content modules may still require improvements for complete WCAG 2.1 AA
              conformance. We are actively auditing and remediating these areas in phased releases.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900">4. Feedback and Support</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              If you face any accessibility barriers, contact us and include the page URL and issue details.
            </p>
            <p className="text-gray-700 leading-relaxed">Email: accessibility@ecokids.in</p>
            <p className="text-gray-700 leading-relaxed">Support: support@ecokids.in</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccessibilityStatement;
