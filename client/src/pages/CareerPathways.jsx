import React from 'react';

// Static badge → career pathway mapping for undergraduate students
const CAREER_PATHWAYS = [
  {
    badge: 'tree-planter',
    badgeEmoji: '🌳',
    badgeLabel: 'Tree Planter',
    careers: ['Urban Forester', 'Landscape Ecologist', 'Carbon Credit Analyst'],
    description: 'Grounded in reforestation and urban greening, this pathway leads to careers restoring green infrastructure in cities and forests.',
    color: 'bg-green-50 border-green-200',
    dot: 'bg-green-500'
  },
  {
    badge: 'water-guardian',
    badgeEmoji: '💧',
    badgeLabel: 'Water Guardian',
    careers: ['Hydrologist', 'Water Policy Specialist', 'WASH Program Officer'],
    description: 'Focus on freshwater systems, conservation, and equitable access — critical roles across NGOs, government, and research.',
    color: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500'
  },
  {
    badge: 'clean-energy-advocate',
    badgeEmoji: '⚡',
    badgeLabel: 'Clean Energy Advocate',
    careers: ['Renewable Energy Consultant', 'Energy Policy Analyst', 'Solar Project Developer'],
    description: 'The clean energy transition is the defining infrastructure challenge. This pathway opens doors in policy, engineering, and finance.',
    color: 'bg-yellow-50 border-yellow-200',
    dot: 'bg-yellow-500'
  },
  {
    badge: 'biodiversity-scout',
    badgeEmoji: '🦋',
    badgeLabel: 'Biodiversity Scout',
    careers: ['Conservation Biologist', 'Wildlife Photographer', 'Biodiversity Finance Analyst'],
    description: 'Document and protect the living world — from field researchers to those designing biodiversity offset markets.',
    color: 'bg-purple-50 border-purple-200',
    dot: 'bg-purple-500'
  },
  {
    badge: 'zero-waste-champion',
    badgeEmoji: '♻️',
    badgeLabel: 'Zero Waste Champion',
    careers: ['Circular Economy Strategist', 'Waste Systems Engineer', 'EPR Compliance Officer'],
    description: 'Extended Producer Responsibility and circular design are legal mandates and market opportunities. This pathway leads there.',
    color: 'bg-orange-50 border-orange-200',
    dot: 'bg-orange-500'
  },
  {
    badge: 'climate-communicator',
    badgeEmoji: '📣',
    badgeLabel: 'Climate Communicator',
    careers: ['Environmental Journalist', 'CSR Sustainability Manager', 'Climate Campaign Director'],
    description: 'Translating science into action requires skilled communicators — in newsrooms, corporations, and advocacy organizations.',
    color: 'bg-rose-50 border-rose-200',
    dot: 'bg-rose-500'
  }
];

export default function CareerPathways({ userBadges = [] }) {
  const earnedIds = new Set(userBadges.map(b => b.badgeId || b));

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Career Pathways</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your EcoKids badges signal real-world environmental competencies. Explore the careers they unlock.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800">
        💡 These pathways are curated from India's growing green jobs market — NITI Aayog, MoEFCC, and private sector green finance roles included.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CAREER_PATHWAYS.map(pathway => {
          const earned = earnedIds.has(pathway.badge);
          return (
            <div
              key={pathway.badge}
              className={`rounded-xl border p-5 space-y-3 relative ${pathway.color} ${!earned ? 'opacity-60' : ''}`}
            >
              {earned && (
                <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Earned ✓
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{pathway.badgeEmoji}</span>
                <span className="font-semibold text-gray-800">{pathway.badgeLabel}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{pathway.description}</p>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Career Paths</p>
                <ul className="space-y-1">
                  {pathway.careers.map(career => (
                    <li key={career} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${pathway.dot}`} />
                      {career}
                    </li>
                  ))}
                </ul>
              </div>
              {!earned && (
                <p className="text-xs text-gray-400 italic">Complete activities to earn this badge</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-400 pt-2">
        Career pathway data sourced from India's National Green Jobs Initiative and green sector industry reports.
      </div>
    </div>
  );
}
