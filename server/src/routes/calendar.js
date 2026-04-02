const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getOAuth2Client, getStoredTokens, storeTokens, clearTokens, getCalendarId } = require('../utils/googleCalendar');
const { google } = require('googleapis');
const pool = require('../db/pool');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// ---------------------------------------------------------------------------
// GET /api/calendar/status — Check connection status
// ---------------------------------------------------------------------------
router.get('/status', requireAuth, async (req, res) => {
  const tokens = await getStoredTokens();
  if (!tokens) return res.json({ connected: false });

  try {
    const oauth2 = getOAuth2Client();
    oauth2.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2 });
    const calendarId = await getCalendarId();
    const cal = await calendar.calendarList.get({ calendarId });
    res.json({ connected: true, calendarName: cal.data.summary, calendarId });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/calendar/auth — Start OAuth flow
// ---------------------------------------------------------------------------
router.get('/auth', requireAuth, requireRole('admin'), (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(400).json({ error: 'Google Calendar credentials not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in Railway environment variables.' });
  }
  const oauth2 = getOAuth2Client();
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.json({ url });
});

// ---------------------------------------------------------------------------
// GET /api/calendar/oauth/callback — Handle OAuth callback
// ---------------------------------------------------------------------------
router.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    const oauth2 = getOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    await storeTokens(tokens);

    // Redirect back to settings page
    const frontend = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
    res.redirect(`${frontend}/settings?calendar=connected`);
  } catch (err) {
    console.error('Google Calendar OAuth error:', err);
    const frontend = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
    res.redirect(`${frontend}/settings?calendar=error&message=${encodeURIComponent(err.message)}`);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/calendar/disconnect — Remove stored tokens
// ---------------------------------------------------------------------------
router.delete('/disconnect', requireAuth, requireRole('admin'), async (req, res) => {
  await clearTokens();
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// GET /api/calendar/calendars — List available calendars
// ---------------------------------------------------------------------------
router.get('/calendars', requireAuth, requireRole('admin'), async (req, res) => {
  const tokens = await getStoredTokens();
  if (!tokens) return res.status(400).json({ error: 'Not connected to Google Calendar' });

  try {
    const oauth2 = getOAuth2Client();
    oauth2.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2 });
    const list = await calendar.calendarList.list();
    res.json(list.data.items.map(c => ({ id: c.id, name: c.summary })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/calendar/select — Choose which calendar to sync to
// ---------------------------------------------------------------------------
router.post('/select', requireAuth, requireRole('admin'), async (req, res) => {
  const { calendarId } = req.body;
  if (!calendarId) return res.status(400).json({ error: 'calendarId required' });
  await pool.query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('google_calendar_id', $1)
     ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1`,
    [calendarId]
  );
  res.json({ success: true, calendarId });
});

module.exports = router;
