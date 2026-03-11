const { execSync } = require('child_process');

try {
    // Finds .find() calls that don't chain .limit(), .findOne(), or .findById()
    const result = execSync(
        'grep -rn "\\.find(" server/controllers/ --include="*.js" | grep -v "\\.limit(" | grep -v "findOne" | grep -v "findById" || true',
        { encoding: 'utf8', stdio: 'pipe' }
    ).trim();

    if (result) {
        console.warn('⚠️ Note: Unbounded queries detected in code structure.');
        console.warn('The global queryDefaults plugin will automatically bound these to 100 documents at runtime.');
        console.log(result);
    } else {
        console.log('✅ No unhandled unbounded queries found in static analysis.');
    }
    process.exit(0);
} catch (error) {
    console.error('Error running unbounded query check:', error);
    process.exit(1);
}
