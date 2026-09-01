// ---------------------------------------------------------------------------
// requireAuthOrAgentKey — a browser JWT, or one of the two automation keys.
//
// There are two keys in this system and they are easy to confuse:
//   X-Cowork-Key  → COWORK_API_KEY   the Cowork agents (Terri, Smile, the ERP
//                                    agent's SQL endpoint)
//   X-API-Key     → IMPORT_API_KEY   the Gmail order-import job
//
// `requireAuthOrApiKey` in middleware/auth.js accepts ONLY the second one.
// Anything meant for the marketing agents must use this instead, or the agent
// gets a 401 that looks like a broken token.
//
// A request authenticated by key gets req.isAgent = true and a synthetic user.
// Routes that must stay human (approve, send, delete) check req.isAgent and
// refuse.
// ---------------------------------------------------------------------------
const { requireAuth } = require('./auth');

function requireAuthOrAgentKey(req, res, next) {
  const coworkKey = req.headers['x-cowork-key'];
  if (coworkKey && process.env.COWORK_API_KEY && coworkKey === process.env.COWORK_API_KEY) {
    req.isAgent = true;
    req.user = { id: null, email: 'agent@mastertechrvrepair.com', name: 'Cowork Agent', role: 'admin' };
    return next();
  }

  const importKey = req.headers['x-api-key'];
  if (importKey && process.env.IMPORT_API_KEY && importKey === process.env.IMPORT_API_KEY) {
    req.isAgent = true;
    req.user = { id: 0, email: 'import-bot@mastertechrvrepair.com', name: 'Import Bot', role: 'admin' };
    return next();
  }

  return requireAuth(req, res, next);
}

// Block a route to agents even though the key got them through the door.
function humansOnly(req, res, next) {
  if (req.isAgent) {
    return res.status(403).json({ error: 'This action requires a signed-in person, not an agent key.' });
  }
  next();
}

module.exports = { requireAuthOrAgentKey, humansOnly };
