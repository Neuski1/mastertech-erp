/**
 * Dialpad SMS service — low-level HTTP wrapper for Dialpad's REST API.
 * Docs: https://developers.dialpad.com/reference/smssend
 *
 * Required environment variables:
 *   DIALPAD_API_KEY      Bearer token from Admin Settings -> Authentication -> API keys
 *   DIALPAD_FROM_NUMBER  E.164 number assigned to a Dialpad user/group (e.g. "+13035572214")
 *
 * Optional:
 *   DIALPAD_USER_ID      Numeric user ID to send on behalf of (falls back to from_number)
 *   DIALPAD_BASE_URL     Override (default https://dialpad.com/api/v2)
 */

const DIALPAD_BASE = process.env.DIALPAD_BASE_URL || 'https://dialpad.com/api/v2';

function isDialpadConfigured() {
  return !!(process.env.DIALPAD_API_KEY && (process.env.DIALPAD_FROM_NUMBER || process.env.DIALPAD_USER_ID));
}

/**
 * Send a single SMS via Dialpad.
 * @param {string} toE164  Recipient phone in E.164 format (e.g. "+13035551234")
 * @param {string} text    Message body
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
async function sendDialpadSMS(toE164, text) {
  if (!isDialpadConfigured()) {
    return { success: false, error: 'Dialpad not configured (missing DIALPAD_API_KEY or DIALPAD_FROM_NUMBER)' };
  }

  const body = {
    to_numbers: [toE164],
    text,
  };
  if (process.env.DIALPAD_FROM_NUMBER) body.from_number = process.env.DIALPAD_FROM_NUMBER;
  if (process.env.DIALPAD_USER_ID)    body.user_id = parseInt(process.env.DIALPAD_USER_ID, 10);

  try {
    const res = await fetch(`${DIALPAD_BASE}/sms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIALPAD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = data.error_message || data.error || JSON.stringify(data) || `HTTP ${res.status}`;
      console.error('[dialpad] send failed:', res.status, errMsg);
      return { success: false, error: errMsg };
    }
    return { success: true, id: data.id || data.message_id || null, raw: data };
  } catch (err) {
    console.error('[dialpad] send exception:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendDialpadSMS,
  isDialpadConfigured,
};
