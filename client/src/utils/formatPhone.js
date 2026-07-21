// Phone helpers. All of these tolerate an extension, e.g. "(303) 557-2214 x205",
// which the shop needs for insurance carriers and supplier direct lines.

// Split a raw value into its main number and extension. An explicit marker
// (x, ext, ext., #) wins; otherwise any digits past the 10th are the extension.
const splitExt = (raw) => {
  const str = (raw === null || raw === undefined) ? '' : raw.toString();
  const marker = str.match(/(?:ext\.?|x|#)/i);
  let mainRaw = str;
  let extRaw = '';
  let hadMarker = false;
  if (marker) {
    hadMarker = true;
    mainRaw = str.slice(0, marker.index);
    extRaw = str.slice(marker.index + marker[0].length);
  }
  let main = mainRaw.replace(/\D/g, '');
  if (main.length === 11 && main.startsWith('1')) main = main.slice(1);
  let ext = extRaw.replace(/\D/g, '');
  // No marker but more than 10 digits: treat the overflow as the extension.
  if (!hadMarker && main.length > 10) {
    ext = main.slice(10);
    main = main.slice(0, 10);
  }
  return { main, ext, hadMarker, raw: str };
};

const formatMain = (main) => {
  if (main.length <= 3) return main;
  if (main.length <= 6) return `(${main.slice(0, 3)}) ${main.slice(3)}`;
  return `(${main.slice(0, 3)}) ${main.slice(3, 6)}-${main.slice(6, 10)}`;
};

// Display a stored value. Falls back to the original string for anything that
// is not a recognizable 10-digit US number, so odd legacy data still shows.
export const formatPhone = (phone) => {
  if (!phone) return '';
  const { main, ext, raw } = splitExt(phone);
  if (main.length !== 10) return raw;
  const out = formatMain(main);
  return ext ? `${out} x${ext}` : out;
};

// As-you-type formatter. Keeps the extension instead of throwing it away, and
// keeps a trailing "x" visible so the user can actually type one.
export const handlePhoneInput = (value) => {
  if (value === null || value === undefined) return '';
  const { main, ext, hadMarker, raw } = splitExt(value);
  let out = formatMain(main);
  if (ext) out += ` x${ext}`;
  else if (hadMarker && main.length === 10 && /(?:ext\.?|x|#)\s*$/i.test(raw)) out += ' x';
  return out;
};

// Just the dialable digits, extension dropped. Use for lookups and matching.
export const stripPhone = (formatted) => {
  if (!formatted) return '';
  return splitExt(formatted).main;
};

// href for a click-to-call link. The commas are a dial pause, so the phone
// dials the extension itself once the call connects.
export const telHref = (phone) => {
  const { main, ext } = splitExt(phone);
  if (!main) return 'tel:';
  const base = main.length === 10 ? `+1${main}` : main;
  return ext ? `tel:${base},,${ext}` : `tel:${base}`;
};
