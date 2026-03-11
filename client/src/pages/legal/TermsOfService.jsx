import React from 'react';
import Footer from '../../components/layout/Footer';

const sectionClass = 'bg-white rounded-xl border border-emerald-100 shadow-sm p-6 md:p-8';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      <main className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <p className="text-sm font-semibold tracking-wide uppercase text-emerald-700">EcoKids India Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Terms of Service</h1>
          <p className="text-gray-700 mt-4 leading-relaxed">
            These Terms of Service govern use of the EcoKids India platform by students, parents, teachers, schools,
            and administrators participating in environmental education programs.
          </p>
          <p className="text-sm text-gray-500 mt-3">Version 1.0 | Last Updated: March 2026</p>
        </header>

        <div className="space-y-6">
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">1. Eligibility and School Participation</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Students are expected to be enrolled through a participating school or approved institution.</li>
              <li>For minors, parental consent is required before student participation.</li>
              <li>Schools and administrators must provide accurate onboarding information.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">2. Acceptable Use</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Users must not submit harmful, abusive, misleading, or unlawful content.</li>
              <li>Users must not falsify eco-activity submissions or impersonate another person.</li>
              <li>Users must not attempt unauthorized access, tampering, or security bypass.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">3. Educational Content and User Submissions</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Educational content on EcoKids India is provided to support curriculum-linked environmental learning.
              Students retain ownership of their original submissions, while granting EcoKids India and participating
              schools a limited right to process and display those submissions for educational and verification purposes.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">4. Accounts and Security</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Users are responsible for safeguarding account credentials.</li>
              <li>Suspicious activity should be reported immediately to support@ecokids.in.</li>
              <li>EcoKids India may temporarily restrict access to protect users and platform integrity.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">5. Service Availability</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We aim for reliable service availability, but temporary downtime may occur due to maintenance,
              upgrades, or unforeseen incidents. We reserve the right to improve or modify platform features.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">6. Limitation of Liability</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              To the extent permitted by law, EcoKids India is not liable for indirect, incidental, or consequential
              losses arising from platform use. Nothing in these terms limits rights that cannot be excluded under
              applicable Indian law.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">7. Governing Law and Jurisdiction</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              These terms are governed by the laws of India. Courts in Delhi, India, will have jurisdiction over
              disputes arising from use of the platform, subject to mandatory legal provisions.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">8. Contact</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">Legal inquiries: legal@ecokids.in</p>
            <p className="text-gray-700 leading-relaxed">General support: support@ecokids.in</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
