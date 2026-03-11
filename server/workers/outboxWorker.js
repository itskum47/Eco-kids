const OutboxEvent = require("../models/OutboxEvent");
const { gamificationQueue } = require("../queues/gamificationQueue");

const processOutbox = async () => {
    try {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const candidates = await OutboxEvent.find({
            processed: false,
            $or: [
                { processing: false },
                { processingAt: { $lt: fiveMinsAgo } }
            ]
        }).limit(20);

        for (const candidate of candidates) {
            const event = await OutboxEvent.findOneAndUpdate(
                {
                    _id: candidate._id,
                    processed: false,
                    $or: [
                        { processing: false },
                        { processingAt: { $lt: fiveMinsAgo } }
                    ]
                },
                {
                    processing: true,
                    processingAt: new Date()
                },
                { new: true }
            );

            if (!event) continue;

            try {
                await gamificationQueue.add(
                    "processGamification",
                    event.payload,
                    {
                        attempts: 5,
                        backoff: {
                            type: "exponential",
                            delay: 2000
                        },
                        removeOnComplete: true,
                        removeOnFail: false
                    }
                );

                event.processed = true;
                event.processing = false;
                event.processingAt = null;
                await event.save();
                console.log(`[OutboxWorker] Processed event ${event._id}`);
            } catch (err) {
                console.error(`[OutboxWorker] Failed to process event ${event._id}:`, err);
                event.processing = false;
                event.processingAt = null;
                await event.save();
            }
        }
    } catch (error) {
        console.error(`[OutboxWorker] Polling error:`, error);
    }
};

let intervalId;

const startOutboxWorker = () => {
    console.log("[OutboxWorker] Started polling every 3 seconds...");
    intervalId = setInterval(processOutbox, 3000);
};

const stopOutboxWorker = () => {
    if (intervalId) {
        clearInterval(intervalId);
        console.log("[OutboxWorker] Stopped polling.");
    }
};

module.exports = {
    processOutbox,
    startOutboxWorker,
    stopOutboxWorker
};
