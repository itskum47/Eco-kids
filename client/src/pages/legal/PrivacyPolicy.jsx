import React from 'react';
import Footer from '../../components/layout/Footer';

const sectionClass = 'bg-white rounded-xl border border-green-100 shadow-sm p-6 md:p-8';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50">
      <main className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <p className="text-sm font-semibold tracking-wide uppercase text-green-700">EcoKids India Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Privacy Policy</h1>
          <p className="text-gray-700 mt-4 leading-relaxed">
            This Privacy Policy explains how EcoKids India collects, uses, stores, and protects personal data in accordance
            with the Digital Personal Data Protection Act, 2023 (DPDP Act), and other applicable Indian regulations.
          </p>
          <p className="text-sm text-gray-500 mt-3">Version 1.0 | Last Updated: March 2026</p>
        </header>

        <div className="space-y-6">
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">1. Data We Collect</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Account data: name, email, phone number, school, district, class/grade.</li>
              <li>Student learning data: activities submitted, quiz attempts, points, badges, and progress.</li>
              <li>Parent details for minors: parent name, email, phone, and parental consent records.</li>
              <li>Technical and security data: login timestamps, IP metadata, and device/browser details.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">2. Why We Collect Data</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>To provide environmental learning, assessments, and eco-activity tracking.</li>
              <li>To generate school-level and district-level educational insights aligned with NEP 2020 goals.</li>
              <li>To support student safety, parental transparency, and teacher verification workflows.</li>
              <li>To maintain platform security, detect abuse, and comply with legal obligations.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">3. Legal Basis and Consent</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              We process data on lawful grounds under the DPDP Act, including consent-based processing and legitimate uses
              for school operations. For students under 18, verifiable parental consent is required before participation.
              Consent records are time-stamped and can be reviewed or withdrawn where permitted.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">4. Data Sharing and Access</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Students can access their own profile and activity records.</li>
              <li>Parents can view their child’s educational progress where parent access is enabled.</li>
              <li>Teachers and school administrators access data strictly for academic and verification purposes.</li>
              <li>We do not sell personal data or allow unrelated third-party advertising access.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">5. Data Retention</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Data is retained only as long as required for educational delivery, compliance, and reporting obligations.
              If an account deletion request is made, personal identity information is anonymized promptly and a limited
              restoration window may apply as part of verified deletion workflows.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">6. Data Principal Rights (DPDP Act 2023)</h2>
            <ul className="mt-3 text-gray-700 space-y-2 list-disc pl-5">
              <li>Right to access a summary of personal data processed.</li>
              <li>Right to correction and updating of inaccurate data.</li>
              <li>Right to erasure of personal data, subject to legal retention needs.</li>
              <li>Right to grievance redressal and to nominate an authorized representative.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">7. Data Localization and Security</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              EcoKids India stores and processes production data within India-region infrastructure and applies encryption,
              access controls, audit trails, and incident response procedures aligned with Indian security expectations.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-gray-900">8. Contact for Privacy Requests</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Email: privacy@ecokids.in
            </p>
            <p className="text-gray-700 leading-relaxed">
              Grievance Officer: grievance.officer@ecokids.in
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
