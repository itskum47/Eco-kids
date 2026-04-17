require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { parse } = require('csv-parse/sync');
const connectDB = require('../config/database');
const TreeSpecies = require('../models/TreeSpecies');

async function seedTreeSpecies() {
  await connectDB();
  console.log('✓ Connected to MongoDB');

  const csvPath = path.join(__dirname, '../../TREE_SPECIES_CATALOG.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const docs = rows.map((row) => ({
    speciesId: row.speciesId,
    scientificName: row.scientificName,
    commonNameEn: row.commonNameEn,
    commonNameHi: row.commonNameHi,
    region: row.region,
    nativeStates: String(row.nativeStates || '')
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean),
    co2AbsorptionPerYear: Number(row.co2AbsorptionPerYear || 0),
    matureHeight: Number(row.matureHeight || 0),
    matureAge: Number(row.matureAge || 0),
    waterNeeds: row.waterNeeds || 'medium',
    sunlight: row.sunlight || 'full',
    soilType: row.soilType || '',
    description: row.description || '',
    isActive: true
  }));

  await TreeSpecies.deleteMany({});
  console.log('✓ Cleared existing species');

  await TreeSpecies.insertMany(docs);

  const regionOrder = ['himalayan', 'coastal', 'desert', 'forest', 'urban'];
  const counts = docs.reduce((acc, doc) => {
    acc[doc.region] = (acc[doc.region] || 0) + 1;
    return acc;
  }, {});

  console.log(`✓ Seeded ${docs.length} tree species`);
  regionOrder.forEach((region) => {
    console.log(`  - ${region}: ${counts[region] || 0} species`);
  });
  console.log(`✓ Total species: ${docs.length}`);
}

seedTreeSpecies()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('✗ Failed to seed tree species:', error.message);
    try {
      await mongoose.connection.close();
    } catch (_) {
      // ignore close errors
    }
    process.exit(1);
  });
