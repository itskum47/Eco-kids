require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const connectDB = require('../config/database');
const TreeSpecies = require('../models/TreeSpecies');

async function seedTreeSpecies() {
  await connectDB();

  const csvPath = path.join(__dirname, '../../TREE_SPECIES_CATALOG.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(content, {
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
    nativeStates: String(row.nativeStates || '').split('|').filter(Boolean),
    co2AbsorptionPerYear: Number(row.co2AbsorptionPerYear || 0),
    matureHeight: Number(row.matureHeight || 0),
    waterNeeds: row.waterNeeds,
    sunlight: row.sunlight,
    soilType: row.soilType,
    description: row.description,
    isActive: true
  }));

  await TreeSpecies.deleteMany({});
  await TreeSpecies.insertMany(docs);

  console.log(`Seeded ${docs.length} tree species`);
  process.exit(0);
}

seedTreeSpecies().catch((error) => {
  console.error('Failed to seed tree species:', error);
  process.exit(1);
});
