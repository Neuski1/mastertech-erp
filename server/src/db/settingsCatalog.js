// ---------------------------------------------------------------------------
// The catalog of owner-editable business settings.
//
// This file is the ONE place that says what Carol can change from Settings >
// Business Settings without a developer. Every entry seeds a row in
// system_settings (metadata only — an existing setting_value is never
// overwritten) and drives the editor UI: its label, its input type, its help
// text, and the range it will accept.
//
// `fallback` is the safety net. Every read site passes the same literal it used
// to hardcode, so if the row is missing, blank, or unparseable, the code keeps
// doing exactly what it did before this module existed. A settings table that
// fails to load can never silently turn a 3.5% fee into 0%.
//
// Adding a setting: add it here, then read it at the call site with
// settings.num()/str()/bool() passing the old hardcoded literal as the
// fallback. Nothing else is required — the migration, the editor, the audit
// log and the revert all pick it up automatically.
// ---------------------------------------------------------------------------

// value_type drives the editor input and the validator:
//   money     - dollars, 2dp, >= 0
//   percent   - STORED as a decimal (0.035), SHOWN as 3.5
//   number    - plain number, min/max enforced
//   integer   - whole number
//   text      - single line
//   longtext  - textarea, used for customer-facing wording
//   boolean   - true/false toggle
//   email     - single line, must look like an address
//   phone     - single line

const CATEGORIES = [
  { key: 'company',      label: 'Company Information', sort: 10,
    blurb: 'Name, address and contact details. These appear on invoices, contracts and customer emails.' },
  { key: 'shop_rates',   label: 'Shop Rates and Fees', sort: 20,
    blurb: 'Labor rate, shop supplies, credit card fee and sales tax. These drive every work order total.' },
  { key: 'storage_rates', label: 'Storage Rates', sort: 30,
    blurb: 'Default per-foot rates used when quoting a new storage space.' },
  { key: 'storage_fees', label: 'Storage Payment Fees', sort: 40,
    blurb: 'Convenience fees and late fees on storage billing. These change what customers are charged.' },
  { key: 'storage_policy', label: 'Storage Policy Wording', sort: 50,
    blurb: 'Text that prints on storage contracts, invoices and reminder emails.' },
  { key: 'work_orders',  label: 'Work Order Policy', sort: 60,
    blurb: 'Pickup window and the after-hours storage fee that prints on the invoice terms.' },
  { key: 'help_you_sell', label: 'Help You Sell Defaults', sort: 70,
    blurb: 'Starting values on a new Help You Sell agreement. Each agreement can still be changed individually.' },
  { key: 'automation',   label: 'Automation', sort: 80,
    blurb: 'Switches for the automatic emails and texts the system sends on its own.' },
];

const SETTINGS = [
  // -- Company ------------------------------------------------------------
  { key: 'company_name', category: 'company', sort: 10, value_type: 'text',
    label: 'Business name', fallback: 'Master Tech RV Repair and Storage',
    help: 'Prints on invoices, contracts and the footer of customer emails.' },
  { key: 'company_address', category: 'company', sort: 20, value_type: 'text',
    label: 'Street address', fallback: '6590 E. 49th Ave.',
    help: 'Street line only. City, state and ZIP are the next field.' },
  { key: 'company_city_state_zip', category: 'company', sort: 30, value_type: 'text',
    label: 'City, state, ZIP', fallback: 'Commerce City, CO 80022' },
  { key: 'company_phone', category: 'company', sort: 40, value_type: 'phone',
    label: 'Shop phone', fallback: '(303) 557-2214',
    help: 'Type it exactly as you want customers to see it, parentheses and all.' },
  { key: 'company_email', category: 'company', sort: 50, value_type: 'email',
    label: 'Shop email', fallback: 'service@mastertechrvrepair.com',
    help: 'The address customers reply to.' },
  { key: 'zelle_email', category: 'company', sort: 60, value_type: 'email',
    label: 'Zelle payment address', fallback: 'carol@mastertechrvrepair.com',
    help: 'Where Zelle payments are sent. Appears on storage invoices, contracts and reminder emails. Change this and every one of those follows.' },
  { key: 'owner_alert_email', category: 'company', sort: 70, value_type: 'email',
    label: 'Owner alert email', fallback: 'service@mastertechrvrepair.com',
    help: 'Where the system emails you when an autopay charge is declined or a job fails.' },

  // -- Shop rates ---------------------------------------------------------
  { key: 'labor_rate', category: 'shop_rates', sort: 10, value_type: 'money',
    label: 'Labor rate per hour', fallback: 198.00, min: 0, max: 1000,
    help: 'Default hourly rate on a new labor line. Existing work orders keep the rate they were written at.' },
  { key: 'shop_supplies_rate', category: 'shop_rates', sort: 20, value_type: 'percent',
    label: 'Shop supplies', fallback: 0.05, min: 0, max: 0.5,
    help: 'Percentage of labor added as shop supplies. Insurance jobs never waive this, whatever the toggle says.' },
  { key: 'cc_fee_rate', category: 'shop_rates', sort: 30, value_type: 'percent',
    label: 'Credit card fee (work orders)', fallback: 0.03, min: 0, max: 0.1,
    help: 'Grossed up so the processor taking its cut of the fee and tax still leaves you whole. Enter the rate the processor charges you.' },
  // Key is `tax_rate`, the name it has carried since the first seed migration.
  // Renaming it would orphan the live value, so the label does the explaining.
  { key: 'tax_rate', category: 'shop_rates', sort: 40, value_type: 'percent',
    label: 'Default sales tax rate', fallback: 0.0975, min: 0, max: 0.2,
    help: 'Applied to taxable parts plus shop supplies on NEW work orders. Each work order keeps the rate it was written at, so changing this never re-taxes an existing one.' },

  // -- Storage rates ------------------------------------------------------
  { key: 'storage_indoor_rate_per_ft', category: 'storage_rates', sort: 10, value_type: 'money',
    label: 'Indoor rate per linear foot', fallback: 23.00, min: 0, max: 200,
    help: 'Used to quote a new indoor space. Existing contracts keep their quoted rate.' },
  { key: 'storage_outdoor_rate_per_ft', category: 'storage_rates', sort: 20, value_type: 'money',
    label: 'Outdoor rate per linear foot', fallback: 6.00, min: 0, max: 200 },

  // -- Storage fees -------------------------------------------------------
  { key: 'storage_card_fee_pct', category: 'storage_fees', sort: 10, value_type: 'percent',
    label: 'Credit card convenience fee', fallback: 0.035, min: 0, max: 0.1,
    help: 'Added to storage rent for card and autopay customers. This changes what customers are actually charged on the next run.' },
  { key: 'storage_ach_fee_pct', category: 'storage_fees', sort: 20, value_type: 'percent',
    label: 'Bank transfer (ACH) fee', fallback: 0.01, min: 0, max: 0.1 },
  { key: 'storage_ach_fee_min', category: 'storage_fees', sort: 30, value_type: 'money',
    label: 'Minimum ACH fee', fallback: 1.00, min: 0, max: 100,
    help: 'Square charges a dollar minimum on bank transfers, so the fee never comes out below this.' },
  { key: 'storage_late_fee', category: 'storage_fees', sort: 40, value_type: 'money',
    label: 'Late fee amount', fallback: 25.00, min: 0, max: 1000,
    help: 'The figure quoted in the payment reminder email. Nothing assesses it automatically yet.' },
  { key: 'storage_late_fee_day', category: 'storage_fees', sort: 50, value_type: 'integer',
    label: 'Late after day of month', fallback: 5, min: 1, max: 28,
    help: 'Reminders say "please pay by the Nth to avoid a late fee".' },

  // -- Storage policy wording --------------------------------------------
  { key: 'storage_pickup_hours', category: 'storage_policy', sort: 10, value_type: 'text',
    label: 'Pickup hours, short form', fallback: 'Monday through Friday, 9 to 6',
    help: 'Used mid-sentence, as in "drop off your payment at the office, Monday through Friday, 9 to 6."' },
  { key: 'storage_pickup_hours_long', category: 'storage_policy', sort: 15, value_type: 'text',
    label: 'Pickup hours, full line',
    fallback: 'Monday through Friday, 9:00 AM to 6:00 PM. Closed Saturday, Sunday and major holidays.',
    help: 'The bold line in the Pickup and Drop-Off Hours box on every storage invoice.' },
  // One step per line. The PDF prints each line on its own row and the web
  // contract joins them with bullets, so the number of steps is up to you.
  { key: 'storage_late_fee_schedule', category: 'storage_policy', sort: 20, value_type: 'longtext',
    label: 'Late fee schedule (contract)',
    fallback: 'After 5 days late — $25 late fee\nAfter 10 days late — an additional $50 fee\nAfter 14 days late — $20/day charge up to 30 days late',
    help: 'One step per line. Prints on the storage contract PDF and the online contract page. This is legal text, so read it twice before changing it.' },
  { key: 'storage_autopay_terms', category: 'storage_policy', sort: 30, value_type: 'longtext',
    label: 'Autopay paragraph (contract)',
    fallback: 'Autopay payments are processed via Square and are subject to a 3.5% credit card processing fee. An invoice will be generated on the last day of each month for the following month’s storage fees. Upon making your first payment through Square, you will have the option to securely store your credit card on file for future automatic payments.',
    help: 'Shown on the storage contract under Autopay. If you change the card fee above, change the percentage quoted here to match, or the contract and the invoice will disagree.' },
  { key: 'storage_other_payment_terms', category: 'storage_policy', sort: 40, value_type: 'longtext',
    label: 'Check, cash and Zelle paragraph (contract)',
    fallback: 'We also accept payment by check, cash, or Zelle — all with no additional processing fee. Payments may be mailed or dropped off at our facility. For Zelle transfers, please send payment to {zelle_email}.',
    help: 'Write {zelle_email} anywhere in this paragraph and the Zelle address from Company Information is filled in automatically, so you only ever change it in one place.' },

  // -- Work order policy --------------------------------------------------
  { key: 'wo_pickup_grace_days', category: 'work_orders', sort: 10, value_type: 'integer',
    label: 'Pickup window after completion (days)', fallback: 2, min: 0, max: 30,
    help: 'How long a customer has to collect their RV before the daily storage fee starts.' },
  { key: 'wo_daily_storage_fee', category: 'work_orders', sort: 20, value_type: 'money',
    label: 'Daily outdoor storage fee after the window', fallback: 25.00, min: 0, max: 1000,
    help: 'Prints in the invoice terms. Does not apply to current storage customers or when prior arrangements are made.' },
  { key: 'wo_warranty_days', category: 'work_orders', sort: 30, value_type: 'integer',
    label: 'Warranty period (days)', fallback: 60, min: 0, max: 3650,
    help: 'Parts and labor, unless the parts manufacturer states otherwise. Customer-supplied parts are labor only. Prints on estimates, work orders and invoices.' },

  // -- Help You Sell ------------------------------------------------------
  // These four are stored on each agreement as WHOLE numbers (5 means 5%), so
  // the settings match that shape rather than the decimal used elsewhere.
  { key: 'hys_commission_pct', category: 'help_you_sell', sort: 10, value_type: 'number',
    label: 'Default commission (%)', fallback: 5, min: 0, max: 50,
    help: 'Enter 5 for five percent. Starting value on a new agreement; each agreement can still be set individually before it is sent.' },
  { key: 'hys_cancellation_fee_pct', category: 'help_you_sell', sort: 20, value_type: 'number',
    label: 'Default early cancellation fee (%)', fallback: 1, min: 0, max: 50,
    help: 'Enter 1 for one percent of the asking price.' },
  { key: 'hys_notice_days', category: 'help_you_sell', sort: 30, value_type: 'integer',
    label: 'Default notice period (days)', fallback: 30, min: 0, max: 365 },
  { key: 'hys_payment_days', category: 'help_you_sell', sort: 40, value_type: 'integer',
    label: 'Default payment window after sale (days)', fallback: 5, min: 0, max: 365 },

  // -- Automation ---------------------------------------------------------
  { key: 'payment_reminders_enabled', category: 'automation', sort: 10, value_type: 'boolean',
    label: 'Send automatic payment reminders', fallback: true,
    help: 'Emails and texts customers with an unpaid balance. Turning this off stops them immediately.' },
  { key: 'review_request_guard_days', category: 'automation', sort: 20, value_type: 'integer',
    label: 'Days before asking the same customer for another review', fallback: 365, min: 1, max: 3650,
    help: 'A customer is never asked twice inside this window, no matter how many jobs they bring in.' },
];

const BY_KEY = new Map(SETTINGS.map(s => [s.key, s]));

// The literal the code used before this module existed. Read sites pass their
// own fallback too; this is the backstop for the validator and the editor.
function fallbackFor(key) {
  const def = BY_KEY.get(key);
  return def ? def.fallback : null;
}

module.exports = { CATEGORIES, SETTINGS, BY_KEY, fallbackFor };
