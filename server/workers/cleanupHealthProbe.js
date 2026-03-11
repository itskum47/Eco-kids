let lastRun = null;

const markCleanupRun = () => {
    lastRun = new Date();
};

const getCleanupHealth = () => ({
    lastRun,
    status: lastRun ? "healthy" : "waiting"
});

module.exports = { markCleanupRun, getCleanupHealth };
