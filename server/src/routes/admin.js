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

// ---------------------------------------------------------------------------
// Lead email signature — plain text appended to the Gmail compose window when
// replying to a new lead. Gmail drops your account signature whenever a body is
// pre-filled via URL, so we carry our own and let the owner edit it here.
// ---------------------------------------------------------------------------
const DEFAULT_LEAD_SIGNATURE = `Thank you,\n\nCarol Neu\nMaster Tech RV Repair & Storage\n6590 East 49th Avenue, Commerce City, CO 80022\n(303) 557-2214\nservice@mastertechrvrepair.com`;

router.get('/lead-email-signature', async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'lead_email_signature'"
    );
    res.json({ signature: rows[0] ? rows[0].setting_value : DEFAULT_LEAD_SIGNATURE });
  } catch (err) {
    console.error('GET /lead-email-signature error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/lead-email-signature', requireRole('admin'), async (req, res) => {
  try {
    const signature = typeof req.body?.signature === 'string' ? req.body.signature : '';
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value, description)
         VALUES ('lead_email_signature', $1, 'Signature appended to lead reply emails')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1`,
      [signature]
    );
    res.json({ success: true, signature });
  } catch (err) {
    console.error('POST /lead-email-signature error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
