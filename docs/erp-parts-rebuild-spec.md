# Master Tech ERP: Parts Ordering, Inventory & Suppliers Rebuild

Stack: React (client/, Vercel) + Node.js/Express (server/, Railway) + PostgreSQL.

## Current State (verified against production DB, July 13, 2026)

- record_parts_lines (3,329 rows): carries its own order tracking columns (order_status, order_eta, order_supplier, order_number, order_tracking, order_date, po_number, order_confirmed_at, order_email_msg_id). Status distribution: 2,976 not_ordered / 18 ordered / 51 received / 187 null.
- inventory (2,072 rows, 390 active): has reorder_level, reorder_status, reorder_date, reorder_note. 5 active parts at/below reorder level. Reorder statuses: 855 null, 6 needs_reorder, 9 ordered. Nothing automates this.
- purchase_orders (5 rows, ALL status=pending) + po_line_items (9 rows): module exists but is orphaned. po_number on record lines is free text, not a FK.
- order_email_log: exists, 0 rows.
- vendors (45 rows) vs vendor_details (35 rows): duplicated supplier concept. vendor_details is richer (website, account_number, supplier_type, subcategory).
- parts_catalog (1,137 rows): good historical pricing/usage data. Keep as-is.

## Goal

Purchase orders become the single spine for all parts buying. Two entry points feed it automatically:
1. Record-driven: tech adds a non-stock part to a record -> one click adds it to that vendor's open draft PO.
2. Restock-driven: inventory qty_on_hand falls to/below reorder_level -> part auto-appears in the Reorder Queue and can be pushed to a draft PO.
Receiving a PO closes the loop: updates inventory quantities AND flips the linked record_parts_lines to received in one action.

ORDERING MODEL (critical): Master Tech does NOT email orders to suppliers. Orders are placed on the supplier's website or by phone, and a confirmation email arrives afterward. The PO is internal tracking only.

## Phase 1: Suppliers Consolidation

1. Migration: merge vendors into vendor_details, renamed to suppliers. Match on name (case-insensitive, trimmed). Insert vendors rows with no vendor_details match. Final columns: id, name, website, contact_name, contact_email, contact_phone, account_number, supplier_type, subcategory, default_ship_days int, order_method varchar (website|phone), notes, is_active bool, created_at, updated_at. Add supplier_id FKs (nullable) to inventory, parts_catalog, purchase_orders, record_parts_lines. Backfill by matching existing free-text vendor columns. Keep old text columns for now; drop later once verified.
2. Build/refresh Suppliers page: list with supplier_type filter, detail view with contact info, account number, website link, order method, and tabs for open POs, order history (purchase_orders), and parts supplied (parts_catalog/inventory).

## Phase 2: Purchase Order Engine

1. Migration on purchase_orders: supplier_id FK, status enum draft | submitted | partially_received | received | cancelled. Migrate the 5 existing pending POs to draft. Add expected_date date, submitted_at timestamptz, order_email_msg_id varchar, po_number varchar generated as PO-YYYY-<padded id> on submit.
2. Migration on po_line_items: add record_parts_line_id FK (nullable), inventory_id FK (nullable), qty_received numeric default 0, source varchar (record|restock|manual).
3. Server routes (follow existing patterns): GET /api/purchase-orders (filter by status, supplier); POST /api/purchase-orders; PATCH /:id; POST /:id/submit (Mark as Ordered: captures supplier order/confirmation number, order_date, expected_date, tracking, all optional and editable later, status -> submitted); POST /:id/receive with body [{line_id, qty_received}]. Receive logic in ONE transaction: (a) increment inventory.qty_on_hand for lines with inventory_id, clear reorder_status if qty now > reorder_level; (b) set linked record_parts_lines.order_status='received'; (c) set PO status received or partially_received; (d) write audit_log entries. Also an open-draft-PO helper: find-or-create a draft PO for a supplier_id.
4. Draft PO UI: Place Order button that opens suppliers.website in a new tab and shows a copyable list of vendor_part_number + qty for pasting into the supplier's cart.
5. Confirmation email capture: repurpose order_email_log for INBOUND confirmations. Find Confirmation action searches connected Gmail for order confirmation/shipping emails matching supplier domain + order number, auto-fills order_number, tracking, ETA on the PO and linked record_parts_lines. Store Gmail message id in order_email_msg_id. Log matches in order_email_log (po_id, message_id, matched fields, matched_at). If no Gmail integration exists server-side, stub the endpoint with a clear TODO and manual entry fallback.

## Phase 3 (LATER SESSION, do not build now): Record -> PO Flow

1. On record parts lines with order_status not_ordered/null, add Add-to-PO action: pick supplier (default from parts_catalog last vendor or inventory supplier_id) -> line appended to that supplier's open draft PO -> record_parts_lines.order_status='ordered_pending' (new status), po_number set.
2. When PO submitted: linked lines flip to 'ordered', order_date set, order_number/tracking sync from PO.
3. Status chain: not_ordered -> ordered_pending -> ordered -> received. Old rows keep existing values.
4. Records page: per-record rollup badge (e.g. 2 parts on order, ETA Jul 20).

## Phase 4 (LATER SESSION, do not build now): Restock Automation

1. Reorder Queue page under Inventory: active inventory where qty_on_hand <= reorder_level and reorder_status null or needs_reorder. Add reorder_qty numeric to inventory (default reorder_level * 2, editable). Bulk action: select rows -> Create PO(s) -> groups by supplier_id, appends to each supplier's open draft PO, sets reorder_status='ordered'.
2. Auto-flagging: after any inventory decrement from record_parts_lines consumption, if qty_on_hand <= reorder_level set reorder_status='needs_reorder', reorder_date=today. Daily cron sweep (server/src/jobs, like reminderCron.js, America/Denver timezone) catches missed rows.
3. Dashboard widget: parts-needing-reorder count + open draft PO count, linking to Reorder Queue and PO list.

## Phase 5 (LATER SESSION, do not build now): Cleanup & Guardrails

1. Backfill 187 null order_status rows to not_ordered.
2. Indexes: record_parts_lines(order_status) partial where deleted_at is null; po_line_items(po_id); inventory(reorder_status); suppliers(name).
3. All money math numeric, never float. Multi-table updates in transactions.
4. Migrations through existing schema_migrations mechanism.

## Explicitly Out of Scope

- No outbound order emails to suppliers, ever. Orders are placed on supplier websites or by phone; the system only ingests inbound confirmation emails.
- No changes to bookkeeping/journal entry logic (COGS posting stays as-is).
- No changes to the flat rate labor lookup component.
- No features beyond what is written here.
