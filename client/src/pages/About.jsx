import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const impactStats = [
  { label: 'Students Reached', value: '50,000+' },
  { label: 'Schools Engaged', value: '340+' },
  { label: 'Eco Activities Logged', value: '120,000+' },
  { label: 'Eco-Points Awarded', value: '8.2M+' }
];

const sdgs = [
  { id: 'SDG 6', title: 'Clean Water & Sanitation', emoji: '💧' },
  { id: 'SDG 12', title: 'Responsible Consumption', emoji: '♻️' },
  { id: 'SDG 13', title: 'Climate Action', emoji: '🌍' },
  { id: 'SDG 15', title: 'Life on Land', emoji: '🌱' }
];

const team = [
  { role: 'Product & Partnerships', desc: 'Curriculum and public-sector integration' },
  { role: 'Education & Pedagogy', desc: 'NEP-aligned learning design and assessment' },
  { role: 'Engineering & Data', desc: 'Scalable platform, analytics, and reliability' }
];

const complianceBadges = [
  'DPDP Act 2023',
  'UDISE+ Ready',
  'NEP 2020 Aligned',
  'SDG Impact Reporting',
  'POCSO Safety Workflow',
  'CERT-In Incident Process',
  'India Data Residency (ap-south-1)'
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#f9fffe]">
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-[#2e7d32] tracking-widest uppercase mb-3"
          >
            Why EcoKids?
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-black text-[#0a1e0a] leading-tight"
            style={{ fontSize: 'clamp(32px, 5vw, 58px)' }}
          >
            India needs climate-ready learners now
          </motion.h1>
          <p className="max-w-3xl mx-auto text-[#1a3a1a] mt-5 text-lg leading-relaxed">
            1 in 3 children in India faces growing environmental risk, but most schools still lack
            practical, measurable climate learning workflows.
          </p>
        </div>
      </section>

      <section className="pb-14 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-[#d8edd9] rounded-2xl p-7 shadow-sm"
          >
            <h2 className="text-2xl font-black text-[#0a1e0a] mb-3">India&apos;s Gap</h2>
            <p className="text-[#1a3a1a] leading-relaxed">
              Classrooms often teach theory without local, action-based sustainability practice.
              Teachers have limited tools to verify impact, track student behavior change, and report
              outcomes to school leadership.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#e8f5e9] border border-[#b7dfb9] rounded-2xl p-7 shadow-sm"
          >
            <h2 className="text-2xl font-black text-[#0a1e0a] mb-3">Our Solution</h2>
            <p className="text-[#1a3a1a] leading-relaxed">
              EcoKids combines curriculum-aligned lessons, real-world challenges, verification workflows,
              and gamified motivation into one platform for students, teachers, and administrators.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-black text-[#0a1e0a] mb-7">Impact Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {impactStats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#d8edd9] rounded-2xl p-5 text-center"
              >
                <p className="text-2xl md:text-3xl font-black text-[#2e7d32]">{stat.value}</p>
                <p className="text-sm font-semibold text-[#2a4a2a] mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-black text-[#0a1e0a] mb-7">SDG Alignment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sdgs.map((sdg) => (
              <motion.div
                key={sdg.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-[#d8edd9] rounded-2xl p-5"
              >
                <p className="text-2xl">{sdg.emoji}</p>
                <p className="text-sm font-black text-[#2e7d32] mt-2">{sdg.id}</p>
                <p className="text-sm text-[#1a3a1a] mt-1">{sdg.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8f5e9] border border-[#b7dfb9] rounded-full">
            <span className="text-lg">🎓</span>
            <span className="text-sm font-bold text-[#145214]">NEP 2020 Aligned</span>
          </div>

          <div className="mt-6 bg-white border border-[#d8edd9] rounded-2xl p-7">
            <h2 className="text-2xl font-black text-[#0a1e0a] mb-3">Government Compliance Badges</h2>
            <div className="flex flex-wrap gap-3">
              {complianceBadges.map((badge) => (
                <span key={badge} className="px-3 py-2 rounded-full border border-[#b7dfb9] bg-[#f3fbf4] text-[#145214] text-sm font-bold">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-white border border-[#d8edd9] rounded-2xl p-7">
            <h2 className="text-2xl font-black text-[#0a1e0a] mb-3">Team</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {team.map((member) => (
                <div key={member.role} className="rounded-xl border border-[#e6f2e6] p-4">
                  <p className="font-bold text-[#145214]">{member.role}</p>
                  <p className="text-sm text-[#2a4a2a] mt-1">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
