// server/src/routes/plaid-webhook.js
// Public Plaid webhook endpoint - no auth required.
// Plaid POSTs here when transactions are updated.

const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { webhook_type, webhook_code, item_id } = req.body || {};
  console.log('Plaid webhook:', webhook_type, webhook_code, item_id);
  // Acknowledge immediately. Actual sync runs on cron.
  res.status(200).json({ ok: true });
});

module.exports = router;
