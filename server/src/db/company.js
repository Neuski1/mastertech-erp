// ---------------------------------------------------------------------------
// Company details, read from Business Settings.
//
// These strings appear on invoices, contracts, reminder emails and the work
// order PDF. Before this module they were typed literally into each of those
// files, so changing the shop phone number meant a developer and a deploy.
//
// Every getter falls back to the literal that was previously hardcoded, so a
// settings outage prints the same footer it always printed. Call them as
// functions, never destructure at module load — a value read at require() time
// would be frozen at whatever the cache held when the process booted.
// ---------------------------------------------------------------------------

const settings = require('./settings');

const name = () => settings.str('company_name', 'Master Tech RV Repair and Storage');
const address = () => settings.str('company_address', '6590 E. 49th Ave.');
const cityStateZip = () => settings.str('company_city_state_zip', 'Commerce City, CO 80022');
const phone = () => settings.str('company_phone', '(303) 557-2214');
const email = () => settings.str('company_email', 'service@mastertechrvrepair.com');
const zelleEmail = () => settings.str('zelle_email', 'carol@mastertechrvrepair.com');

// "6590 E. 49th Ave., Commerce City, CO 80022"
const fullAddress = () => `${address()}, ${cityStateZip()}`;

// "Master Tech RV Repair and Storage, 6590 E. 49th Ave., Commerce City, CO 80022"
const nameAndAddress = () => `${name()}, ${fullAddress()}`;

// "Master Tech RV Repair and Storage | 6590 E. 49th Ave., Commerce City, CO 80022 | (303) 557-2214"
const plainTextFooter = () => `${name()} | ${fullAddress()} | ${phone()}`;

// Storage pickup / drop-off hours, as printed on invoices and the guidelines email.
const pickupHours = () => settings.str('storage_pickup_hours', 'Monday through Friday, 9 to 6');

// The full sentence version, for the Pickup and Drop-Off Hours box.
const pickupHoursLong = () => settings.str(
  'storage_pickup_hours_long',
  'Monday through Friday, 9:00 AM to 6:00 PM. Closed Saturday, Sunday and major holidays.'
);

// Owner-editable paragraphs may contain {zelle_email}, {phone}, {email},
// {address} or {company} placeholders. Filling them here means the Zelle
// address lives in exactly one setting: change it in Company Information and
// every contract paragraph that mentions it follows, with no chance of the two
// drifting apart.
function fillTokens(text) {
  if (!text) return text;
  return String(text)
    .replace(/\{zelle_email\}/g, zelleEmail())
    .replace(/\{phone\}/g, phone())
    .replace(/\{email\}/g, email())
    .replace(/\{address\}/g, fullAddress())
    .replace(/\{company\}/g, name());
}

module.exports = {
  name, address, cityStateZip, phone, email, zelleEmail,
  fullAddress, nameAndAddress, plainTextFooter, pickupHours, pickupHoursLong,
  fillTokens,
};
