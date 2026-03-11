require("dotenv").config();
const connectDB = require("../config/database");
const { startOutboxWorker } = require("./outboxWorker");

connectDB().then(() => {
    console.log("Database connected for Outbox worker");
    startOutboxWorker();
}).catch(err => {
    console.error("Failed to connect database for outbox worker:", err);
    process.exit(1);
});

process.on("SIGINT", () => {
    console.log("Shutting down Outbox worker...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("Shutting down Outbox worker...");
    process.exit(0);
});
