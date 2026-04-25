const crypto = require('crypto');
const LeaderboardSnapshot = require('../models/LeaderboardSnapshot');

const MAX_STORED_ENTRIES = 100;

function normalizeScope(scope = {}) {
  const keys = Object.keys(scope).sort();
  const normalized = {};
  for (const key of keys) {
    if (scope[key] !== undefined && scope[key] !== null && scope[key] !== '') {
      normalized[key] = String(scope[key]);
    }
  }
  return normalized;
}

function getScopeKey(scope = {}) {
  return JSON.stringify(normalizeScope(scope));
}

function createSnapshotHash(entries = []) {
  const digestPayload = entries.map((entry) => ({
    rank: Number(entry.rank || 0),
    id: String(entry.id || ''),
    name: String(entry.name || ''),
    ecoPoints: Number(entry.ecoPoints || 0),
  }));

  return crypto.createHash('sha256').update(JSON.stringify(digestPayload)).digest('hex');
}

async function persistLeaderboardSnapshot({
  boardType,
  scope = {},
  entries = [],
  metadata = {},
  scoreModelVersion = 'score-authority-v1',
}) {
  if (!boardType || !Array.isArray(entries) || entries.length === 0) {
    return { saved: false, reason: 'invalid-input' };
  }

  const scopeKey = getScopeKey(scope);
  const topEntries = entries.slice(0, MAX_STORED_ENTRIES).map((entry) => ({
    rank: Number(entry.rank || 0),
    id: String(entry.id || ''),
    name: String(entry.name || ''),
    ecoPoints: Number(entry.ecoPoints || 0),
    level: Number(entry.level || 0),
    streak: Number(entry.streak || 0),
    school: entry.school ? String(entry.school) : undefined,
  }));

  const snapshotHash = createSnapshotHash(topEntries);

  const latest = await LeaderboardSnapshot.findOne({ boardType, scopeKey })
    .sort({ snapshotAt: -1 })
    .select('snapshotHash')
    .lean();

  if (latest?.snapshotHash === snapshotHash) {
    return { saved: false, reason: 'unchanged', snapshotHash };
  }

  const saved = await LeaderboardSnapshot.create({
    boardType,
    scope: normalizeScope(scope),
    scopeKey,
    snapshotAt: new Date(),
    scoreModelVersion,
    snapshotHash,
    entryCount: entries.length,
    topEntries,
    metadata,
  });

  return { saved: true, snapshotId: saved._id, snapshotHash };
}

async function getSnapshotHistory({ boardType, scope = {}, limit = 20 }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (boardType) {
    query.boardType = boardType;
  }

  const normalizedScope = normalizeScope(scope);
  if (Object.keys(normalizedScope).length > 0) {
    query.scopeKey = getScopeKey(normalizedScope);
  }

  return LeaderboardSnapshot.find(query)
    .sort({ snapshotAt: -1 })
    .limit(safeLimit)
    .lean();
}

module.exports = {
  persistLeaderboardSnapshot,
  getSnapshotHistory,
};
