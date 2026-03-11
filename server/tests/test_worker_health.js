const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

async function runWorkerTest() {
    console.log('Running Worker Health Test...');
    try {
        const connection = new Redis('redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null,
            enableReadyCheck: false
        });

        const testQueue = new Queue('HealthTestQueue', { connection });

        // Setup worker
        const worker = new Worker('HealthTestQueue', async (job) => {
            // Simulate work
            return { success: true };
        }, { connection });

        let isDone = false;

        worker.on('completed', () => {
            console.log('Worker test: PASS');
            isDone = true;
        });

        worker.on('failed', (job, err) => {
            console.error('Worker test: FAIL', err);
            isDone = true;
        });

        await testQueue.add('testJob', { foo: 'bar' });

        // Wait for completion
        let attempts = 0;
        while (!isDone && attempts < 50) {
            await new Promise(r => setTimeout(r, 100)); // wait 100ms
            attempts++;
        }

        await worker.close();
        await connection.quit();

        if (!isDone) {
            console.error('Worker test: FAIL (Timeout)');
            process.exit(1);
        }
        process.exit(0);

    } catch (err) {
        console.error('Worker test setup error:', err);
        process.exit(1);
    }
}

runWorkerTest();
