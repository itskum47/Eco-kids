import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const plans = [
    {
        name: 'Free',
        slug: 'free',
        price: { monthly: 0, annual: 0 },
        description: 'Get started with basic environmental education',
        limits: { students: 30, teachers: 2 },
        features: [
            'Basic lessons & quizzes',
            'Student eco-points',
            '2 teacher accounts',
            '30 student limit',
        ],
        cta: 'Start Free',
        highlight: false,
        icon: '🌱',
    },
    {
        name: 'Standard',
        slug: 'standard',
        price: { monthly: 1999, annual: 1799 },
        description: 'For schools ready to make an impact',
        limits: { students: 500, teachers: 20 },
        features: [
            'Everything in Free',
            'School leaderboard',
            'Inter-school competitions',
            'Analytics dashboard',
            'CMS access',
            '500 students',
            '20 teachers',
            'Priority support',
        ],
        cta: 'Upgrade to Standard',
        highlight: true,
        icon: '🌳',
    },
    {
        name: 'Premium',
        slug: 'premium',
        price: { monthly: 4999, annual: 4499 },
        description: 'Full platform access for large institutions',
        limits: { students: 5000, teachers: 100 },
        features: [
            'Everything in Standard',
            'API access',
            'White-label branding',
            'Video streaming',
            '5000 students',
            '100 teachers',
            'Dedicated account manager',
            'Custom reports',
        ],
        cta: 'Go Premium',
        highlight: false,
        icon: '🌍',
    },
];

const stats = [
    { label: 'Schools Onboarded', value: '50+', icon: '🏫' },
    { label: 'Activities Verified', value: '12,000+', icon: '✅' },
    { label: 'Trees Planted', value: '3,200+', icon: '🌳' },
    { label: 'CO₂ Prevented', value: '8.5 tons', icon: '🌍' },
];

const faqs = [
    {
        q: 'Is there a free plan?',
        a: 'Yes! Schools can start with up to 30 students and 2 teachers at no cost. No credit card required.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major Indian payment methods via Razorpay: UPI, credit/debit cards, net banking, and wallets.',
    },
    {
        q: 'Can we switch plans later?',
        a: "Absolutely. You can upgrade or downgrade at any time. We'll prorate the difference.",
    },
    {
        q: 'Is student data safe?',
        a: "Yes. We're fully DPDP Act 2023 compliant with parental consent for minors, data encryption, and right-to-deletion support.",
    },
    {
        q: 'Do you support government/CSR funding?',
        a: 'Yes! Contact us for special government and CSR pricing. We provide NEP 2020 alignment reports and SDG impact documentation.',
    },
    {
        q: 'What about the annual discount?',
        a: 'Annual billing saves 10% compared to monthly. You can switch billing cycles at renewal.',
    },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="min-h-screen bg-[#f9fffe]">
            <Navbar />

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-bold text-[#2e7d32] mb-2 tracking-widest uppercase"
                >
                    Transparent Pricing
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="font-black text-[#064e17] leading-tight mb-4"
                    style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
                >
                    Simple plans for every school
                </motion.h1>

                <p className="text-[#1a3a1a] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    Choose the plan that fits your school. Start free, upgrade when you're
                    ready. All plans include eco-points, badges, and real-world activity tracking.
                </p>

                {/* ── Billing toggle ───────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <span
                        className={`text-sm font-semibold transition-colors ${!annual ? 'text-[#064e17]' : 'text-[#7a9b72]'
                            }`}
                    >
                        Monthly
                    </span>

                    <button
                        onClick={() => setAnnual(!annual)}
                        aria-label="Toggle billing cycle"
                        className="relative w-14 h-7 rounded-full transition-colors"
                        style={{ backgroundColor: '#2e7d32' }}
                    >
                        <span
                            className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
                            style={{ transform: annual ? 'translateX(28px)' : 'translateX(0)' }}
                        />
                    </button>

                    <span
                        className={`text-sm font-semibold transition-colors ${annual ? 'text-[#064e17]' : 'text-[#7a9b72]'
                            }`}
                    >
                        Annual{' '}
                        <span className="text-[#2e7d32] text-xs font-bold bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                            Save 10%
                        </span>
                    </span>
                </div>
            </div>

            {/* ── Plans ────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6 mb-20">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.slug}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`rounded-2xl p-8 border-2 relative ${plan.highlight
                                ? 'border-[#2e7d32] bg-white shadow-[0_8px_40px_rgba(46,125,50,.18)]'
                                : 'border-[#e8f5e9] bg-white shadow-[0_3px_16px_rgba(0,0,0,.06)]'
                            }`}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2e7d32] text-[#0a1e0a] text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                                ⭐ Most Popular
                            </div>
                        )}

                        <div className="text-3xl mb-3">{plan.icon}</div>
                        <h3 className="text-xl font-black text-[#064e17] mb-1">{plan.name}</h3>
                        <p className="text-[#4a7a4a] text-sm mb-6">{plan.description}</p>

                        <div className="mb-6">
                            <span className="text-4xl font-black text-[#064e17]">
                                {plan.price.monthly === 0
                                    ? 'Free'
                                    : `₹${annual ? plan.price.annual : plan.price.monthly}`}
                            </span>
                            {plan.price.monthly > 0 && (
                                <span className="text-[#7a9b72] text-sm ml-1">/month</span>
                            )}
                            {plan.price.monthly > 0 && annual && (
                                <p className="text-xs text-[#7a9b72] mt-1">
                                    Billed ₹{(plan.price.annual * 12).toLocaleString('en-IN')}/year
                                </p>
                            )}
                        </div>

                        <button
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${plan.highlight
                                    ? 'bg-[#2e7d32] hover:bg-[#1b5e20] text-[#0a1e0a] shadow-[0_4px_16px_rgba(46,125,50,.3)]'
                                    : 'bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#064e17] border border-[#a5d6a7]'
                                }`}
                        >
                            {plan.cta}
                        </button>

                        <ul className="mt-6 space-y-3">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm text-[#1a3a1a]">
                                    <span className="text-[#2e7d32] mt-0.5 font-bold">✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* ── Live impact stats ─────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 mb-20">
                <h2 className="text-2xl font-black text-[#064e17] text-center mb-2 uppercase tracking-widest">
                    Platform Impact
                </h2>
                <p className="text-center text-[#4a7a4a] mb-8">
                    Real numbers from schools already on EcoKids India
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl p-6 text-center border border-[#e8f5e9] shadow-sm"
                        >
                            <div className="text-3xl mb-2">{s.icon}</div>
                            <div className="text-2xl font-black text-[#2e7d32]">{s.value}</div>
                            <div className="text-[#7a9b72] text-xs font-semibold mt-1 uppercase tracking-wide">
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Government / CSR CTA ─────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 mb-20">
                <div className="bg-[#e8f5e9] rounded-2xl p-8 md:p-12 border border-[#a5d6a7] text-center">
                    <div className="text-4xl mb-4">🏛️</div>
                    <h2 className="text-2xl font-black text-[#064e17] mb-3">
                        Government & CSR Partners
                    </h2>
                    <p className="text-[#1a3a1a] mb-6 max-w-2xl mx-auto leading-relaxed">
                        Special pricing for government bodies, NGOs, and CSR initiatives. Includes
                        NEP 2020 alignment reports, SDG impact documentation (SDG 13, 15), and
                        dedicated onboarding support.
                    </p>
                    <a
                        href="mailto:partnerships@ecokids.in"
                        className="inline-block bg-[#2e7d32] text-[#0a1e0a] px-8 py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-[0_4px_16px_rgba(46,125,50,.3)]"
                    >
                        Contact for Government Pricing →
                    </a>
                </div>
            </div>

            {/* ── FAQ ──────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto px-4 pb-20">
                <h2 className="text-2xl font-black text-[#064e17] uppercase tracking-widest text-center mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-[#e8f5e9] rounded-xl overflow-hidden bg-white"
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full text-left p-4 flex justify-between items-center hover:bg-[#f1f8e9] transition-colors"
                            >
                                <span className="font-semibold text-[#064e17]">{faq.q}</span>
                                <span
                                    className="text-[#2e7d32] transition-transform duration-200"
                                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                    ▼
                                </span>
                            </button>
                            {openFaq === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-4 pb-4 text-[#1a3a1a] text-sm leading-relaxed"
                                >
                                    {faq.a}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
