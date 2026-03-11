const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/User');
const IntegrationKey = require('./models/IntegrationKey');
const AdminAuditLog = require('./models/AdminAuditLog');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecokids', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

async function createIntegrationTest() {
    console.log('🧪 Starting Phase 4 Machine-to-Machine Integration Test...');
    await connectDB();

    const rawNGOKey = 'ngo-key-12345';
    const hashedNGOKey = crypto.createHash('sha256').update(rawNGOKey).digest('hex');

    // Clear previous bounds
    await IntegrationKey.deleteMany({ name: 'Testing NGO Key' });

    // 1. Create Bounded IntegrationKey
    const key = await IntegrationKey.create({
        name: 'Testing NGO Key',
        organization: 'UNICEF Punjab',
        apiKeyHash: hashedNGOKey,
        scope: 'state',
        state: 'Punjab',
        isActive: true
    });

    console.log('✅ NGO Integration Key generated natively. Sending bounds...');

    // 2. Test Integration Fetch via API Key
    const headers = { 'x-api-key': rawNGOKey };

    // Fetch state summary
    const stateRes = await fetch('http://localhost:5001/api/integration/state-summary', { headers });
    const stateData = await stateRes.json();

    if (!stateData.success || !stateData.data) {
        console.error('❌ State bounded API key fetch failed');
        process.exit(1);
    }
    console.log(`✅ Organization 'UNICEF Punjab' scoped fetch succeeded`);

    // 3. Test Unauthorized Scope Block
    const blockRes = await fetch('http://localhost:5001/api/integration/district-summary?district=Ludhiana', { headers });
    const blockData = await blockRes.json();

    if (blockData.success) {
        console.log(`✅ State API verified cascading down accessing specific subset within state boundaries naturally`);
    } else {
        console.error('❌ Scope cascade failed. A state-level bounding box should be able to see districts beneath it.');
        process.exit(1);
    }

    // 4. Test Missing Key Block
    const failRes = await fetch('http://localhost:5001/api/integration/verified-activities');
    if (failRes.status !== 401) {
        console.error('❌ Endpoint exposed without API key required middleware');
        process.exit(1);
    }
    console.log('✅ Machine endpoint actively blocked unidentified access');

    // 5. Test Audit Log Interception
    const auditHit = await AdminAuditLog.findOne({ organization: 'UNICEF Punjab', action: 'INTEGRATION_ACCESS' }).sort({ createdAt: -1 });
    if (!auditHit) {
        console.error('❌ Failed mapping integration track into operational AdminAuditLog system');
        process.exit(1);
    }
    console.log(`✅ Integration Action properly mapped to Audit Log at IP ${auditHit.ipAddress}`);

    console.log('🎉 ALL PHASE 4 INTEGRATION TESTS PASSED!');
    process.exit(0);
}

createIntegrationTest().catch(e => {
    console.error(e);
    process.exit(1);
});
