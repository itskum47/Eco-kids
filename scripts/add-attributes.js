const appwrite = require('../server/config/appwrite-client');
const config = require('../server/config/appwrite-config');
const schemas = require('../server/schemas/collections');

class AttributeAdder {
  constructor() {
    this.databases = appwrite.getDatabase();
    this.config = config;
  }

  async addAttributesToCollection(collectionName, attributes) {
    console.log(`\nAdding attributes to: ${collectionName}`);

    for (const attr of attributes) {
      try {
        let result;

        switch(attr.type) {
          case 'email':
            result = await this.databases.createEmailAttribute(
              this.config.databaseId,
              collectionName,
              attr.name,
              attr.required || false
            );
            break;
          case 'string':
            result = await this.databases.createStringAttribute(
              this.config.databaseId,
              collectionName,
              attr.name,
              attr.size || 255,
              attr.required || false
            );
            break;
          case 'integer':
            result = await this.databases.createIntegerAttribute(
              this.config.databaseId,
              collectionName,
              attr.name,
              attr.required || false
            );
            break;
          case 'boolean':
            result = await this.databases.createBooleanAttribute(
              this.config.databaseId,
              collectionName,
              attr.name,
              attr.required || false
            );
            break;
          case 'datetime':
            result = await this.databases.createDatetimeAttribute(
              this.config.databaseId,
              collectionName,
              attr.name,
              attr.required || false
            );
            break;
        }

        console.log(`  ✓ ${attr.name} (${attr.type})`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ✓ ${attr.name} (exists)`);
        } else {
          console.error(`  ✗ ${attr.name}:`, error.message);
        }
      }
    }
  }

  async addAllAttributes() {
    console.log('═══════════════════════════════════════════════');
    console.log('ADDING ATTRIBUTES TO COLLECTIONS');
    console.log('═══════════════════════════════════════════════');

    for (const [key, schema] of Object.entries(schemas)) {
      await this.addAttributesToCollection(schema.collectionId, schema.attributes);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ ATTRIBUTES ADDED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════\n');
  }
}

const adder = new AttributeAdder();
adder.addAllAttributes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
