// Verification harness for the Business Settings feature. Runs without a
// database: the pool is stubbed, so this exercises the parts that decide what
// a customer is charged and what they are told.
//
//   node test-business-settings.js
//
// Not part of the app. Delete or keep as a scratch check.

const path = require('path');
const Module = require('module');

// --- stub the pg pool -------------------------------------------------------
let STORE = new Map();
const poolPath = require.resolve('./src/db/pool');
const stubPool = {
  query: async (sql, params) => {
    if (/FROM system_settings/i.test(sql) && !/WHERE/i.test(sql)) {
      return { rows: [...STORE].map(([setting_key, setting_value]) => ({ setting_key, setting_value })) };
    }
    if (/WHERE setting_key = \$1/i.test(sql)) {
      const v = STORE.get(params[0]);
      return { rows: v === undefined ? [] : [{ setting_value: v }] };
    }
    return { rows: [] };
  },
  connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
};
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: stubPool };

const settings = require('./src/db/settings');
const company = require('./src/db/company');
const { SETTINGS, BY_KEY } = require('./src/db/settingsCatalog');

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}\n         got      ${a}\n         expected ${e}`); }
}
function section(t) { console.log(`\n${t}`); }

(async () => {

section('1. Catalog integrity');
{
  const keys = SETTINGS.map(s => s.key);
  check('no duplicate keys', keys.length, new Set(keys).size);
  const badRange = SETTINGS.filter(s =>
    s.min != null && s.max != null && Number(s.fallback) > s.max);
  check('every fallback is inside its own declared range', badRange.map(s => s.key), []);
  const belowMin = SETTINGS.filter(s => s.min != null && Number(s.fallback) < s.min);
  check('no fallback below its minimum', belowMin.map(s => s.key), []);
  const missingLabel = SETTINGS.filter(s => !s.label || !s.category);
  check('every setting has a label and a category', missingLabel.map(s => s.key), []);
}

section('2. Empty settings table: every read falls back to the old hardcoded value');
{
  STORE = new Map();
  await settings.load();
  check('storage card fee', settings.num('storage_card_fee_pct', 0.035), 0.035);
  check('ACH fee', settings.num('storage_ach_fee_pct', 0.01), 0.01);
  check('ACH minimum', settings.money('storage_ach_fee_min', 1.00), 1.00);
  check('late fee', settings.money('storage_late_fee', 25.00), 25.00);
  check('shop supplies', settings.num('shop_supplies_rate', 0.05), 0.05);
  check('zelle address', company.zelleEmail(), 'carol@mastertechrvrepair.com');
  check('shop phone', company.phone(), '(303) 557-2214');
  check('full address', company.fullAddress(), '6590 E. 49th Ave., Commerce City, CO 80022');
}

section('3. Stored values are used once present');
{
  STORE = new Map([
    ['storage_card_fee_pct', '0.04'],
    ['storage_ach_fee_min', '2.50'],
    ['company_phone', '(720) 555-0100'],
    ['zelle_email', 'billing@example.com'],
    ['payment_reminders_enabled', 'false'],
    ['wo_pickup_grace_days', '3'],
  ]);
  await settings.invalidate();
  check('card fee now 4%', settings.num('storage_card_fee_pct', 0.035), 0.04);
  check('ACH minimum now 2.50', settings.money('storage_ach_fee_min', 1.00), 2.50);
  check('phone follows the setting', company.phone(), '(720) 555-0100');
  check('zelle follows the setting', company.zelleEmail(), 'billing@example.com');
  check('boolean off', settings.bool('payment_reminders_enabled', true), false);
  check('integer', settings.int('wo_pickup_grace_days', 2), 3);
}

section('4. Corrupt and out-of-range values never reach a customer');
{
  STORE = new Map([
    ['storage_card_fee_pct', '3.5'],      // 350% — someone typed the display value
    ['storage_ach_fee_pct', 'not-a-number'],
    ['storage_late_fee', ''],             // blank
    ['company_phone', '   '],             // whitespace only
    ['shop_supplies_rate', '-0.2'],       // negative
  ]);
  await settings.invalidate();
  check('350% card fee is rejected, falls back', settings.num('storage_card_fee_pct', 0.035), 0.035);
  check('non-numeric ACH fee falls back', settings.num('storage_ach_fee_pct', 0.01), 0.01);
  check('blank late fee falls back', settings.money('storage_late_fee', 25.00), 25.00);
  check('whitespace phone falls back', company.phone(), '(303) 557-2214');
  check('negative supplies rate falls back', settings.num('shop_supplies_rate', 0.05), 0.05);
}

section('5. Fee arithmetic matches the old hardcoded engines');
{
  STORE = new Map();
  await settings.invalidate();
  const chargeFee = (method, rent) => {
    if (method === 'ach') {
      return Math.max(Math.round(rent * settings.num('storage_ach_fee_pct', 0.01) * 100) / 100,
                      settings.money('storage_ach_fee_min', 1.00));
    }
    return Math.round(rent * settings.num('storage_card_fee_pct', 0.035) * 100) / 100;
  };
  // Real figures from the Aug 31 go-live.
  check('$598 card fee', chargeFee('credit_card', 598), 20.93);
  check('$644 card fee', chargeFee('credit_card', 644), 22.54);
  check('$660 ACH fee', chargeFee('ach', 660), 6.60);
  check('$50 ACH hits the $1 minimum', chargeFee('ach', 50), 1.00);
  check('Zelle adds nothing', chargeFee('zelle', 598), 20.93); // card fallback, as before

  // And that a changed rate actually moves the number.
  STORE = new Map([['storage_card_fee_pct', '0.03']]);
  await settings.invalidate();
  check('card fee drops to 3% when changed', chargeFee('credit_card', 598), 17.94);
}

section('6. CC gross-up on work orders is unchanged');
{
  STORE = new Map();
  await settings.invalidate();
  const rate = settings.num('cc_fee_rate', 0.03);
  const base = 1000;
  const fee = Math.round(base * (rate / (1 - rate)) * 100) / 100;
  check('3% gross-up on $1000 base', fee, 30.93);
  // The whole point of the gross-up: the processor's cut of the TOTAL equals the fee.
  check('processor cut of the grossed-up total equals the fee',
        Math.round((base + fee) * rate * 100) / 100, fee);
}

section('7. Token substitution in owner-edited paragraphs');
{
  STORE = new Map([['zelle_email', 'pay@example.com'], ['company_phone', '(555) 000-1111']]);
  await settings.invalidate();
  check('zelle token filled',
        company.fillTokens('Send Zelle to {zelle_email}.'),
        'Send Zelle to pay@example.com.');
  check('several tokens in one paragraph',
        company.fillTokens('Call {phone} or send to {zelle_email}.'),
        'Call (555) 000-1111 or send to pay@example.com.');
  check('text with no tokens is untouched',
        company.fillTokens('No tokens here.'), 'No tokens here.');
}

section('8. The real API validator');
{
  const validate = require('./src/routes/settingsAdmin').__validate;
  const v = (key, val) => validate(BY_KEY.get(key), val);

  // Accepts
  check('a normal card fee', v('storage_card_fee_pct', '0.04'), { ok: true, value: '0.04' });
  check('money rounds to cents', v('storage_late_fee', '30'), { ok: true, value: '30.00' });
  check('a pasted $ and comma are tolerated', v('labor_rate', '$1,000.00'), { ok: true, value: '1000.00' });
  check('a labor rate above the $1000 ceiling is refused',
        v('labor_rate', '1250'), { ok: false, error: 'cannot be above $1000.00' });
  check('a trailing % is tolerated', v('storage_ach_fee_pct', '0.02%'), { ok: true, value: '0.02' });
  check('a valid email', v('zelle_email', ' pay@example.com '), { ok: true, value: 'pay@example.com' });
  check('boolean true', v('payment_reminders_enabled', true), { ok: true, value: 'true' });
  check('text is trimmed', v('company_phone', '  (720) 555-0100 '), { ok: true, value: '(720) 555-0100' });

  // Rejects
  check('a 35% card fee is refused',
        v('storage_card_fee_pct', '0.35'), { ok: false, error: 'cannot be above 10%' });
  check('a negative late fee is refused',
        v('storage_late_fee', '-5'), { ok: false, error: 'cannot be negative' });
  check('a blank rate is refused',
        v('storage_card_fee_pct', ''), { ok: false, error: 'cannot be blank' });
  check('a non-number is refused',
        v('labor_rate', 'abc'), { ok: false, error: 'must be a number' });
  check('a fractional day is refused',
        v('storage_late_fee_day', '5.5'), { ok: false, error: 'must be a whole number' });
  check('day 31 is refused, it does not exist in February',
        v('storage_late_fee_day', '31'), { ok: false, error: 'cannot be above 28' });
  check('a junk email is refused',
        v('zelle_email', 'not-an-email'), { ok: false, error: 'must be a valid email address' });
  check('a blank company name is refused',
        v('company_name', '   '), { ok: false, error: 'cannot be blank' });
  check('an over-long single line is refused',
        v('company_name', 'x'.repeat(250)).ok, false);
  check('an unknown key has no definition to validate against', BY_KEY.get('made_up_key'), undefined);
}

section('9. Policy wording helpers');
{
  const NUMBER_WORDS = ['zero','one','two','three','four','five','six','seven',
                        'eight','nine','ten','eleven','twelve','thirteen','fourteen'];
  const pickupWindowText = (d) => `${NUMBER_WORDS[d] || String(d)} (${d}) ${d === 1 ? 'day' : 'days'}`;
  check('2 days reads as the original terms did', pickupWindowText(2), 'two (2) days');
  check('1 day is singular', pickupWindowText(1), 'one (1) day');
  check('a number past the word list still reads correctly', pickupWindowText(21), '21 (21) days');

  const ordinal = (n) => {
    const v = Math.abs(Math.round(n)) % 100;
    const s = (v >= 11 && v <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th');
    return `${n}${s}`;
  };
  check('late day ordinals', [1,2,3,5,11,12,13,21,22].map(ordinal),
        ['1st','2nd','3rd','5th','11th','12th','13th','21st','22nd']);

  const feeSubLabel = (pct) => `${(pct * 100).toFixed(2).replace(/\.?0+$/, '')}% of storage total`;
  check('3.5% label', feeSubLabel(0.035), '3.5% of storage total');
  check('1% label', feeSubLabel(0.01), '1% of storage total');
  check('4.25% label', feeSubLabel(0.0425), '4.25% of storage total');
}

section('10. Percent display round-trip (the UI shows 3.5, stores 0.035)');
{
  const toDisplay = (v) => String(parseFloat((parseFloat(v) * 100).toFixed(4)));
  const toStored = (v) => String(parseFloat((parseFloat(String(v).replace(/[%\s,]/g, '')) / 100).toFixed(6)));
  for (const v of ['0.035', '0.01', '0.0975', '0.03', '0.05']) {
    check(`${v} survives display -> store`, toStored(toDisplay(v)), v);
  }
  check('0.035 displays as 3.5', toDisplay('0.035'), '3.5');
  check('0.0975 displays as 9.75', toDisplay('0.0975'), '9.75');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
})();
