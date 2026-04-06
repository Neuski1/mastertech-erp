const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// GET /api/admin/reminder-settings
router.get('/reminder-settings', requireRole('admin'), async (req, res) => {
  try {
    const { rows: settings } = await pool.query(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'payment_reminder%'"
    );

    const { rows: pending } = await pool.query(
      "SELECT COUNT(*) AS count FROM records WHERE deleted_at IS NULL AND status IN ('payment_pending', 'partial') AND amount_due > 0"
    );

    const settingsMap = {};
    for (const s of settings) {
      settingsMap[s.setting_key] = s.setting_value;
    }

    res.json({
      ...settingsMap,
      pending_records: parseInt(pending[0].count),
    });
  } catch (err) {
    console.error('GET /reminder-settings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/reminder-settings — toggle enabled
router.post('/reminder-settings', requireRole('admin'), async (req, res) => {
  try {
    const { enabled } = req.body;
    const newValue = enabled ? 'true' : 'false';

    await pool.query(
      "UPDATE system_settings SET setting_value = $1 WHERE setting_key = 'payment_reminders_enabled'",
      [newValue]
    );

    res.json({ success: true, payment_reminders_enabled: newValue });
  } catch (err) {
    console.error('POST /reminder-settings error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
