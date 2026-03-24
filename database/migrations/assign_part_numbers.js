const pool = require('../../server/src/db/pool');

const PREFIX_MAP = {
  'AIRSTREAM': 'AS',
  'AWNING': 'AWN',
  'BATTERY': 'BAT',
  'DOORS/WINDOWS': 'DOOR',
  'ELECTRICAL': 'ELEC',
  'HARDWARE': 'HDWR',
  'HVAC': 'HVAC',
  'MISC/SHOP SUPPLIES': 'MISC',
  'PLUMBING': 'PLMB',
  'ROOFING': 'ROOF',
  'SOLAR': 'SOLR',
  'SUSPENSION': 'SUSP',
  'TOWING/CHASSIS': 'TOW',
};

// All valid prefixes for checking existing part numbers
const VALID_PREFIXES = Object.values(PREFIX_MAP);
const VALID_PREFIX_REGEX = new RegExp(`^(${VALID_PREFIXES.join('|')})-\\d+$`);

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const stats = {};
    let totalUpdated = 0;
    const skipped = [];

    for (const [category, prefix] of Object.entries(PREFIX_MAP)) {
      // Find the current max number for this prefix across ALL items (not just this category)
      const { rows: maxRows } = await client.query(
        `SELECT MAX(CAST(SUBSTRING(part_number FROM '-([0-9]+)$') AS INTEGER)) AS max_num
         FROM inventory
         WHERE part_number LIKE $1 AND deleted_at IS NULL`,
        [`${prefix}-%`]
      );
      let nextNum = (maxRows[0].max_num || 0) + 1;

      // Get items in this category that need new part numbers:
      // - qty_on_hand > 0
      // - part_number is NULL, empty, or doesn't match a valid prefix pattern
      const { rows: items } = await client.query(
        `SELECT id, part_number, vendor_part_number, description, qty_on_hand
         FROM inventory
         WHERE category = $1
           AND deleted_at IS NULL
           AND qty_on_hand > 0
           AND (
             part_number IS NULL
             OR part_number = ''
             OR part_number !~ $2
           )
         ORDER BY qty_on_hand DESC, description ASC`,
        [category, `^(${VALID_PREFIXES.join('|')})-[0-9]+$`]
      );

      let count = 0;
      for (const item of items) {
        const newPartNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

        // Preserve old part_number into vendor_part_number if slot is empty
        const preserveOld = item.part_number && item.part_number.trim() !== '' && !item.vendor_part_number;

        if (preserveOld) {
          await client.query(
            `UPDATE inventory SET part_number = $1, vendor_part_number = $2 WHERE id = $3`,
            [newPartNumber, item.part_number, item.id]
          );
        } else {
          await client.query(
            `UPDATE inventory SET part_number = $1 WHERE id = $2`,
            [newPartNumber, item.id]
          );
        }

        nextNum++;
        count++;
      }

      if (count > 0) {
        stats[category] = count;
        totalUpdated += count;
      }
    }

    // Check for items with null/unrecognized categories that were skipped
    const { rows: skippedRows } = await client.query(
      `SELECT id, part_number, category, description, qty_on_hand
       FROM inventory
       WHERE deleted_at IS NULL
         AND qty_on_hand > 0
         AND (category IS NULL OR category NOT IN (${Object.keys(PREFIX_MAP).map((_, i) => `$${i + 1}`).join(',')}))
         AND (
           part_number IS NULL
           OR part_number = ''
           OR part_number !~ $${Object.keys(PREFIX_MAP).length + 1}
         )`,
      [...Object.keys(PREFIX_MAP), `^(${VALID_PREFIXES.join('|')})-[0-9]+$`]
    );

    await client.query('COMMIT');

    console.log('\n=== Part Number Assignment Results ===\n');
    console.log('Updated per category:');
    for (const [cat, count] of Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0]))) {
      console.log(`  ${cat.padEnd(28)} ${count} items`);
    }
    console.log(`\nTotal updated: ${totalUpdated}`);

    if (skippedRows.length > 0) {
      console.log(`\nSkipped (null/unrecognized category, qty > 0, no valid part#): ${skippedRows.length}`);
      skippedRows.forEach(r => {
        console.log(`  id=${r.id} cat="${r.category}" pn="${r.part_number}" qty=${r.qty_on_hand} "${r.description}"`);
      });
    } else {
      console.log('\nNo items skipped.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR — rolled back:', err.message);
  } finally {
    client.release();
    pool.end();
  }
})();
