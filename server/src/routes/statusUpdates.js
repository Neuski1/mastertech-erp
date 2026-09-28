// Staff routes for work order status texts. Mounted at /api/records behind
// requireAuth. See services/statusUpdates.js.
const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const svc = require('../services/statusUpdates');

const SENDERS = ['admin', 'service_writer', 'technician'];

// GET /api/records/:recordId/status-updates
// The modal's starting point: buttons, drafts, recipient, blockers, history.
router.get('/:recordId/status-updates', async (req, res) => {
  try {
    const options = await svc.composeOptions(req.params.recordId);
    if (!options) return res.status(404).json({ error: 'Record not found' });
    const history = await svc.listUpdates(req.params.recordId);
    res.json({ ...options, history });
  } catch (err) {
    console.error('GET status-updates error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records/:recordId/status-updates
// Body: { type, note?, message?, photo_ids?, dryRun? }
// dryRun returns the exact text and recipient and sends nothing.
router.post('/:recordId/status-updates', requireRole(...SENDERS), async (req, res) => {
  const { type, note, message, photo_ids, dryRun } = req.body || {};
  try {
    const out = await svc.sendStatusUpdate(req.params.recordId, {
      type, note, message, photoIds: photo_ids, userId: req.user?.id, dryRun: dryRun === true,
    });
    if (!out.ok) return res.status(out.status || 400).json({ error: out.error });
    res.status(out.dryRun ? 200 : 201).json(out);
  } catch (err) {
    console.error('POST status-updates error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
