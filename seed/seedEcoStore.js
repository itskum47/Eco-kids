const StoreItem = require('../server/models/StoreItem');

const DEFAULT_ITEMS = [
  {
    name: 'Digital Eco Champion Badge',
    description: 'A special profile badge recognizing your green actions.',
    category: 'badge',
    ecoCoinCost: 120,
    stock: -1,
    imageUrl: ''
  },
  {
    name: 'Tree Plantation Certificate',
    description: 'Downloadable certificate for completing sustainability milestones.',
    category: 'certificate',
    ecoCoinCost: 180,
    stock: -1,
    imageUrl: ''
  },
  {
    name: 'EcoKids Sticker Pack',
    description: 'Physical sticker pack with eco themes and mascots.',
    category: 'physical',
    ecoCoinCost: 250,
    stock: 200,
    imageUrl: ''
  },
  {
    name: 'Reusable Water Bottle Voucher',
    description: 'Voucher redeemable for one reusable bottle with partner stores.',
    category: 'voucher',
    ecoCoinCost: 500,
    stock: 100,
    imageUrl: ''
  },
  {
    name: 'Virtual Mentor Session',
    description: 'One 20-minute online sustainability mentor session.',
    category: 'experience',
    ecoCoinCost: 800,
    stock: 50,
    imageUrl: ''
  },
  {
    name: 'Eco Journal Kit',
    description: 'Notebook set for tracking your daily eco actions.',
    category: 'physical',
    ecoCoinCost: 320,
    stock: 150,
    imageUrl: ''
  },
  {
    name: 'School Garden Seed Pack',
    description: 'Seed starter kit for eco-club gardening activities.',
    category: 'physical',
    ecoCoinCost: 420,
    stock: 120,
    imageUrl: ''
  },
  {
    name: 'Recycling Champion Pin',
    description: 'Collectible metal pin for top recycling performers.',
    category: 'badge',
    ecoCoinCost: 280,
    stock: 300,
    imageUrl: ''
  },
  {
    name: 'Sustainability Workshop Pass',
    description: 'Access pass to one live sustainability workshop.',
    category: 'experience',
    ecoCoinCost: 650,
    stock: 90,
    imageUrl: ''
  },
  {
    name: 'Eco Library Voucher',
    description: 'Voucher for digital environmental storybooks.',
    category: 'voucher',
    ecoCoinCost: 360,
    stock: 180,
    imageUrl: ''
  }
];

const seedEcoStore = async () => {
  const existingCount = await StoreItem.countDocuments();

  if (existingCount > 0) {
    console.log('ℹ️ Eco Store already seeded; skipping default store items');
    return;
  }

  await StoreItem.insertMany(DEFAULT_ITEMS);
  console.log(`✅ Seeded Eco Store with ${DEFAULT_ITEMS.length} items`);
};

module.exports = seedEcoStore;
