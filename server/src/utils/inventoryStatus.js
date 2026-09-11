// Single source of truth for WHEN a record's committed inventory parts are
// pulled from stock.
//
// The database trigger that actually moves the stock (migration 064,
// db/partsStockSync.js) is generated from this list on every boot, so this
// file stays the only place the list lives. Change it here and redeploy.
//
// Carol's rule: never pull inventory while a work order is in a pre-work or
// parked status. Stock only leaves the shelf once the job is actually being
// worked or billed.
//
// Pull (deduct) statuses:    in_progress, awaiting_parts, complete,
//                            payment_pending, partial, paid
// Do NOT pull:               estimate, approved (Not Started),
//                            schedule_customer, scheduled, awaiting_approval,
//                            order_parts, on_hold, filed, void
const INVENTORY_PULL_STATUSES = [
  'in_progress', 'awaiting_parts', 'complete', 'payment_pending', 'partial', 'paid',
];

function pullsInventory(status) {
  return INVENTORY_PULL_STATUSES.includes(status);
}

module.exports = { pullsInventory, INVENTORY_PULL_STATUSES };
