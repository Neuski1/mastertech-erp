// Single source of truth for WHEN a record's inventory parts are off the shelf.
//
// Carol's rule (September 11, 2026): a part marked From Inventory comes off
// the shelf the moment it is on the record, whatever the record's status,
// estimate included. It goes back when the record is FILED or VOIDED, and
// comes off again if a filed record is reopened.
//
// It also goes back when the line itself is deleted, switched to an order
// status (Not Ordered, Ordered, Received...), or moved into the Inspection
// Findings section. Inspection-finding lines are proposals, so they only pull
// once the customer approves them.
//
// The database trigger that actually moves the stock (migration 064,
// db/partsStockSync.js) is generated from this list on every boot, and every
// line is re-checked against it on boot, so changing this list and
// redeploying is all it takes to change the rule.
//
// Previous rule (June 16 to September 11, 2026): stock only left the shelf
// in work-active statuses (in_progress, awaiting_parts, complete,
// payment_pending, partial, paid).
const INVENTORY_RETURN_STATUSES = ['filed', 'void'];

function pullsInventory(status) {
  return !INVENTORY_RETURN_STATUSES.includes(status);
}

module.exports = { pullsInventory, INVENTORY_RETURN_STATUSES };
