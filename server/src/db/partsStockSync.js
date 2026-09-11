// Migration 064: work-order stock pulls live in the database, not the routes.
//
// Why: stock used to move in JavaScript, in whichever route happened to change
// a parts line or a record status. Every path that forgot to do it left the
// shelf count wrong, and several did:
//   - Copy Record inserted lines with no order_status, so the column default
//     'not_ordered' applied and the lines were never pulled when the job ran.
//   - Payments (manual, Square, Terminal, webhook, reconcile cron, Poynt) move
//     a record to partial/paid directly. A deposit on a scheduled job jumped
//     it into a work-active status without pulling anything.
//   - The customer's online estimate approval moves awaiting_approval to
//     in_progress and promotes lines out of estimate, both with raw SQL.
//   - Adding a line when stock was short skipped the deduction silently while
//     the line still read "From Inventory".
//
// Now each parts line remembers what it actually took off the shelf
// (stock_pulled_qty from stock_pulled_inventory_id). A trigger recomputes what
// the line SHOULD be holding on every insert/update/delete of the line and on
// every status or deleted_at change of its record, and moves only the
// difference. Any path, present or future, gets the right answer, and moving
// stock twice is impossible because the delta is against what was recorded.
//
// A line holds stock when all of these are true:
//   line not deleted, linked to an inventory item, not an estimate line,
//   order_status NULL or 'inventory' (came off our shelf, not ordered in),
//   record not deleted, record status in INVENTORY_PULL_STATUSES.
// Short stock is still pulled and goes negative. A negative on-hand is the
// honest signal that the shelf count is off; silently skipping hid it.
//
// INVENTORY_PULL_STATUSES in utils/inventoryStatus.js stays the one home for
// the status list: the SQL below is generated from it on every boot.

const { INVENTORY_PULL_STATUSES } = require('../utils/inventoryStatus');

function pullStatusArraySql() {
  // Fixed internal list of identifiers, never user input.
  return `ARRAY[${INVENTORY_PULL_STATUSES.map(s => `'${s.replace(/'/g, "''")}'`).join(',')}]::text[]`;
}

async function installPartsStockSync(pool) {
  const pulls = pullStatusArraySql();
  const client = await pool.connect();
  try {
    // One transaction: there is never a moment where the new route code is
    // live and no trigger is moving stock.
    await client.query('BEGIN');
    await client.query('DROP TRIGGER IF EXISTS parts_line_stock_sync ON record_parts_lines');
    await client.query('DROP TRIGGER IF EXISTS parts_line_stock_return ON record_parts_lines');
    await client.query('DROP TRIGGER IF EXISTS records_stock_sync ON records');

    await client.query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS stock_pulled_qty NUMERIC(10,2)');
    await client.query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS stock_pulled_inventory_id INTEGER');

    // Baseline, first boot only (rows still NULL): record what the old route
    // code believed it had pulled, so installing this moves no stock at all.
    // The updated_at trigger is paused so the baseline does not restamp every
    // parts line in the database as edited today.
    const { rows: pending } = await client.query(
      'SELECT EXISTS (SELECT 1 FROM record_parts_lines WHERE stock_pulled_qty IS NULL) AS p');
    const needsBaseline = pending[0].p;
    const { rows: tsTrig } = await client.query(
      `SELECT 1 FROM pg_trigger WHERE tgname = 'trg_parts_lines_updated_at'
          AND tgrelid = 'record_parts_lines'::regclass`);
    if (needsBaseline && tsTrig.length) {
      await client.query('ALTER TABLE record_parts_lines DISABLE TRIGGER trg_parts_lines_updated_at');
    }
    const { rowCount } = !needsBaseline ? { rowCount: 0 } : await client.query(`
      UPDATE record_parts_lines pl SET
        stock_pulled_qty = CASE WHEN h.holds THEN pl.quantity ELSE 0 END,
        stock_pulled_inventory_id = CASE WHEN h.holds THEN pl.inventory_id END
      FROM (
        SELECT l.id,
               (l.deleted_at IS NULL AND l.is_inventory_part IS TRUE AND l.inventory_id IS NOT NULL
                AND l.is_estimate_line IS NOT TRUE
                AND (l.order_status IS NULL OR l.order_status = 'inventory')
                AND r.deleted_at IS NULL AND r.status::text = ANY(${pulls})) AS holds
          FROM record_parts_lines l JOIN records r ON r.id = l.record_id
         WHERE l.stock_pulled_qty IS NULL
      ) h
      WHERE pl.id = h.id`);
    // Lines whose record row is missing entirely: nothing was ever pulled.
    await client.query('UPDATE record_parts_lines SET stock_pulled_qty = 0 WHERE stock_pulled_qty IS NULL');
    if (needsBaseline && tsTrig.length) {
      await client.query('ALTER TABLE record_parts_lines ENABLE TRIGGER trg_parts_lines_updated_at');
    }
    await client.query('ALTER TABLE record_parts_lines ALTER COLUMN stock_pulled_qty SET DEFAULT 0');
    await client.query('ALTER TABLE record_parts_lines ALTER COLUMN stock_pulled_qty SET NOT NULL');

    await client.query(`CREATE OR REPLACE FUNCTION parts_line_stock_sync() RETURNS trigger AS $fn$
      DECLARE
        r_status   text;
        r_deleted  timestamptz;
        holds      boolean;
        want_qty   numeric := 0;
        want_inv   integer := NULL;
        had_qty    numeric := 0;
        had_inv    integer := NULL;
      BEGIN
        SELECT status::text, deleted_at INTO r_status, r_deleted FROM records WHERE id = NEW.record_id;
        holds := NEW.deleted_at IS NULL AND NEW.is_inventory_part IS TRUE AND NEW.inventory_id IS NOT NULL
                 AND NEW.is_estimate_line IS NOT TRUE
                 AND (NEW.order_status IS NULL OR NEW.order_status = 'inventory')
                 AND r_status IS NOT NULL AND r_deleted IS NULL
                 AND r_status = ANY(${pulls});
        IF holds THEN
          want_qty := COALESCE(NEW.quantity, 0);
          want_inv := NEW.inventory_id;
        END IF;
        -- The baseline is always what the row had recorded before this write,
        -- never a value the caller put in NEW, so no UPDATE can fake it.
        IF TG_OP = 'UPDATE' THEN
          had_qty := COALESCE(OLD.stock_pulled_qty, 0);
          had_inv := OLD.stock_pulled_inventory_id;
        END IF;
        -- Pulled from a different item (or no item any more): put it back first.
        IF had_inv IS NOT NULL AND had_qty <> 0 AND had_inv IS DISTINCT FROM want_inv THEN
          UPDATE inventory SET qty_on_hand = qty_on_hand + had_qty WHERE id = had_inv;
          had_qty := 0;
        END IF;
        IF want_inv IS NOT NULL AND want_qty <> had_qty THEN
          UPDATE inventory SET qty_on_hand = qty_on_hand - (want_qty - had_qty) WHERE id = want_inv;
        END IF;
        NEW.stock_pulled_qty := want_qty;
        NEW.stock_pulled_inventory_id := want_inv;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql`);

    await client.query(`CREATE OR REPLACE FUNCTION parts_line_stock_return() RETURNS trigger AS $fn$
      BEGIN
        IF OLD.stock_pulled_inventory_id IS NOT NULL AND COALESCE(OLD.stock_pulled_qty, 0) <> 0 THEN
          UPDATE inventory SET qty_on_hand = qty_on_hand + OLD.stock_pulled_qty
           WHERE id = OLD.stock_pulled_inventory_id;
        END IF;
        RETURN OLD;
      END;
      $fn$ LANGUAGE plpgsql`);

    // A record changing status (by any route, cron, webhook or raw SQL) makes
    // each of its lines re-check itself. The no-op SET is what fires the
    // line trigger above.
    await client.query(`CREATE OR REPLACE FUNCTION records_stock_sync() RETURNS trigger AS $fn$
      BEGIN
        UPDATE record_parts_lines SET stock_pulled_qty = stock_pulled_qty
         WHERE record_id = NEW.id
           AND (inventory_id IS NOT NULL OR stock_pulled_qty <> 0);
        RETURN NULL;
      END;
      $fn$ LANGUAGE plpgsql`);

    await client.query(`CREATE TRIGGER parts_line_stock_sync
      BEFORE INSERT OR UPDATE OF quantity, inventory_id, is_inventory_part, is_estimate_line,
                                 order_status, deleted_at, record_id, stock_pulled_qty
      ON record_parts_lines
      FOR EACH ROW EXECUTE FUNCTION parts_line_stock_sync()`);
    await client.query(`CREATE TRIGGER parts_line_stock_return
      BEFORE DELETE ON record_parts_lines
      FOR EACH ROW EXECUTE FUNCTION parts_line_stock_return()`);
    await client.query(`CREATE TRIGGER records_stock_sync
      AFTER UPDATE OF status, deleted_at ON records
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
      EXECUTE FUNCTION records_stock_sync()`);

    await client.query('COMMIT');
    console.log(`Migration 064 (parts stock sync trigger) ready; baselined ${rowCount} lines`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    // Loud on purpose: without this trigger no work-order line moves stock.
    console.error('MIGRATION 064 FAILED, WORK-ORDER STOCK IS NOT MOVING:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { installPartsStockSync, pullStatusArraySql };
