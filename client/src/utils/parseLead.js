// Parse a website lead message into structured fields.
// Message format examples:
//   RV: 2024 Nash 17k | Length: 20 ft | Preferred drop-off: 2026-07-31 | Services: Roof / Seal | Issue: ...
//   STORAGE WAIT LIST (outdoor) | RV: 2025 Winnebago Micro Minnie | Length: 22 ft | Preferred start: 2026-08-01 | Notes: ...
export function parseLeadMessage(msg) {
  const out = { rvYear: '', rvMake: '', rvModel: '', rvRaw: '', lengthFt: '', services: '', issue: '', notes: '', preferred: '', spaceType: '' };
  if (!msg) return out;
  const field = (label) => {
    const re = new RegExp(label + '\\s*:\\s*([^|]*)(?:\\||$)', 'i');
    const m = msg.match(re);
    return m ? m[1].trim() : '';
  };
  const st = msg.match(/STORAGE WAIT LIST\s*\((indoor|outdoor)\)/i);
  if (st) out.spaceType = st[1].toLowerCase();
  out.rvRaw = field('RV');
  out.lengthFt = (field('Length').match(/\d+/) || [''])[0];
  out.services = field('Services');
  out.issue = field('Issue');
  out.notes = field('Notes');
  out.preferred = field('Preferred drop-off') || field('Preferred start');
  if (out.rvRaw) {
    const parts = out.rvRaw.split(/\s+/).filter(Boolean);
    if (/^(19|20)\d{2}$/.test(parts[0] || '')) {
      out.rvYear = parts[0]; out.rvMake = parts[1] || ''; out.rvModel = parts.slice(2).join(' ');
    } else {
      out.rvMake = parts[0] || ''; out.rvModel = parts.slice(1).join(' ');
    }
  }
  return out;
}
