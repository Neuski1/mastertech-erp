const cron = require('node-cron');
const { sendBatchForCampaign } = require('../routes/campaigns');
const pool = require('../db/pool');

function startDailyCampaignJob() {
  // Run daily at 9:00 AM Mountain Time
  cron.schedule('0 9 * * *', async () => {
    console.log('Daily campaign send job started');
    try {
      const { rows: campaigns } = await pool.query(
        "SELECT id, name FROM email_campaigns WHERE status = 'sending'"
      );

      for (const campaign of campaigns) {
        console.log(`Sending batch for campaign: ${campaign.name} (ID: ${campaign.id})`);
        const sent = await sendBatchForCampaign(campaign.id, 100);
        console.log(`  Sent ${sent} emails for campaign ${campaign.id}`);
      }

      if (campaigns.length === 0) {
        console.log('No campaigns currently sending');
      }
    } catch (err) {
      console.error('Daily campaign send job error:', err);
    }
  }, {
    timezone: 'America/Denver',
  });

  console.log('Daily campaign send job scheduled — 9:00 AM MT');
}

module.exports = { startDailyCampaignJob };
