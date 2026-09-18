// Run with: node src/utils/leadSpam.test.js
// Plain assertions, no test runner, so it works on Railway's image as-is.
const assert = require('assert');
const { scoreLead, phoneShape, THRESHOLD } = require('./leadSpam');

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari/605.1.15';
const ok = (extra = {}) => ({ userAgent: UA, turnstileOk: null, ...extra });

let failures = 0;
function check(label, got, want) {
  const pass = got === want;
  if (!pass) failures += 1;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label} (spam=${got}, expected=${want})`);
}

// --- Real customers must get through -----------------------------------------
check('real repair request', scoreLead(ok({
  name: 'Dale Whitcomb', phone: '303-555-0147'.replace('555', '720'), email: 'dale.w@gmail.com',
  message: 'RV: 2019 Jayco Jay Flight | Length: 26 ft | Services: Plumbing | Issue: water heater quit working, no hot water at any tap',
})).isSpam, false);

check('terse real lead, no detail', scoreLead(ok({
  name: 'Maria Ortiz', phone: '7204443311', email: 'mortiz@outlook.com',
  message: 'Need someone to look at my travel trailer furnace before we head out next month.',
})).isSpam, false);

check('real customer who pasted a listing link', scoreLead(ok({
  name: 'Ken Boyle', phone: '3038829014', email: 'kboyle@comcast.net',
  message: 'Bought this used fifth wheel and the slide out sticks. Listing was at rvtrader.com if that helps identify the model.',
})).isSpam, false);

check('storage wait list, minimal words', scoreLead(ok({
  name: 'Sue Danner', phone: '7203318890', email: 'sdanner@yahoo.com',
  message: 'RV: 2021 Grand Design Reflection | Length: 31 ft | Looking for covered storage starting in October',
})).isSpam, false);

// --- Spam must be caught ------------------------------------------------------
check('seo pitch', scoreLead(ok({
  name: 'Rahul', phone: '1234567890', email: 'rahul@digitalgrowth.biz',
  message: 'Hello, I was browsing your website mastertechrvrepair.com and noticed your site is not ranking on the first page of google. Our agency offers SEO and web design services. Click here for a free audit.',
})).isSpam, true);

check('honeypot filled', scoreLead(ok({
  name: 'Bot', phone: '7205551234', email: 'a@b.com', message: 'hello',
  honeypot: 'http://spam.ru',
})).isSpam, true);

check('submitted in under three seconds', scoreLead(ok({
  name: 'Fast Bot', phone: '7204443311', email: 'x@y.com',
  message: 'travel trailer furnace repair please',
  formStartedAt: Date.now() - 900,
})).isSpam, true);

check('turnstile failed', scoreLead(ok({
  name: 'Real Looking', phone: '7204443311', email: 'x@gmail.com',
  message: 'motorhome water heater not working',
  turnstileOk: false, turnstileCodes: ['invalid-input-response'],
})).isSpam, true);

check('crypto pitch', scoreLead(ok({
  name: 'Investment Desk', phone: '0000000000', email: 'offers@mailinator.com',
  message: 'DEAR SIR, WE HAVE AN INVESTMENT OPPORTUNITY IN BITCOIN FOR YOUR BUSINESS!!!!',
})).isSpam, true);

check('cyrillic junk', scoreLead(ok({
  name: 'Привет', phone: '5551234567', email: 'test@temp-mail.org',
  message: 'Здравствуйте, предложение для вашего сайта',
})).isSpam, true);

// --- phoneShape ---------------------------------------------------------------
check('valid denver number', phoneShape('(303) 557-2214') === 'ok', true);
check('repeated digits caught', phoneShape('1111111111') === 'repeated_digits', true);
check('555 placeholder caught', phoneShape('5551234567') === 'placeholder', true);
check('11 digit with leading 1', phoneShape('1-720-331-8890') === 'ok', true);

console.log(`\nthreshold=${THRESHOLD}  failures=${failures}`);
assert.strictEqual(failures, 0, `${failures} spam-filter expectations failed`);
console.log('All lead spam filter checks passed.');
