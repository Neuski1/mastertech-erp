import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import DocumentLabel from '../components/DocumentLabel';
import LaborLinesTable from '../components/LaborLinesTable';
import PartsLinesTable from '../components/PartsLinesTable';
import CommunicationLog from '../components/CommunicationLog';
import PhotoLinksSection from '../components/PhotoLinksSection';
import SquarePayment from '../components/SquarePayment';
import { formatPhone, handlePhoneInput } from '../utils/formatPhone';
import FreightLinesTable from '../components/FreightLinesTable';
import SignatureModal from '../components/SignatureModal';
import { BulletDisplay } from '../components/BulletTextarea';
import useIsMobile from '../utils/useIsMobile';
import { formatDate, formatDateTime } from '../utils/dateFormat';

const NEXT_STATUS = {
  estimate: 'approved',
  approved: 'in_progress',
  schedule_customer: 'in_progress',
  scheduled: 'in_progress',
  in_progress: 'complete',
  awaiting_parts: 'in_progress',
  order_parts: 'awaiting_parts',
  awaiting_approval: 'in_progress',
  complete: null,
  payment_pending: null,
  partial: null,
  paid: null,
};

const NEXT_LABEL = {
  estimate: 'Mark Not Started',
  approved: 'Mark In Progress',
  schedule_customer: 'Mark In Progress',
  scheduled: 'Mark In Progress',
  in_progress: 'Mark Complete',
  awaiting_parts: 'Resume Work',
  order_parts: 'Mark Parts Ordered',
  awaiting_approval: 'Resume Work',
};

const ALL_STATUSES = [
  { value: 'estimate', label: 'Estimate' },
  { value: 'approved', label: 'Not Started' },
  { value: 'schedule_customer', label: 'Schedule Customer' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'order_parts', label: 'Order Parts' },
  { value: 'awaiting_parts', label: 'Awaiting Parts' },
  { value: 'awaiting_approval', label: 'Awaiting Approval' },
  { value: 'complete', label: 'Complete' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'filed', label: 'File Estimate' },
];

const METHOD_LABELS = {
  credit_card: 'Card',
  check: 'Check',
  cash: 'Cash',
  zelle: 'Zelle',
};

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCustomer = location.state?.from === 'customer';
  const fromCustomerId = location.state?.customerId;
  const { canSeeFinancials, canEditRecords, canPostPayments, isAdmin, isBookkeeper } = useAuth();
  const [record, setRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPayLinkModal, setShowPayLinkModal] = useState(false);
  const [payLinksRefresh, setPayLinksRefresh] = useState(0);
  const [qbSyncing, setQbSyncing] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [manualPayModal, setManualPayModal] = useState(null); // 'check' | 'cash' | 'zelle' | null
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showEstimateEmailModal, setShowEstimateEmailModal] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderChannel, setReminderChannel] = useState('both');
  const [emailing, setEmailing] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPersonalMsg, setEmailPersonalMsg] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailIncludePayLink, setEmailIncludePayLink] = useState(false);
  const [emailPayLinkType, setEmailPayLinkType] = useState('parts_deposit');
  const [emailPayLinkAmount, setEmailPayLinkAmount] = useState('');

  // Track which field is currently being edited so the polling refetch
  // does not clobber what the user is typing. null = no field focused.
  const [focusedField, setFocusedField] = useState(null);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({});
  const isMobile = useIsMobile();

  // ── Always-editable fields: route each field to the correct API endpoint ──
  const CUSTOMER_FIELDS = ['company_name', 'phone_primary', 'phone_secondary', 'email_primary', 'email_secondary',
    'address_street', 'address_city', 'address_state', 'address_zip'];
  const UNIT_FIELDS = ['year', 'make', 'model', 'vin', 'license_plate'];

  // Ref mirrors focusedField so the polling refetch can read it without
  // being recreated as a dependency.
  const focusedFieldRef = useRef(null);
  focusedFieldRef.current = focusedField;

  const fetchRecord = useCallback(async () => {
    try {
      const data = await api.getRecord(id);
      // Do not clobber the field the user is actively editing. Preserve the
      // local in-progress value for that one field; refresh everything else.
      setRecord(prev => {
        const focused = focusedFieldRef.current;
        if (prev && focused && Object.prototype.hasOwnProperty.call(prev, focused)) {
          return { ...data, [focused]: prev[focused] };
        }
        return data;
      });
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  // Auto-save a single field on blur/change, routing to the correct endpoint.
  const autoSave = async (field, value) => {
    if (record && value === record[field]) return; // no change
    setSaving(true);
    setError('');
    try {
      if (CUSTOMER_FIELDS.includes(field)) {
        if (record.customer_id) await api.updateCustomer(record.customer_id, { [field]: value });
      } else if (UNIT_FIELDS.includes(field)) {
        if (record.unit_id) await api.updateUnit(record.unit_id, { [field]: value });
      } else {
        const result = await api.updateRecord(id, { [field]: value });
        if (result && result.labor_lines_created > 0) {
          setSuccessMsg(`${result.labor_lines_created} labor line${result.labor_lines_created > 1 ? 's' : ''} created from job description`);
          setTimeout(() => setSuccessMsg(''), 5000);
        }
      }
      await fetchRecord();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStatus = async () => {
    const next = NEXT_STATUS[record.status];
    if (!next) return;

    // Pre-check: block completion if labor lines have missing hours
    if (next === 'complete' && record.labor_lines && record.labor_lines.length > 0) {
      const missing = record.labor_lines.filter(l => (!l.hours || parseFloat(l.hours) === 0) && !l.no_charge && parseFloat(l.line_total || 0) > 0);
      if (missing.length > 0) {
        setError(`Cannot mark complete \u2014 the following labor lines are missing hours:\n${missing.map(l => '\u2022 ' + l.description).join('\n')}\nPlease enter hours for all labor lines before marking complete.`);
        return;
      }
    }

    if (!window.confirm(`Change status to "${next.replace(/_/g, ' ').toUpperCase()}"?`)) return;
    try {
      const result = await api.updateRecordStatus(id, next);
      if (result.labor_lines_created > 0) {
        setSuccessMsg(`${result.labor_lines_created} labor line${result.labor_lines_created > 1 ? 's' : ''} created from job description`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
      await fetchRecord();
    } catch (err) {
      // Parse missing_hours_lines from backend error if present
      if (err.message && err.message.includes('missing hours')) {
        setError(err.message);
      } else {
        setError(err.message);
      }
    }
  };

  const handleSendReminder = async (channel) => {
    setShowReminderModal(false);
    setSendingReminder(true);
    try {
      const result = await api.sendReminder(id, channel);
      const channels = [];
      if (result.emailSent) channels.push('email');
      if (result.smsSent) channels.push('text');
      setSuccessMsg('Payment reminder #' + result.reminderCount + ' sent via ' + (channels.join(' & ') || 'no channels available'));
      setTimeout(() => setSuccessMsg(''), 5000);
      await fetchRecord();
    } catch (err) { setError(err.message); }
    finally { setSendingReminder(false); }
  };

  const handleVoid = async () => {
    if (!window.confirm('Are you sure you want to VOID this record? This cannot be undone.')) return;
    try {
      await api.deleteRecord(id);
      navigate('/records');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQbSync = async () => {
    if (!window.confirm('Sync this record to QuickBooks?')) return;
    setQbSyncing(true);
    setError('');
    try {
      await api.qbSyncRecord(id);
      await fetchRecord();
    } catch (err) {
      setError(err.message);
    } finally {
      setQbSyncing(false);
    }
  };

  const handleSignEstimate = async (signatureData, approvedLaborIds = [], approvedPartsIds = []) => {
    try {
      const result = await api.signEstimate(id, signatureData, approvedLaborIds, approvedPartsIds);
      setShowSignModal(false);
      await fetchRecord();
      alert(`Estimate signed and approved!\nPDF saved to:\n${result.pdf_path}`);
    } catch (err) {
      throw err;
    }
  };

  // Toggle a record flag and recalculate (for invoice toggles)
  const handleToggleFlag = async (field, currentValue) => {
    try {
      await api.updateRecord(id, { [field]: !currentValue });
      await fetchRecord();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleManualStatusChange = async (newStatus) => {
    if (newStatus === record.status) return;

    // Pre-check: block completion if labor lines have missing hours
    if (newStatus === 'complete' && record.labor_lines && record.labor_lines.length > 0) {
      const missing = record.labor_lines.filter(l => (!l.hours || parseFloat(l.hours) === 0) && !l.no_charge && parseFloat(l.line_total || 0) > 0);
      if (missing.length > 0) {
        setError(`Cannot mark complete \u2014 the following labor lines are missing hours:\n${missing.map(l => '\u2022 ' + l.description).join('\n')}\nPlease enter hours for all labor lines before marking complete.`);
        return;
      }
    }

    if (newStatus === 'void') {
      if (!window.confirm('Are you sure you want to void this record? This cannot be undone.')) return;
    }
    try {
      const result = await api.updateRecordStatus(id, newStatus, true);
      if (result.labor_lines_created > 0) {
        setSuccessMsg(`${result.labor_lines_created} labor line${result.labor_lines_created > 1 ? 's' : ''} created from job description`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
      await fetchRecord();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEmailDialog = () => {
    const email = record.email_primary;
    if (!email) { alert('No email address on file for this customer.'); return; }
    setEmailPersonalMsg('');
    const partsTotal = parseFloat(record.parts_subtotal) || 0;
    const amountDue = parseFloat(record.amount_due) || 0;
    const isEstimate = record.status === 'estimate';
    const defaultType = isEstimate && partsTotal > 0 ? 'parts_deposit' : 'final_payment';
    const defaultAmount = defaultType === 'parts_deposit' ? partsTotal : amountDue;
    setEmailPayLinkType(defaultType);
    setEmailPayLinkAmount(defaultAmount > 0 ? defaultAmount.toFixed(2) : '');
    // Default OFF — most work orders are sent for approval, not payment.
    // User checks "Include Payment Link" when they actually want to collect.
    setEmailIncludePayLink(false);
    setEmailTo(record.email_primary || '');
    setEmailCc(record.email_secondary || '');
    setEmailPersonalMsg('');
    setShowEmailModal(true);
  };

  const handleEmailDocument = async () => {
    setEmailing(true);
    setEmailMsg(null);
    setShowEmailModal(false);
    try {
      const payload = {
        personalMessage: emailPersonalMsg || null,
        toEmail: emailTo.trim() || null,
        ccEmails: emailCc.trim() || null,
      };
      if (emailIncludePayLink && parseFloat(emailPayLinkAmount) > 0) {
        payload.includePaymentLink = true;
        payload.paymentLinkType = emailPayLinkType;
        payload.paymentLinkAmountDollars = parseFloat(emailPayLinkAmount);
      } else {
        payload.includePaymentLink = false;
      }
      const result = await api.emailDocument(record.id, payload);
      setEmailMsg({ type: 'success', text: `${result.docType} emailed to ${result.sentTo}` });
      setTimeout(() => setEmailMsg(null), 6000);
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message });
      setTimeout(() => setEmailMsg(null), 6000);
    } finally {
      setEmailing(false);
    }
  };

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }

    // If the user is mid-typing in the Job Description textarea, blur it so
    // the auto-save fires before we re-fetch — otherwise the print uses
    // the stale Job Description that was on the record at page load.
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
      document.activeElement.blur();
      await new Promise(res => setTimeout(res, 500));
    }
    let r;
    try { r = await api.getRecord(id); } catch { r = record; }
    const customerName = `${r.last_name || ''}${r.first_name ? ', ' + r.first_name : ''}`;
    const address = [r.address_street, r.address_city, r.address_state, r.address_zip].filter(Boolean).join(', ');

    let docTitle = 'WORK ORDER';
    let docColor = '#1a2a4a';
    if (r.status === 'estimate') { docTitle = 'ESTIMATE'; docColor = '#2e7d32'; }
    else if (['complete', 'payment_pending', 'partial', 'paid'].includes(r.status)) { docTitle = 'INVOICE'; docColor = '#4a235a'; }

    const fmtPrintDateShort = (dateStr) => {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    };

    const now = new Date();
    const timePrinted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const intakeDate = r.intake_date ? fmtPrintDateShort(r.intake_date.includes('T') ? r.intake_date : r.intake_date + 'T12:00:00') : (r.created_at ? fmtPrintDateShort(r.created_at) : '—');

    const fmtCur = (v) => {
      const n = parseFloat(v) || 0;
      return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    // Collect distinct technician names for "Serviced By"
    // Only print lines that are committed work — exclude inspection-finding
    // estimate lines unless the customer has explicitly approved them.
    // Otherwise the printed totals (from the DB) won't match the printed rows.
    const isCommitted = (line) => !line.is_estimate_line || line.customer_approved;
    const laborLines = (r.labor_lines || []).filter(isCommitted);
    let apptTechNames = [];
    try {
      const apptData = await api.getAppointments({ record_id: id });
      apptTechNames = (apptData.appointments || []).map(a => a.technician_name).filter(Boolean);
    } catch (e) { /* non-fatal */ }
    const techNames = [...new Set([...laborLines.map(l => l.technician_name), ...apptTechNames].filter(Boolean))].sort();
    const isEstimate = r.status === 'estimate';

    // Build labor rows
    const totalHours = laborLines.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    const laborRows = laborLines.map((l, i) =>
      `<tr><td>${i+1}</td><td>L</td><td>${l.description || ''}${l.no_charge ? ' <span style="font-size:9px;font-weight:bold;color:#1e40af;background:#dbeafe;padding:1px 4px;border-radius:2px;margin-left:4px">N/C</span>' : ''}</td><td style="text-align:right">${parseFloat(l.hours || 0).toFixed(2)}</td><td style="text-align:right">${l.no_charge ? '<span style="color:#9ca3af">'+fmtCur(l.rate)+'</span>' : fmtCur(l.rate)}</td><td style="text-align:right">${l.no_charge ? '$0.00' : fmtCur(l.line_total)}</td></tr>`
    ).join('');
    const laborTotalRow = laborLines.length > 0 ? `
      <tr style="background:#f3f4f6"><td colspan="3" style="text-align:right;font-weight:bold;padding:6px 8px;border-top:2px solid #d1d5db">TOTAL HOURS:</td><td style="text-align:right;font-weight:bold;padding:6px 8px;border-top:2px solid #d1d5db">${totalHours.toFixed(2)} hrs</td><td></td><td></td></tr>
    ` : '';

    // Build parts rows
    const partsRows = (r.parts_lines || []).filter(isCommitted).map(p =>
      `<tr><td>P</td><td>${p.part_number ? p.part_number + ' — ' : ''}${p.description || ''}</td><td style="text-align:right">${parseFloat(p.quantity || 0)}</td><td style="text-align:right">${fmtCur(p.sale_price_each)}</td><td style="text-align:right">${fmtCur(p.line_total)}</td></tr>`
    ).join('');

    // Build pending estimate rows (Inspection Findings / Estimate). These
    // are is_estimate_line=TRUE lines the customer hasn't approved yet, so
    // they sit OUTSIDE the main totals but should print so the shop has the
    // full picture on paper.
    const pendingEstLabor = (r.labor_lines || []).filter(l => l.is_estimate_line && !l.customer_approved);
    const pendingEstParts = (r.parts_lines || []).filter(p => p.is_estimate_line && !p.customer_approved);
    let pendingEstTotal = 0;
    pendingEstLabor.forEach(l => pendingEstTotal += parseFloat(l.line_total || 0));
    pendingEstParts.forEach(p => pendingEstTotal += parseFloat(p.line_total || 0));
    const pendingEstLaborRows = pendingEstLabor.map((l, i) =>
      `<tr><td>${i+1}</td><td>L</td><td>${l.description || ''}</td><td style="text-align:right">${parseFloat(l.hours || 0).toFixed(2)}</td><td style="text-align:right">${fmtCur(l.rate)}</td><td style="text-align:right">${fmtCur(l.line_total)}</td></tr>`
    ).join('');
    const pendingEstPartsRows = pendingEstParts.map(p =>
      `<tr><td>P</td><td>${p.part_number ? p.part_number + ' — ' : ''}${p.description || ''}</td><td style="text-align:right">${parseFloat(p.quantity || 0)}</td><td style="text-align:right">${fmtCur(p.sale_price_each)}</td><td style="text-align:right">${fmtCur(p.line_total)}</td></tr>`
    ).join('');

    // Build freight rows
    const freightRows = (r.freight_lines || []).map(f =>
      `<tr><td>S</td><td>${f.description || ''}</td><td style="text-align:right">1</td><td style="text-align:right">${fmtCur(f.amount)}</td><td style="text-align:right">${fmtCur(f.amount)}</td></tr>`
    ).join('');

    const underWarranty = parseFloat(r.under_warranty_amount) || 0;
    const deposit = parseFloat(r.deposit_amount) || 0;
    const freightSub = parseFloat(r.freight_subtotal) || 0;

    // Build Payment Detail section (only for invoice-stage statuses)
    const invoiceStatuses = ['complete', 'payment_pending', 'partial', 'paid'];
    const payments = r.payments || [];
    const methodLabels = { credit_card: 'Card', check: 'Check', cash: 'Cash', zelle: 'Zelle' };
    let paymentDetailHtml = '';
    if (invoiceStatuses.includes(r.status) && (payments.length > 0 || deposit > 0)) {
      let payRows = '';
      let totalCollectedInTable = 0;

      // Payment rows
      payments.forEach(p => {
        const pDate = p.payment_date ? fmtPrintDateShort(p.payment_date.includes('T') ? p.payment_date : p.payment_date + 'T12:00:00') : '\u2014';
        const pMethod = methodLabels[p.payment_method] || p.payment_method || '\u2014';
        const pRef = p.reference_number || p.check_number || '\u2014';
        const pAmt = parseFloat(p.amount) || 0;
        totalCollectedInTable += pAmt;
        payRows += `<tr><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px">${pDate}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px">${pMethod}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px">${pRef}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px;text-align:right">${fmtCur(pAmt)}</td></tr>`;
      });

      const amountDue = parseFloat(r.amount_due) || 0;
      const paidInFull = amountDue <= 0;

      paymentDetailHtml = `
      <div style="margin-top:20px;page-break-inside:avoid">
        <div style="font-size:13px;font-weight:bold;color:#1a2a4a;margin-bottom:6px;border-bottom:2px solid #1a2a4a;padding-bottom:4px">PAYMENT DETAIL</div>
        <table class="lines" style="margin-bottom:8px">
          <thead><tr style="background:#1a2a4a !important"><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Date</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Method</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Reference #</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Amount</th></tr></thead>
          <tbody>
            ${payRows}
            <tr style="background:#f3f4f6"><td colspan="3" style="text-align:right;font-weight:bold;padding:6px 8px;border-top:2px solid #d1d5db;font-size:11px">TOTAL COLLECTED</td><td style="text-align:right;font-weight:bold;padding:6px 8px;border-top:2px solid #d1d5db;font-size:11px">${fmtCur(totalCollectedInTable)}</td></tr>
          </tbody>
        </table>
        <div style="text-align:right;font-size:14px;font-weight:bold;margin-top:6px;${paidInFull ? 'color:#2e7d32' : 'color:#dc2626'}">
          ${paidInFull ? 'PAID IN FULL' : 'BALANCE DUE: ' + fmtCur(amountDue)}
        </div>
      </div>`;
    }

    const html = `<!DOCTYPE html><html><head><title>${docTitle} ${r.record_number}</title>
<style>
  html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  @media print { @page { margin: 0.5in; } html, body, * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; } }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 8px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 3px solid #1a2a4a; padding-bottom: 8px; }
  .header-left { display: flex; align-items: flex-start; gap: 12px; }
  .header-left img { height: 90px; max-width: 220px; object-fit: contain; }
  .header-left h1 { color: #1a2a4a; margin: 0; font-size: 16px; font-weight: bold; }
  .header-left p { margin: 1px 0; font-size: 10px; color: #333; }
  .header-right { text-align: right; }
  .header-right h2 { color: #fff !important; background: ${docColor} !important; margin: 0; font-size: 18px; font-weight: bold; padding: 6px 14px; border-radius: 4px; display: inline-block; }
  .header-right p { color: #333; font-size: 10px; margin: 3px 0; }
  .info-block { display: flex; gap: 20px; margin-bottom: 8px; padding: 5px 10px; background: #f9fafb !important; border: 1px solid #ccc; border-radius: 4px; }
  .info-block div { flex: 1; }
  .info-block label { font-weight: bold; font-size: 9px; text-transform: uppercase; color: #1a2a4a; display: block; }
  .info-block span { font-size: 11px; color: #111; }
  table.lines { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
  table.lines th { background: #1a2a4a !important; color: #fff !important; padding: 4px 8px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1a2a4a; letter-spacing: 0.02em; }
  table.lines td { padding: 3px 8px; border-bottom: 1px solid #ddd; font-size: 11px; color: #111; }
  .totals-block { margin-top: 5px; display: flex; justify-content: flex-end; }
  .auth-section { margin-top: 6px; }
  .auth-text { font-size: 8.5px; color: #333; line-height: 1.25; }
  .auth-text p { margin: 3px 0; }
  .sig-row { page-break-inside: avoid; }
  .totals { width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 1px 0; font-size: 10px; color: #000; }
  .totals .row.bold { font-weight: bold; font-size: 12px; color: #1a2a4a !important; }
  .totals .row.divider { border-top: 2px solid #1a2a4a !important; margin-top: 4px; padding-top: 4px; }
</style></head><body>
<div class="header">
  <div class="header-left">
    <img src="${window.location.origin}/master-rvtech-logo-dark.jpg" alt="Master Tech RV" style="height:90px;max-width:220px;object-fit:contain" />
    <div>
    <h1>MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p>6590 EAST 49TH AVENUE</p>
    <p>COMMERCE CITY CO 80022</p>
    <p>(303) 557-2214</p>
    <p>https://mastertechrvrepair.com/</p>
    <p>service@mastertechrvrepair.com</p>
    <p style="margin-top:4px"><em>Our Service Makes Happy Campers!</em></p>
    </div>
  </div>
  <div class="header-right">
    <h2>${docTitle} #${r.record_number}</h2>
    <p>Original Date: ${intakeDate}</p>
    ${r.start_date ? `<p>Start Date: ${fmtPrintDateShort(r.start_date.includes('T') ? r.start_date : r.start_date + 'T12:00:00')}</p>` : ''}
    ${!['complete', 'payment_pending', 'partial', 'paid'].includes(r.status) && r.expected_completion_date ? `<p style="font-size:15px;font-weight:bold;color:#000;margin:5px 0;">Due Date: ${fmtPrintDateShort(r.expected_completion_date.includes('T') ? r.expected_completion_date : r.expected_completion_date + 'T12:00:00')}</p>` : ''}
    ${r.actual_completion_date ? `<p>Completed: ${fmtPrintDateShort(r.actual_completion_date.includes('T') ? r.actual_completion_date : r.actual_completion_date + 'T12:00:00')}</p>` : ''}
    <p>Time: ${timePrinted}</p>
  </div>
</div>

<div class="info-block">
  <div>
    <label>Customer</label>
    <span>${r.company_name ? r.company_name + ' (' + (r.account_number || '') + ')' : ''}</span><br/>
    <span>${customerName}</span><br/>
    <span>${address || '—'}</span><br/>
    ${r.email_primary ? `<span>${r.email_primary}</span><br/>` : ''}
    ${r.email_secondary ? `<span>${r.email_secondary}</span><br/>` : ''}
    ${r.phone_primary ? `<span>${formatPhone(r.phone_primary)}</span>` : ''}
    ${r.phone_secondary ? `<br/><span>${formatPhone(r.phone_secondary)}</span>` : ''}
  </div>
  <div>
    <label>Unit</label>
    <span>${[r.year, r.make, r.model].filter(Boolean).join(' ') || '—'}</span><br/>
    <label>License Plate</label><span>${r.license_plate || '—'}</span><br/>
    <label>VIN</label><span>${r.vin || '—'}</span><br/>
    <label>Key #</label><span>${r.key_number || '—'}</span>
    ${r.mileage_at_intake ? `<br/><label>Mileage at Intake</label><span>${r.mileage_at_intake}</span>` : ''}
    ${!isEstimate && techNames.length > 0 ? `<br/><label>Serviced By</label><span>${techNames.join(', ')}</span>` : ''}
  </div>
</div>
${(r.is_insurance_job || r.insurance_company || r.claim_number || r.policy_number || r.insurance_contact_name || r.insurance_phone || r.insurance_email || parseFloat(r.deductible_amount) > 0 || r.authorization_number || parseFloat(r.under_warranty_amount) > 0) ? `<div class="info-block">
  <div>
    <label>Insurance</label>
    <span>${r.insurance_company || '\u2014'}</span><br/>
    ${r.claim_number ? `<label>Claim #</label><span>${r.claim_number}</span><br/>` : ''}
    ${r.policy_number ? `<label>Policy #</label><span>${r.policy_number}</span><br/>` : ''}
    ${r.authorization_number ? `<label>Authorization #</label><span>${r.authorization_number}</span><br/>` : ''}
    ${parseFloat(r.deductible_amount) > 0 ? `<label>Deductible</label><span>${fmtCur(r.deductible_amount)}</span><br/>` : ''}
    ${parseFloat(r.under_warranty_amount) > 0 ? `<label>Under Warranty</label><span>${fmtCur(r.under_warranty_amount)}</span>` : ''}
  </div>
  ${(r.insurance_contact_name || r.insurance_phone || r.insurance_email) ? `<div>
    <label>Insurance Contact</label>
    ${r.insurance_contact_name ? `<span>${r.insurance_contact_name}</span><br/>` : ''}
    ${r.insurance_phone ? `<span>${formatPhone(r.insurance_phone)}</span><br/>` : ''}
    ${r.insurance_email ? `<span>${r.insurance_email}</span>` : ''}
  </div>` : ''}
</div>` : ''}

${r.job_description && !['complete', 'payment_pending', 'partial', 'paid'].includes(r.status) ? `<div style="margin:8px 0"><strong style="font-size:12px;text-transform:uppercase;color:#1a2a4a;border-bottom:1px solid #1a2a4a;display:inline-block;padding-bottom:2px">Job Description:</strong><ul style="margin:3px 0 0;padding-left:20px;font-size:11px;line-height:1.35">${r.job_description.split('\n').filter(l => l.trim()).map(l => '<li style="margin-bottom:1px">' + l.trim() + '</li>').join('')}</ul></div>` : ''}
${r.customer_notes ? `<div style="margin:8px 0"><strong style="font-size:12px;text-transform:uppercase;color:#1a2a4a;border-bottom:1px solid #1a2a4a;display:inline-block;padding-bottom:2px">Customer Notes:</strong><p style="margin:4px 0 0;font-size:11px;white-space:pre-wrap">${r.customer_notes}</p></div>` : ''}

${(r.labor_lines || []).length > 0 ? `
<table class="lines">
  <thead><tr style="background:#1a2a4a !important"><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">#</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Type</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Labor Performed</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Hours</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Rate</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Subtotal</th></tr></thead>
  <tbody>${laborRows}${laborTotalRow}</tbody>
</table>` : ''}

${(r.parts_lines || []).length > 0 ? `
<table class="lines">
  <thead><tr style="background:#1a2a4a !important"><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Type</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Parts Sold</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Qty</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Rate</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Subtotal</th></tr></thead>
  <tbody>${partsRows}</tbody>
</table>` : ''}

${(r.freight_lines || []).length > 0 ? `
<table class="lines">
  <thead><tr style="background:#1a2a4a !important"><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Type</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px">Description</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Qty</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Rate</th><th style="background:#1a2a4a;color:#fff;font-weight:bold;font-size:11px;text-align:right">Subtotal</th></tr></thead>
  <tbody>${freightRows}</tbody>
</table>` : ''}

${(pendingEstLabor.length + pendingEstParts.length) > 0 ? `
<div style="margin-top:14px;padding:10px 12px;background:#fffbeb;border:2px solid #f59e0b;border-radius:6px;">
  <div style="font-size:12px;font-weight:bold;color:#92400e;margin-bottom:4px;">INSPECTION FINDINGS / ESTIMATE — PENDING CUSTOMER APPROVAL</div>
  <div style="font-size:10px;color:#92400e;margin-bottom:8px;font-style:italic;">Items below are NOT included in the totals above. They will be added to the work order once the customer approves them.</div>
  ${pendingEstLabor.length > 0 ? `
  <table class="lines" style="margin-top:6px;">
    <thead><tr style="background:#92400e !important"><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px">#</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px">Type</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px">Labor Proposed</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px;text-align:right">Hours</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px;text-align:right">Rate</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px;text-align:right">Subtotal</th></tr></thead>
    <tbody>${pendingEstLaborRows}</tbody>
  </table>` : ''}
  ${pendingEstParts.length > 0 ? `
  <table class="lines" style="margin-top:6px;">
    <thead><tr style="background:#92400e !important"><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px">Type</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px">Parts Proposed</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px;text-align:right">Qty</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px;text-align:right">Rate</th><th style="background:#92400e;color:#fff;font-weight:bold;font-size:11px;text-align:right">Subtotal</th></tr></thead>
    <tbody>${pendingEstPartsRows}</tbody>
  </table>` : ''}
  <div style="margin-top:6px;display:flex;justify-content:flex-end;font-size:12px;font-weight:bold;color:#92400e;">
    <span style="margin-right:16px;">ESTIMATE TOTAL (PENDING):</span>
    <span>${fmtCur(pendingEstTotal)}</span>
  </div>
</div>` : ''}

<div class="totals-block">
  <div class="totals">
    <div class="row"><span>SUBTOTAL — LABOR</span><span>${fmtCur(r.labor_subtotal)}</span></div>
    <div class="row"><span>SUBTOTAL — PARTS</span><span>${fmtCur(r.parts_subtotal)}</span></div>
    ${freightSub > 0 ? `<div class="row"><span>SUBTOTAL — FREIGHT/MISC</span><span>${fmtCur(freightSub)}</span></div>` : ''}
    <div class="row" style="padding-left:20px;font-size:9px;color:#888"><span>&mdash; Shop Supplies</span><span>${r.shop_supplies_exempt ? 'WAIVED' : fmtCur(r.shop_supplies_amount)}</span></div>
    <div class="row" style="padding-left:20px;font-size:9px;color:#888"><span>&mdash; CC Fee (3%)</span><span>${r.cc_fee_applied ? fmtCur(r.cc_fee_amount) : 'N/A'}</span></div>
    <div class="row"><span>TOTAL TAX (Parts + Supplies)</span><span>${r.tax_waived ? 'WAIVED' : fmtCur(r.tax_amount)}</span></div>
    ${deposit > 0 ? `<div class="row"><span>DEPOSIT RECEIVED</span><span>${fmtCur(deposit)}</span></div>` : ''}
    <div class="row bold divider"><span>TOTAL SALES</span><span>${fmtCur(r.total_sales)}</span></div>
    ${underWarranty > 0 ? `<div class="row" style="padding-left:20px;font-size:9px;color:#888"><span>&mdash; Under Warranty</span><span>(${fmtCur(underWarranty)})</span></div>` : ''}
    ${(parseFloat(r.discount_amount) || 0) > 0 ? `<div class="row" style="padding-left:20px;font-size:9px;color:#888"><span>&mdash; Discount${r.discount_description ? ' — ' + r.discount_description : ''}</span><span>-${fmtCur(r.discount_amount)}</span></div>` : ''}
    <div class="row"><span>TOTAL COLLECTED</span><span>${fmtCur(r.total_collected)}</span></div>
    <div class="row bold divider" style="color:${(parseFloat(r.amount_due) || 0) > 0 ? '#dc2626' : '#111'}"><span>AMOUNT DUE</span><span>${fmtCur(r.amount_due)}</span></div>
  </div>
</div>

${paymentDetailHtml}

<div class="auth-section">
  <div class="auth-text">
    ${r.status === 'estimate' ? `
    <p style="font-size:12px;font-weight:bold;color:#1a2a4a;margin:0 0 4px">Authorization Agreement:</p>
    <p>By signing below, I authorize Master Tech RV Repair &amp; Storage to perform the services and repairs described in this estimate on my RV/unit. I understand that the final charges may vary from this estimate due to unforeseen conditions discovered during the repair process. Any additional work or costs beyond this estimate will be communicated to me for approval before proceeding.</p>
    <p>I agree to pay the full balance for all authorized services upon completion of work.</p>
    <p>I understand that Master Tech RV Repair &amp; Storage takes reasonable care of all units in our possession; however, we are not responsible for loss or damage to the RV or personal belongings left inside in the event of fire, theft, weather events, or other circumstances beyond our control. We recommend removing valuables prior to drop-off.</p>
    <p>I grant Master Tech RV Repair &amp; Storage permission to operate my RV/unit as needed for testing, inspection, and the safe movement of the vehicle within our facility.</p>
    <p>I understand that if my RV is not picked up within two (2) days of completion notice, an outdoor storage fee of $25/day will be added to the invoice. This fee does not apply to current storage customers or when prior arrangements have been made.</p>
    <p>WARRANTY - 60 days on parts and labor unless otherwise stated from parts manufacturer. If customer provides parts, warranty is only on labor.</p>
    <p>If paying by credit card, a 3% courtesy fee will be added to the final bill.</p>
    ` : `
    <p>I understand that if my RV is not picked up within two (2) days of completion notice, an outdoor storage fee of $25/day will be added to the invoice. This fee does not apply to current storage customers or when prior arrangements have been made.</p>
    <p>WARRANTY - 60 days on parts and labor unless otherwise stated from parts manufacturer. If customer provides parts, warranty is only on labor.</p>
    <p>If paying by credit card, a 3% courtesy fee will be added to the final bill.</p>
    `}
    ${r.authorization_signature ? `
      <div class="sig-row" style="margin-top:10px;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div style="font-size:12px;font-weight:bold;margin-bottom:4px">Signature:</div>
          <img src="${r.authorization_signature}" style="height:60px; display:block; margin-bottom:4px" />
          <div style="font-size:11px;font-weight:bold">${(r.first_name || '') + ' ' + (r.last_name || '')}</div>
        </div>
        <div>
          <span style="font-size:12px;font-weight:bold">Date:</span>
          <span style="font-size:12px;font-weight:bold;margin-left:8px">${r.authorization_signed_at ? fmtPrintDateShort(r.authorization_signed_at) : '\u2014'}</span>
        </div>
      </div>
    ` : `
      <div class="sig-row" style="margin-top:10px;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div style="margin-bottom:6px"><span style="font-size:12px;font-weight:bold">Signature:</span></div>
          <div style="border-bottom:2px solid #333;width:320px"></div>
        </div>
        <div>
          <div style="margin-bottom:6px"><span style="font-size:12px;font-weight:bold">Date:</span></div>
          <div style="border-bottom:2px solid #333;width:200px"></div>
        </div>
      </div>
    `}
  </div>
</div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment? Totals will be recalculated.')) return;
    try {
      await api.deletePayment(id, paymentId);
      await fetchRecord();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatDate = (val) => {
    if (!val) return '—';
    // Parse as date-only string to avoid timezone shift
    const s = typeof val === 'string' ? val : '';
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${parseInt(match[2])}/${parseInt(match[3])}/${match[1]}`;
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { timeZone: 'America/Denver' });
  };

  const toDateVal = (val) => {
    if (!val) return '';
    const s = typeof val === 'string' ? val : '';
    // If already YYYY-MM-DD, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // Extract date portion before any T to avoid timezone shift
    const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const d = new Date(s);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  };

  if (error && !record) return <div style={{ color: 'red', padding: '40px' }}>Error: {error}</div>;
  if (!record) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const statusEditable = !['paid', 'void'].includes(record.status);
  const isEditable = statusEditable && canEditRecords;
  const canDeletePayments = isAdmin || isBookkeeper;


  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top nav — sticky below fixed header */}
      <div style={{
        position: 'sticky',
        top: isMobile ? '48px' : '56px',
        zIndex: 999,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '8px 0',
        marginBottom: '16px',
        marginLeft: '-24px',
        marginRight: '-24px',
        paddingLeft: isMobile ? '12px' : '24px',
        paddingRight: isMobile ? '12px' : '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}>
        <button onClick={() => navigate(fromCustomer ? `/customers/${fromCustomerId}` : '/records')} style={{ ...btnLink, marginBottom: '8px' }}>
          &larr; {fromCustomer ? 'Back to Customer' : 'Back to Records'}
        </button>
        <div className={isMobile ? 'detail-actions' : ''} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {saving && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Saving...</span>}
          <button onClick={handlePrint} style={btnPrint}>Print</button>
          <button onClick={openEmailDialog} disabled={emailing} style={{ ...btnPrint, backgroundColor: '#0369a1' }}>
            {emailing ? 'Sending...' : '\u2709 Email'}
          </button>
          {canEditRecords && record.status !== 'void' && (
            <button onClick={() => setShowScheduleModal(true)} style={btnSchedule}>Add to Schedule</button>
          )}
          {canEditRecords && (
            <button onClick={() => setShowCopyModal(true)} style={btnSecondary}>Copy to WO</button>
          )}
          {canEditRecords && record.status === 'estimate' && (
            <button
              onClick={() => {
                if (window.confirm('File this estimate? It will move out of Needs Attention into the Filed Estimates section.')) {
                  handleManualStatusChange('filed');
                }
              }}
              style={btnFile}
            >
              File
            </button>
          )}
          {canEditRecords && record.status === 'filed' && (
            <button
              onClick={() => {
                if (window.confirm('Move this estimate back to active? It will reappear in Needs Attention.')) {
                  handleManualStatusChange('estimate');
                }
              }}
              style={btnFile}
            >
              Unfile
            </button>
          )}
          {isEditable && record.status !== 'void' && (
            <button onClick={handleVoid} style={btnDanger}>Void</button>
          )}
        </div>
      </div>

      {emailMsg && (
        <div style={{
          padding: '10px 16px', marginBottom: '12px', borderRadius: '6px', fontSize: '0.875rem',
          backgroundColor: emailMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: emailMsg.type === 'success' ? '#065f46' : '#dc2626',
          border: `1px solid ${emailMsg.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
        }}>{emailMsg.text}</div>
      )}

      {error && <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px', whiteSpace: 'pre-line' }}>{error}</div>}
      {successMsg && <div style={{ color: '#065f46', marginBottom: '12px', padding: '10px 16px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>{successMsg}</span><button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontSize: '1.1rem' }}>&times;</button></div>}

      {/* Document label */}
      <DocumentLabel status={record.status} />

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>Status:</span>
          <StatusBadge status={record.status} />
          {/* Manual status override dropdown */}
          {(isAdmin || canEditRecords || isBookkeeper) && (
            <select
              value={record.status}
              onChange={(e) => handleManualStatusChange(e.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', color: '#374151', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              {ALL_STATUSES.filter(s => {
                // Void: admin and bookkeeper only (destructive).
                if (s.value === 'void') return isAdmin || isBookkeeper;
                // Paid: admin, bookkeeper, and editors (incl. techs) — techs
                // close out and collect payment at pickup all the time.
                if (s.value === 'paid') return isAdmin || isBookkeeper || canEditRecords;
                // All others: admin and any record editor.
                return isAdmin || canEditRecords;
              }).map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEditRecords && NEXT_STATUS[record.status] && (
            <button onClick={handleAdvanceStatus} style={btnPrimary}>
              {NEXT_LABEL[record.status] || 'Advance Status'}
            </button>
          )}
          {(isAdmin || canEditRecords) && ['payment_pending', 'partial'].includes(record.status) && parseFloat(record.amount_due) > 0 && (
            <button onClick={() => { setReminderChannel('both'); setShowReminderModal(true); }} disabled={sendingReminder} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              {sendingReminder ? 'Sending...' : 'Send Reminder'}
            </button>
          )}
          {/* Payment link button removed — links are sent via email checkbox */}
        </div>
      </div>
      {showPayLinkModal && (
        <PaymentLinkModal
          recordId={id}
          record={record}
          onClose={() => { setShowPayLinkModal(false); setPayLinksRefresh((n) => n + 1); }}
        />
      )}
      <OnlinePaymentLinksSection recordId={id} refreshKey={payLinksRefresh} />
      {record.last_reminder_sent_at && (
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
          Last reminder: {formatDateTime(record.last_reminder_sent_at)} ({record.reminder_count} sent)
        </div>
      )}

      {/* Customer Estimate Sign-Off — only visible for estimates */}
      {record.status === 'estimate' && canEditRecords && (
        <div style={{ ...sectionStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ ...sectionTitle, borderBottom: 'none', marginBottom: '4px', paddingBottom: 0, color: '#1e40af' }}>Customer Estimate Sign-Off</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>
                Get customer signature to authorize this estimate and advance to Work Order
              </p>
            </div>
            <button onClick={() => setShowSignModal(true)} style={btnSignoff}>
              Collect Signature
            </button>
          </div>
        </div>
      )}

      {/* Signed indicator */}
      {record.authorization_signed_at && (
        <div style={{ ...sectionStyle, backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>&#9989;</span>
            <div>
              <strong style={{ color: '#065f46' }}>Estimate Authorized</strong>
              <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#6b7280' }}>
                Signed {formatDateTime(record.authorization_signed_at)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Record Header ─── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Record Header</h2>
        </div>
        <div style={gridStyle}>
          <Field label="Record Number" value={record.record_number} />
          <Field label="Record Date" value={formatDate(record.intake_date || record.created_at)} />
          <Field label="Account #" value={record.account_number} />
          <EditableField label="Key #" field="key_number" value={record.key_number || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <div>
            <label style={labelStyle}>Customer</label>
            <div style={{ fontSize: '0.875rem' }}>
              <Link to={`/customers/${record.customer_id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                {record.last_name || ''}{record.first_name ? ', ' + record.first_name : ''}
              </Link>
            </div>
          </div>
          <EditableField label="Company" field="company_name" value={record.company_name || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="Phone" field="phone_primary" value={record.phone_primary || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="Phone 2" field="phone_secondary" value={record.phone_secondary || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="Email" field="email_primary" value={record.email_primary || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="Email 2" field="email_secondary" value={record.email_secondary || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          {isEditable ? (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '2fr 1fr 80px 120px', gap: '8px' }}>
              <EditableField label="Street" field="address_street" value={record.address_street || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
              <EditableField label="City" field="address_city" value={record.address_city || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
              <EditableField label="State" field="address_state" value={record.address_state || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
              <EditableField label="ZIP" field="address_zip" value={record.address_zip || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
            </div>
          ) : (
            <FieldFull label="Address" value={[record.address_street, record.address_city, record.address_state, record.address_zip].filter(Boolean).join(', ') || '—'} />
          )}
        </div>
      </div>

      {/* ─── Unit Information ─── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Unit Information</h2>
        </div>
        <div style={gridStyle}>
          <EditableField label="Year" field="year" value={record.year || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="Make" field="make" value={record.make || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="Model" field="model" value={record.model || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="VIN" field="vin" value={record.vin || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
          <EditableField label="License Plate" field="license_plate" value={record.license_plate || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
        </div>
      </div>

      {/* ─── Insurance / Warranty ─── */}
      {(() => {
        const hasInsData = record.insurance_company || record.claim_number || record.policy_number
          || record.insurance_contact_name || record.insurance_phone || record.insurance_email
          || parseFloat(record.deductible_amount) > 0 || record.is_insurance_job;
        const insExpanded = expandedSections.insurance !== undefined ? expandedSections.insurance : !!hasInsData;
        const toggleIns = () => setExpandedSections(s => ({ ...s, insurance: !insExpanded }));
        return (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: insExpanded ? '12px' : 0, cursor: 'pointer' }} onClick={toggleIns}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
                  <span style={{ fontSize: '0.7rem', marginRight: '6px' }}>{insExpanded ? '\u25BC' : '\u25B6'}</span>
                  Insurance / Warranty
                </h2>
                {isEditable ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={record.is_insurance_job || false} onChange={(e) => autoSave('is_insurance_job', e.target.checked)} />
                    Insurance Job
                  </label>
                ) : (
                  record.is_insurance_job && <StatusBadge status="estimate" />
                )}
                {!insExpanded && !hasInsData && (
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 500 }}>+ Add Insurance Info</span>
                )}
              </div>
            </div>
            {insExpanded && (
              <>
                {/* Row 1: Insurance Company, Claim #, Policy #, Deductible */}
                <div style={gridStyle}>
                  <EditableField label="Insurance Company" field="insurance_company" value={record.insurance_company || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                  <EditableField label="Claim #" field="claim_number" value={record.claim_number || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                  <EditableField label="Policy #" field="policy_number" value={record.policy_number || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                  <EditableField label="Deductible" field="deductible_amount" value={record.deductible_amount || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="number" />
                </div>
                {/* Row 2: Contact Name, Phone, Email, Authorization # */}
                <div style={{ ...gridStyle, marginTop: '12px' }}>
                  <EditableField label="Contact Name" field="insurance_contact_name" value={record.insurance_contact_name || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                  <EditableField label="Phone" field="insurance_phone" value={record.insurance_phone || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                  <EditableField label="Email" field="insurance_email" value={record.insurance_email || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                  <EditableField label="Authorization #" field="authorization_number" value={record.authorization_number || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} />
                </div>
                {/* Row 3: Under Warranty Amount, Mileage at Intake */}
                <div style={{ ...gridStyle, marginTop: '12px' }}>
                  <EditableField label="Under Warranty Amount" field="under_warranty_amount" value={record.under_warranty_amount || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="number" />
                  <EditableField label="Mileage at Intake" field="mileage_at_intake" value={record.mileage_at_intake || ''} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="number" />
                </div>
                {!isEditable && !record.is_insurance_job && (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '12px 0 0' }}>Not an insurance job</p>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* ─── Dates ─── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitle}>Dates</h2>
        </div>
        <div style={gridStyle}>
          <EditableField label="Intake Date" field="intake_date" value={isEditable ? toDateVal(record.intake_date) : formatDate(record.intake_date)} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="date" />
          <EditableField label="Start Date" field="start_date" value={isEditable ? toDateVal(record.start_date) : formatDate(record.start_date)} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="date" />
          <EditableField label="Expected Completion" field="expected_completion_date" value={isEditable ? toDateVal(record.expected_completion_date) : formatDate(record.expected_completion_date)} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="date" />
          <EditableField label="Completion Date" field="actual_completion_date" value={isEditable ? toDateVal(record.actual_completion_date) : formatDate(record.actual_completion_date)} editable={isEditable} autoSave={autoSave} onFocus={setFocusedField} onBlur={() => setFocusedField(null)} type="date" />
        </div>
      </div>

      {/* ─── Job Description ─── */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Job Description</h2>
        {record.status === 'void' ? (
          <BulletDisplay text={record.job_description} />
        ) : (
          <AutoSaveBulletTextarea
            value={record.job_description || ''}
            recordId={id}
            onSaved={fetchRecord}
          />
        )}
      </div>

      {/* Approved Work — Labor Lines (non-estimate only) */}
      <LaborLinesTable
        recordId={record.id}
        laborLines={(record.labor_lines || []).filter(l => !l.is_estimate_line)}
        isEditable={isEditable}
        onUpdate={fetchRecord}
      />

      {/* Approved Work — Parts Lines (non-estimate only) */}
      <PartsLinesTable
        recordId={record.id}
        partsLines={(record.parts_lines || []).filter(l => !l.is_estimate_line)}
        isEditable={isEditable}
        onUpdate={fetchRecord}
      />

      {/* ─── Inspection Findings / Estimate Section ─── */}
      {(() => {
        const estLabor = (record.labor_lines || []).filter(l => l.is_estimate_line);
        const estParts = (record.parts_lines || []).filter(l => l.is_estimate_line);
        const hasEstimateLines = estLabor.length > 0 || estParts.length > 0;
        const estimateTotal = estLabor.reduce((s, l) => s + parseFloat(l.line_total || 0), 0)
          + estParts.reduce((s, l) => s + parseFloat(l.line_total || 0), 0);
        const approvedTotal = estLabor.filter(l => l.customer_approved).reduce((s, l) => s + parseFloat(l.line_total || 0), 0)
          + estParts.filter(l => l.customer_approved).reduce((s, l) => s + parseFloat(l.line_total || 0), 0);
        const allApproved = hasEstimateLines && estLabor.every(l => l.customer_approved) && estParts.every(l => l.customer_approved);

        // Always show the section if there are estimate lines OR if the record is editable
        if (!hasEstimateLines && !isEditable) return null;

        const estExpanded = expandedSections.estimate !== undefined ? expandedSections.estimate : hasEstimateLines;
        const toggleEst = () => setExpandedSections(s => ({ ...s, estimate: !estExpanded }));

        return (
          <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '2px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: estExpanded ? '16px' : 0, cursor: 'pointer' }} onClick={toggleEst}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', marginRight: '2px' }}>{estExpanded ? '▼' : '▶'}</span>
                  Inspection Findings / Estimate
                </h2>
                {!estExpanded && hasEstimateLines && (
                  <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 500 }}>
                    ({estLabor.length + estParts.length} item{estLabor.length + estParts.length !== 1 ? 's' : ''} &mdash; ${estimateTotal.toFixed(2)})
                  </span>
                )}
                {!estExpanded && allApproved && <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>All Approved</span>}
                {!estExpanded && !hasEstimateLines && (
                  <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 500 }}>+ Add Estimate Lines</span>
                )}
              </div>
              {estExpanded && isEditable && hasEstimateLines && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  {allApproved && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>All Approved</span>}
                  <button
                    onClick={() => setShowEstimateEmailModal(true)}
                    style={{ padding: '6px 14px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    Email Estimate to Customer
                  </button>
                </div>
              )}
            </div>

            {estExpanded && (<>
              {hasEstimateLines && (
                <div style={{ marginBottom: '12px', padding: '10px 14px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '0.8rem', color: '#92400e' }}>
                  Estimate Total: <strong>${estimateTotal.toFixed(2)}</strong>
                  {approvedTotal > 0 && approvedTotal < estimateTotal && (
                    <span> &mdash; Customer Approved: <strong>${approvedTotal.toFixed(2)}</strong></span>
                  )}
                </div>
              )}

              {/* Estimate Labor */}
              <LaborLinesTable
                recordId={record.id}
                laborLines={estLabor}
                isEditable={isEditable}
                onUpdate={fetchRecord}
                isEstimate={true}
                showApproval={true}
              />

              {/* Estimate Parts */}
              <PartsLinesTable
                recordId={record.id}
                partsLines={estParts}
                isEditable={isEditable}
                onUpdate={fetchRecord}
                isEstimate={true}
                showApproval={true}
              />
            </>)}
          </div>
        );
      })()}

      {/* Freight Lines */}
      {(() => {
        const hasFreight = (record.freight_lines || []).length > 0;
        const freightExpanded = expandedSections.freight !== undefined ? expandedSections.freight : hasFreight;
        if (freightExpanded) {
          return <FreightLinesTable recordId={record.id} freightLines={record.freight_lines} isEditable={isEditable} recordStatus={record.status} onUpdate={fetchRecord} />;
        }
        return (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedSections(s => ({ ...s, freight: true }))}>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
                <span style={{ fontSize: '0.7rem', marginRight: '6px' }}>{'\u25B6'}</span>
                Freight / Shipping Charges
              </h2>
              {isEditable && <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 500 }}>+ Add Freight</span>}
            </div>
          </div>
        );
      })()}

      {/* ─── Invoice Totals ─── */}
      {canSeeFinancials && (
        <div style={{ ...sectionStyle, backgroundColor: '#f9fafb' }}>
          <h2 style={sectionTitle}>Invoice Totals</h2>
          <div className="totals-section" style={{ maxWidth: '440px', marginLeft: 'auto' }}>
            <TotalRow label="Subtotal — Labor" value={formatCurrency(record.labor_subtotal)} />
            <TotalRow label="Subtotal — Parts" value={formatCurrency(record.parts_subtotal)} />
            {parseFloat(record.freight_subtotal) > 0 && (
              <TotalRow label="Subtotal — Freight / Misc." value={formatCurrency(record.freight_subtotal)} />
            )}

            {/* Shop Supplies toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.8rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Shop Supplies
                {isEditable && (
                  <ToggleSwitch
                    checked={!record.shop_supplies_exempt}
                    onChange={() => handleToggleFlag('shop_supplies_exempt', record.shop_supplies_exempt)}
                  />
                )}
                {record.shop_supplies_exempt && <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>WAIVED</span>}
              </span>
              <span>{formatCurrency(record.shop_supplies_amount)}</span>
            </div>

            {/* CC Fee toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.8rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                CC Fee (3%)
                {isEditable && (
                  <ToggleSwitch
                    checked={!!record.cc_fee_applied}
                    onChange={() => handleToggleFlag('cc_fee_applied', !!record.cc_fee_applied)}
                  />
                )}
                {!record.cc_fee_applied && <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600 }}>N/A</span>}
              </span>
              <span>{formatCurrency(record.cc_fee_amount)}</span>
            </div>

            {/* Tax toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.875rem' }}>
              <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Tax ({((parseFloat(record.tax_rate) || 0.0975) * 100).toFixed(2)}% on parts + supplies)
                {isEditable && (
                  <ToggleSwitch
                    checked={!record.tax_waived}
                    onChange={() => handleToggleFlag('tax_waived', record.tax_waived)}
                  />
                )}
                {record.tax_waived && <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>WAIVED</span>}
              </span>
              <span>{formatCurrency(record.tax_amount)}</span>
            </div>

            {/* Discount/Credit — always editable on active records */}
            {(isEditable || parseFloat(record.discount_amount) > 0) && (
              <DiscountRow record={record} isEditable={isEditable} formatCurrency={formatCurrency} onSaved={fetchRecord} />
            )}

            <DepositField value={record.deposit_amount} editable={isEditable} onSave={async (val) => { try { await api.updateRecord(id, { deposit_amount: val }); await fetchRecord(); } catch (err) { setError(err.message); } }} />

            <div style={{ borderTop: '2px solid #1e3a5f', marginTop: '8px', paddingTop: '8px' }}>
              <TotalRow label="Total Sales" value={formatCurrency(record.total_sales)} bold />
              {parseFloat(record.under_warranty_amount) > 0 && <TotalRow label="Under Warranty" value={`-${formatCurrency(record.under_warranty_amount)}`} color="#dc2626" indent />}
              {parseFloat(record.discount_amount) > 0 && <TotalRow label={`Discount${record.discount_description ? ' — ' + record.discount_description : ''}`} value={`-${formatCurrency(record.discount_amount)}`} color="#dc2626" indent />}
              <TotalRow label="Total Collected" value={formatCurrency(record.total_collected)} />
              <TotalRow label="Amount Due" value={formatCurrency(record.amount_due)} bold color={parseFloat(record.amount_due) > 0 ? '#dc2626' : '#065f46'} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Payment Ledger ─── */}
      {canSeeFinancials && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Payment Ledger</h2>
            {canPostPayments && statusEditable && (
              <div className={isMobile ? 'payment-buttons' : ''} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowPayModal(true)} style={btnSquare}>Pay by Card</button>
                <button onClick={() => setManualPayModal('check')} style={btnPayMethod}>Pay by Check</button>
                <button onClick={() => setManualPayModal('cash')} style={btnPayMethod}>Pay by Cash</button>
                <button onClick={() => setManualPayModal('zelle')} style={btnPayMethod}>Pay by Zelle</button>
              </div>
            )}
          </div>
          {record.payments && record.payments.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Reference #</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  {canDeletePayments && <th style={{ ...thStyle, width: '60px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {record.payments.map(p => (
                  <tr key={p.id}>
                    <td style={tdStyle}>{formatDate(p.payment_date)}</td>
                    <td style={tdStyle}>
                      {METHOD_LABELS[p.payment_method] || p.payment_method.replace(/_/g, ' ')}
                      {p.square_transaction_id && (() => {
                        // The DB column is named square_transaction_id for historical reasons
                        // but the GoDaddy/Poynt online and terminal flows also write to it.
                        // Detect the real processor from the payment's notes string.
                        const notes = (p.notes || '').toLowerCase();
                        const isGoDaddy = notes.includes('godaddy') || notes.includes('poynt');
                        const isSquare = !isGoDaddy && (notes.includes('square') || !notes.length);
                        const label = isGoDaddy ? 'GoDaddy' : isSquare ? 'Square' : 'Online';
                        return <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '4px' }}>({label})</span>;
                      })()}
                    </td>
                    <td style={tdStyle}>{p.check_number || p.square_transaction_id || p.notes || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(p.amount)}</td>
                    {canDeletePayments && (
                      <td style={tdStyle}>
                        {statusEditable && (
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '12px 0 0' }}>No payments recorded</p>
          )}
        </div>
      )}

      {/* Square Payment Modal */}
      {canPostPayments && showPayModal && (
        <SquarePayment
          recordId={record.id}
          amountDue={parseFloat(record.amount_due) || 0}
          onSuccess={() => { setShowPayModal(false); fetchRecord(); }}
          onClose={() => setShowPayModal(false)}
        />
      )}

      {/* Manual Payment Modal (Check / Cash / Zelle) */}
      {manualPayModal && (
        <ManualPaymentModal
          method={manualPayModal}
          amountDue={parseFloat(record.amount_due) || 0}
          recordId={record.id}
          onSuccess={() => { setManualPayModal(null); fetchRecord(); }}
          onClose={() => setManualPayModal(null)}
        />
      )}

      {/* Send Payment Reminder Modal — choose Email / Text / Both */}
      {showReminderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 8px', color: '#1e3a5f', fontSize: '1.1rem' }}>Send Payment Reminder</h2>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#6b7280' }}>How should we send this reminder to the customer?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { value: 'email', label: 'Email only' },
                { value: 'text', label: 'Text only' },
                { value: 'both', label: 'Email and Text' },
              ].map((opt) => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1px solid ${reminderChannel === opt.value ? '#f59e0b' : '#e5e7eb'}`, background: reminderChannel === opt.value ? '#fffbeb' : '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#1e3a5f' }}>
                  <input type="radio" name="reminderChannel" value={opt.value} checked={reminderChannel === opt.value} onChange={(e) => setReminderChannel(e.target.value)} style={{ cursor: 'pointer' }} />
                  {opt.label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleSendReminder(reminderChannel)} disabled={sendingReminder} style={{ padding: '10px 24px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                {sendingReminder ? 'Sending...' : 'Send Reminder'}
              </button>
              <button onClick={() => setShowReminderModal(false)} style={{ padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Document Modal */}
      {showEmailModal && (() => {
        const docType = record.status === 'estimate' ? 'Estimate' : ['complete','payment_pending','partial','paid'].includes(record.status) ? 'Invoice' : 'Work Order';
        const placeholders = {
          Estimate: 'e.g. Please review your estimate and let us know if you have any questions before approving.',
          'Work Order': 'e.g. Here is your current work order summary. Please call if you have any questions.',
          Invoice: 'e.g. Thank you for your business! Please let us know if you have any questions about your invoice.',
        };
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <h2 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '1.1rem' }}>Email {docType}</h2>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>To</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="Recipient email address"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>CC <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional — separate multiple with commas)</span></label>
                <input
                  type="text"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  placeholder="e.g. insurance@company.com, manager@fleet.com"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Personal message (optional)</label>
                <textarea
                  value={emailPersonalMsg}
                  onChange={(e) => setEmailPersonalMsg(e.target.value)}
                  placeholder={placeholders[docType] || ''}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              {/* Payment Link Toggle */}
              <div style={{ marginBottom: '16px', padding: '12px', background: emailIncludePayLink ? '#eff6ff' : '#f9fafb', border: `1px solid ${emailIncludePayLink ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#1e3a5f' }}>
                  <input type="checkbox" checked={emailIncludePayLink} onChange={(e) => setEmailIncludePayLink(e.target.checked)} style={{ cursor: 'pointer' }} />
                  Include Payment Link
                </label>
                {emailIncludePayLink && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', marginBottom: '3px' }}>Type</label>
                      <select value={emailPayLinkType} onChange={(e) => {
                        setEmailPayLinkType(e.target.value);
                        const p = parseFloat(record.parts_subtotal) || 0;
                        const d = parseFloat(record.amount_due) || 0;
                        setEmailPayLinkAmount(e.target.value === 'parts_deposit' ? (p > 0 ? p.toFixed(2) : '') : (d > 0 ? d.toFixed(2) : ''));
                      }} style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <option value="parts_deposit">Parts Deposit</option>
                        <option value="final_payment">Final Payment</option>
                      </select>
                    </div>
                    <div style={{ width: '120px' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', marginBottom: '3px' }}>Amount</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>$</span>
                        <input type="number" step="0.01" min="0" value={emailPayLinkAmount}
                          onChange={(e) => setEmailPayLinkAmount(e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleEmailDocument} style={{ padding: '10px 24px', backgroundColor: '#0369a1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  {emailIncludePayLink ? 'Send Email with Payment Link' : 'Send Email'}
                </button>
                <button onClick={() => setShowEmailModal(false)} style={{ padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Signature Modal */}
      {showSignModal && (
        <SignatureModal
          record={record}
          onSign={handleSignEstimate}
          onClose={() => setShowSignModal(false)}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          record={record}
          onSuccess={() => { setShowScheduleModal(false); }}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {/* Copy to WO Modal */}
      {showCopyModal && (
        <CopyToWOModal
          record={record}
          onClose={() => setShowCopyModal(false)}
          onSuccess={(newId) => { setShowCopyModal(false); navigate(`/records/${newId}`); }}
        />
      )}

      {/* Email Estimate Modal — optional personal note */}
      {showEstimateEmailModal && (
        <EstimateEmailModal
          recordId={record.id}
          recordNumber={record.record_number}
          onClose={() => setShowEstimateEmailModal(false)}
        />
      )}

      {/* Notes — always editable */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Notes</h2>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Internal Notes</label>
            <AutoSaveTextarea
              value={record.internal_notes || ''}
              field="internal_notes"
              recordId={id}
              onSaved={fetchRecord}
            />
          </div>
          <div>
            <label style={labelStyle}>Customer Notes</label>
            <AutoSaveTextarea
              value={record.customer_notes || ''}
              field="customer_notes"
              recordId={id}
              onSaved={fetchRecord}
            />
          </div>
        </div>
      </div>

      {/* Photos */}
      <PhotoLinksSection recordId={record.id} isEditable={isEditable} />

      <CommunicationLog customerId={record.customer_id} recordId={record.id} />
    </div>
  );
}

// ─── Manual Payment Modal (Check / Cash / Zelle) ────────────────────────────
// ─── Schedule Modal ─────────────────────────────────────────────────────────
function EstimateEmailModal({ recordId, recordNumber, onClose }) {
  const [note, setNote] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await api.sendEstimateApproval(recordId, { personalMessage: note });
      alert('Estimate approval email sent to customer!');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, width: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>Email Estimate — WO #{recordNumber}</h3>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', color: '#6b7280' }}>X</button>
        </div>
        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Personal Message (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short note to the customer. Leave blank to send the default email."
            rows={5}
            autoFocus
            style={{ ...inputStyle, width: '100%', minHeight: '110px', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
            Will appear above the estimate items in the email the customer receives.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={sending} style={btnSecondary}>Cancel</button>
          <button onClick={handleSend} disabled={sending} style={{ ...btnPrimary, backgroundColor: '#f59e0b' }}>
            {sending ? 'Sending...' : 'Send Estimate Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyToWOModal({ record, onClose, onSuccess }) {
  // mode: 'new' = create a brand new record; 'existing' = append to open WO
  const [mode, setMode] = React.useState('new');
  const [customerSearch, setCSearch] = React.useState('');
  const [customerResults, setCResults] = React.useState([]);
  const [selectedCustomer, setSelCustomer] = React.useState(null);
  const [units, setUnits] = React.useState([]);
  const [unitId, setUnitId] = React.useState('');
  const [woSearch, setWoSearch] = React.useState('');
  const [woResults, setWoResults] = React.useState([]);
  const [selectedTarget, setSelectedTarget] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const laborLines = (record.labor_lines || []).filter(l => !l.deleted_at);
  const partsLines = (record.parts_lines || []).filter(l => !l.deleted_at);
  const freightLines = (record.freight_lines || []).filter(l => !l.deleted_at);

  const [selLabor, setSelLabor] = React.useState(laborLines.map(l => l.id));
  const [selParts, setSelParts] = React.useState(partsLines.map(l => l.id));
  const [selFreight, setSelFreight] = React.useState(freightLines.map(l => l.id));

  React.useEffect(() => {
    if (customerSearch.length < 2) { setCResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await api.getCustomers({ search: customerSearch, limit: 10 });
        setCResults(r.customers || []);
      } catch (e) { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  // Search open work orders when in "existing" mode. Filters out closed
  // (paid/void/complete/filed) records server-side via the search param —
  // we further filter on the client to be safe.
  React.useEffect(() => {
    if (mode !== 'existing' || woSearch.length < 2) { setWoResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await api.getRecords({ search: woSearch, limit: 15 });
        const open = (r.records || []).filter(rec =>
          rec.id !== record.id &&
          !['paid', 'void', 'complete', 'filed'].includes(rec.status)
        );
        setWoResults(open);
      } catch (e) { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [woSearch, mode, record.id]);

  const pickCustomer = async (c) => {
    setSelCustomer(c);
    setCSearch('');
    setCResults([]);
    try {
      const u = await api.getCustomerUnits(c.id);
      setUnits(u);
      if (u.length === 1) setUnitId(String(u[0].id));
    } catch (e) { /* ignore */ }
  };

  const toggleAll = (list, setter, ids) => {
    setter(list.length === ids.length ? [] : ids.map(l => l.id));
  };
  const toggleOne = (id, sel, setter) => {
    setter(sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };

  const handleCopy = async () => {
    if (mode === 'new' && (!selectedCustomer || !unitId)) return;
    if (mode === 'existing' && !selectedTarget) return;
    setSaving(true);
    setError('');
    try {
      const payload = mode === 'existing'
        ? { target_record_id: selectedTarget.id }
        : { customer_id: selectedCustomer.id, unit_id: parseInt(unitId) };
      const res = await api.copyRecord(record.id, {
        ...payload,
        labor_line_ids: selLabor,
        parts_line_ids: selParts,
        freight_line_ids: selFreight,
      });
      onSuccess(res.new_record_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const truncate = (s, n) => s && s.length > n ? s.substring(0, n) + '...' : s || '';
  const fmtCur = (v) => '$' + parseFloat(v || 0).toFixed(2);
  const totalSel = selLabor.length + selParts.length + selFreight.length;
  const ckStyle = { cursor: 'pointer', width: '15px', height: '15px', marginRight: '6px' };
  const lineStyle = { display: 'flex', alignItems: 'center', padding: '4px 0', fontSize: '0.8rem', borderBottom: '1px solid #f3f4f6' };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, width: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>Copy lines from WO #{record.record_number}</h3>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', color: '#6b7280' }}>X</button>
        </div>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setMode('new')}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                           backgroundColor: mode === 'new' ? '#1e3a5f' : '#fff', color: mode === 'new' ? '#fff' : '#374151' }}>
            New Work Order
          </button>
          <button onClick={() => setMode('existing')}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                           backgroundColor: mode === 'existing' ? '#1e3a5f' : '#fff', color: mode === 'existing' ? '#fff' : '#374151' }}>
            Existing Open WO
          </button>
        </div>

        {/* Existing WO picker */}
        {mode === 'existing' && (
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Target Work Order *</label>
            {selectedTarget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '6px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <strong>WO #{selectedTarget.record_number}</strong>
                  <span style={{ color: '#6b7280', marginLeft: '6px', fontSize: '0.75rem', textTransform: 'uppercase' }}>{selectedTarget.status}</span>
                  {selectedTarget.customer_last_name && (
                    <span style={{ marginLeft: '8px' }}>— {selectedTarget.customer_last_name}{selectedTarget.customer_first_name ? ', ' + selectedTarget.customer_first_name : ''}</span>
                  )}
                </span>
                <button onClick={() => setSelectedTarget(null)} style={{ padding: '3px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Change</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input value={woSearch} onChange={(e) => setWoSearch(e.target.value)} placeholder="Search by WO# or customer name..." style={inputStyle} autoFocus />
                {woResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '220px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {woResults.map(w => (
                      <div key={w.id} onClick={() => { setSelectedTarget(w); setWoSearch(''); setWoResults([]); }} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #f3f4f6' }}>
                        <strong>WO #{w.record_number}</strong>
                        <span style={{ color: '#6b7280', marginLeft: '6px', fontSize: '0.7rem', textTransform: 'uppercase' }}>{w.status}</span>
                        {w.customer_last_name && (
                          <span style={{ marginLeft: '8px' }}>{w.customer_last_name}{w.customer_first_name ? ', ' + w.customer_first_name : ''}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {woSearch.length >= 2 && woResults.length === 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' }}>No open work orders match. Paid, void, complete, and filed WOs are excluded.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Customer search (only in new mode) */}
        {mode === 'new' && (<>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Copy to Customer *</label>
          {selectedCustomer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ padding: '6px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.85rem' }}>
                <strong>{selectedCustomer.last_name}{selectedCustomer.first_name ? ', ' + selectedCustomer.first_name : ''}</strong>
                {selectedCustomer.company_name ? ` (${selectedCustomer.company_name})` : ''}
              </span>
              <button onClick={() => { setSelCustomer(null); setUnits([]); setUnitId(''); }} style={{ padding: '3px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Change</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input value={customerSearch} onChange={(e) => setCSearch(e.target.value)} placeholder="Search customer..." style={inputStyle} autoFocus />
              {customerResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  {customerResults.map(c => (
                    <div key={c.id} onClick={() => pickCustomer(c)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #f3f4f6' }}>
                      <strong>{c.last_name}{c.first_name ? ', ' + c.first_name : ''}</strong>
                      {c.company_name ? ` (${c.company_name})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Unit dropdown */}
        {selectedCustomer && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Unit *</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} style={inputStyle}>
              <option value="">— Select Unit —</option>
              {units.map(u => (
                <option key={u.id} value={String(u.id)}>
                  {[u.year, u.make, u.model].filter(Boolean).join(' ') || `Unit #${u.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
        </>)}

        {/* Labor lines */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Labor Lines ({selLabor.length}/{laborLines.length})</label>
            {laborLines.length > 0 && <button onClick={() => toggleAll(selLabor, setSelLabor, laborLines)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem' }}>{selLabor.length === laborLines.length ? 'Deselect All' : 'Select All'}</button>}
          </div>
          {laborLines.length === 0 ? <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>No labor lines on this work order</div> :
            laborLines.map(l => (
              <div key={l.id} style={lineStyle}>
                <input type="checkbox" checked={selLabor.includes(l.id)} onChange={() => toggleOne(l.id, selLabor, setSelLabor)} style={ckStyle} />
                <span style={{ color: '#6b7280', minWidth: '70px' }}>{l.technician_name || 'Unassigned'}</span>
                <span style={{ flex: 1, marginLeft: '6px' }}>{truncate(l.description, 60)}</span>
                <span style={{ color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '8px' }}>{parseFloat(l.hours).toFixed(1)} hrs @ {fmtCur(l.rate)}</span>
              </div>
            ))
          }
        </div>

        {/* Parts lines */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Parts Lines ({selParts.length}/{partsLines.length})</label>
            {partsLines.length > 0 && <button onClick={() => toggleAll(selParts, setSelParts, partsLines)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem' }}>{selParts.length === partsLines.length ? 'Deselect All' : 'Select All'}</button>}
          </div>
          {partsLines.length === 0 ? <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>No parts lines on this work order</div> :
            partsLines.map(l => (
              <div key={l.id} style={lineStyle}>
                <input type="checkbox" checked={selParts.includes(l.id)} onChange={() => toggleOne(l.id, selParts, setSelParts)} style={ckStyle} />
                <span style={{ color: '#6b7280', minWidth: '60px' }}>{l.part_number || '—'}</span>
                <span style={{ flex: 1, marginLeft: '6px' }}>{truncate(l.description, 60)}</span>
                <span style={{ color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '8px' }}>Qty {parseFloat(l.quantity)} @ {fmtCur(l.sale_price_each)}</span>
              </div>
            ))
          }
        </div>

        {/* Freight lines */}
        {freightLines.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Freight Lines ({selFreight.length}/{freightLines.length})</label>
              <button onClick={() => toggleAll(selFreight, setSelFreight, freightLines)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem' }}>{selFreight.length === freightLines.length ? 'Deselect All' : 'Select All'}</button>
            </div>
            {freightLines.map(l => (
              <div key={l.id} style={lineStyle}>
                <input type="checkbox" checked={selFreight.includes(l.id)} onChange={() => toggleOne(l.id, selFreight, setSelFreight)} style={ckStyle} />
                <span style={{ flex: 1 }}>{l.description}</span>
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>{fmtCur(l.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary + actions */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '4px' }}>
            <strong>{selLabor.length}</strong> labor, <strong>{selParts.length}</strong> parts{selFreight.length > 0 ? `, ${selFreight.length} freight` : ''} selected
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '12px', fontStyle: 'italic' }}>
            {mode === 'new'
              ? 'Status on the new WO will be set to Estimate. Payments and signatures are not copied.'
              : 'Lines will be appended to the target WO. The target WO\'s status, payments, and signatures are unchanged.'}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={btnSecondary}>Cancel</button>
            <button onClick={handleCopy}
                    disabled={saving || (mode === 'new' ? (!selectedCustomer || !unitId) : !selectedTarget)}
                    style={{ ...btnPrimary, opacity: (mode === 'new' ? (!selectedCustomer || !unitId) : !selectedTarget) ? 0.5 : 1 }}>
              {saving ? 'Copying...' : (mode === 'existing' ? 'Append to WO' : 'Create New WO')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({ record, onSuccess, onClose }) {
  const today = formatDate();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [apptType, setApptType] = useState('rv_service_drop_off');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState(`WO #${record.record_number} - ${record.last_name || ''}${record.first_name ? ', ' + record.first_name : ''}`);
  const [customerEmail, setCustomerEmail] = useState(record.email_primary || '');
  const [customerPhone, setCustomerPhone] = useState(record.phone_primary || '');
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.createAppointment({
        customer_id: record.customer_id,
        unit_id: record.unit_id,
        record_id: record.id,
        appointment_type: apptType,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: duration,
        dropoff_notes: notes,
        notify_customer: sendConfirmation,
        customer_email: sendConfirmation ? customerEmail : null,
        customer_phone: customerPhone || null,
      });
      alert('Appointment created!' + (sendConfirmation && customerEmail ? ' Confirmation email sent.' : ''));
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Add to Schedule</h3>
        {error && <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '0.875rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={apptType} onChange={(e) => setApptType(e.target.value)} style={inputStyle}>
                <option value="storage_pickup">Storage Pickup</option>
                <option value="storage_drop_off">Storage Drop Off</option>
                <option value="rv_service_pickup">RV Service Pickup</option>
                <option value="rv_service_drop_off">RV Service Drop Off</option>
                <option value="rv_diagnostics">RV Diagnostics</option>
                <option value="rv_estimate_build">RV Estimate Build</option>
                <option value="rv_repair">RV Repair</option>
                <option value="parts">Parts</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Customer Email</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@email.com" style={inputStyle} autoComplete="off" />
            </div>
            <div>
              <label style={labelStyle}>Customer Phone</label>
              <input type="text" value={handlePhoneInput(customerPhone)} onChange={(e) => setCustomerPhone(handlePhoneInput(e.target.value))} placeholder="(303) 555-0000" style={inputStyle} autoComplete="off" />
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={sendConfirmation} onChange={(e) => setSendConfirmation(e.target.checked)} />
              Send appointment confirmation to customer
            </label>
            {sendConfirmation && !customerEmail && (
              <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px' }}>No email address — confirmation will not be sent</div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={btnPrimary}>
            {saving ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManualPaymentModal({ method, amountDue, recordId, onSuccess, onClose }) {
  const [amount, setAmount] = useState(amountDue > 0 ? amountDue.toFixed(2) : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(formatDate());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const methodLabel = { check: 'Check', cash: 'Cash', zelle: 'Zelle' }[method];

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      await api.addPayment(recordId, {
        payment_type: 'final_payment',
        payment_method: method,
        amount: parsedAmount,
        payment_date: paymentDate,
        check_number: reference || null,
        notes: notes || `${methodLabel} payment${reference ? ' ref: ' + reference : ''}`,
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Pay by {methodLabel}</h3>

        {error && <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '0.875rem' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Amount</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{method === 'check' ? 'Check Number' : 'Reference #'} (optional)</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} style={inputStyle} placeholder={method === 'check' ? 'Check #' : 'Confirmation / reference'} />
          </div>
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Payment Date</label>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSubmit} disabled={processing} style={btnPrimary}>
            {processing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Switch ──────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
        backgroundColor: checked ? '#3b82f6' : '#d1d5db',
        position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Field({ label, value }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ fontSize: '0.875rem' }}>{value || '—'}</div>
    </div>
  );
}

function AutoSaveTextarea({ value, field, recordId, onSaved }) {
  const [text, setText] = React.useState(value);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => { setText(value); }, [value]);

  const handleBlur = async () => {
    if (text === value) return;
    setSaving(true);
    try {
      await api.updateRecord(recordId, { [field]: text });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
      />
      {saving && <span style={{ position: 'absolute', top: '4px', right: '8px', fontSize: '0.7rem', color: '#6b7280' }}>Saving...</span>}
      {saved && <span style={{ position: 'absolute', top: '4px', right: '8px', fontSize: '0.7rem', color: '#059669' }}>Saved</span>}
    </div>
  );
}

function AutoSaveBulletTextarea({ value, recordId, onSaved }) {
  const [text, setText] = React.useState(value);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { setText(value); }, [value]);
  // Auto-grow: any time the text changes, resize the textarea to fit content
  // so a 10-line job description shows all 10 lines instead of scrolling.
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = (ref.current.scrollHeight + 2) + 'px';
    }
  }, [text]);

  const toBullets = (t) => {
    if (!t) return '';
    return t.split('\n').map(line => line.startsWith('\u2022 ') ? line : '\u2022 ' + line).join('\n');
  };
  const fromBullets = (t) => t.split('\n').map(line => line.replace(/^\u2022 ?/, '')).join('\n');

  const handleChange = (e) => {
    const raw = e.target.value;
    const fixed = raw.split('\n').map(line => {
      if (line.startsWith('\u2022 ')) return line;
      if (line.startsWith('\u2022')) return '\u2022 ' + line.slice(1);
      return '\u2022 ' + line;
    }).join('\n');
    setText(fromBullets(fixed));
  };

  const handleKeyDown = (e) => {
    const ta = ref.current;
    if (!ta) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const pos = ta.selectionStart;
      const val = ta.value;
      const newVal = val.slice(0, pos) + '\n\u2022 ' + val.slice(pos);
      setText(fromBullets(newVal));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = pos + 3; }, 0);
    }
    if (e.key === 'Backspace') {
      const pos = ta.selectionStart;
      const val = ta.value;
      const lines = val.slice(0, pos).split('\n');
      const currentLine = lines[lines.length - 1];
      if (currentLine === '\u2022 ' && lines.length > 1) {
        e.preventDefault();
        const afterCursor = val.slice(pos);
        lines.pop();
        const newVal = lines.join('\n') + afterCursor;
        setText(fromBullets(newVal));
        setTimeout(() => { const np = lines.join('\n').length; ta.selectionStart = ta.selectionEnd = np; }, 0);
      }
    }
  };

  const handleBlur = async () => {
    if (text === value) return;
    setSaving(true);
    try {
      await api.updateRecord(recordId, { job_description: text });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Save job description error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={ref}
        value={toBullets(text) || '\u2022 '}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={(e) => { if (!e.target.value || e.target.value === '\u2022 ') setText(''); }}
        placeholder="\u2022 Describe the work needed..."
        style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', backgroundColor: '#fefce8', border: '1px solid #e5e7eb' }}
      />
      {saving && <span style={{ position: 'absolute', top: '4px', right: '8px', fontSize: '0.7rem', color: '#6b7280' }}>Saving...</span>}
      {saved && <span style={{ position: 'absolute', top: '4px', right: '8px', fontSize: '0.7rem', color: '#059669' }}>Saved</span>}
    </div>
  );
}

function FieldFull({ label, value }) {
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ fontSize: '0.875rem' }}>{value || '—'}</div>
    </div>
  );
}

// Always-editable field. Renders an input when `editable`; otherwise read-only
// text. Edits are kept in local draft state and auto-saved on blur via the
// `autoSave(field, value)` handler. `onFocus`/`onBlur` let the parent pause its
// polling refetch for the focused field so typing is never wiped mid-edit.
function EditableField({ label, field, value, editable, autoSave, onFocus, onBlur, type = 'text' }) {
  const isPhone = field && (field.includes('phone') && !field.includes('email'));
  const [draft, setDraft] = React.useState(value ?? '');
  const [dirty, setDirty] = React.useState(false);

  // Sync external value into the draft when not actively editing this field.
  React.useEffect(() => {
    if (!dirty) setDraft(value ?? '');
  }, [value, dirty]);

  if (!editable) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ fontSize: '0.875rem' }}>{isPhone ? (formatPhone(value) || '—') : (value || '—')}</div>
      </div>
    );
  }

  const handleChange = (e) => {
    setDirty(true);
    if (isPhone) {
      setDraft(handlePhoneInput(e.target.value));
    } else {
      setDraft(e.target.value);
    }
  };

  const handleBlur = async () => {
    let out;
    if (isPhone) {
      out = draft;
    } else if (type === 'number') {
      out = draft === '' || draft === null ? null : Number(draft);
    } else {
      out = draft;
    }
    setDirty(false);
    try {
      await autoSave(field, out);
    } finally {
      if (onBlur) onBlur(field);
    }
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={isPhone ? handlePhoneInput((draft ?? '').toString().replace(/\D/g, '')) : (draft ?? '')}
        onChange={handleChange}
        onFocus={() => { if (onFocus) onFocus(field); }}
        onBlur={handleBlur}
        style={inputStyle}
      />
    </div>
  );
}

function DepositField({ value, editable, onSave }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const amount = parseFloat(value) || 0;
  const startEdit = () => { setDraft(amount > 0 ? amount.toFixed(2) : ''); setEditing(true); };
  const save = async () => { const val = parseFloat(draft) || 0; setEditing(false); if (val !== amount) await onSave(val); };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.875rem' }}>
      <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
        Deposit
        <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#9ca3af' }}>(not a payment — informational only)</span>
      </span>
      {editing ? (
        <input type="number" min="0" step="0.01" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} autoFocus style={{ width: '100px', padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', textAlign: 'right' }} />
      ) : (
        <span onClick={editable ? startEdit : undefined} style={{ cursor: editable ? 'pointer' : 'default', color: amount > 0 ? '#111827' : '#d1d5db' }} title={editable ? 'Click to edit' : undefined}>
          {amount > 0 ? '$' + amount.toFixed(2) : '$0.00'}
        </span>
      )}
    </div>
  );
}

function TotalRow({ label, value, bold, color, indent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: indent ? '0.8rem' : '0.875rem', paddingLeft: indent ? '24px' : 0 }}>
      <span style={{ color: indent ? '#9ca3af' : '#6b7280' }}>{indent ? `\u2014 ${label}` : label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, color: color || '#111827' }}>{value}</span>
    </div>
  );
}

function DiscountRow({ record, isEditable, formatCurrency, onSaved }) {
  const [desc, setDesc] = React.useState(record.discount_description || '');
  const [amt, setAmt] = React.useState(record.discount_amount || '');

  // Sync from parent when record refreshes
  React.useEffect(() => {
    setDesc(record.discount_description || '');
    setAmt(record.discount_amount || '');
  }, [record.discount_description, record.discount_amount]);

  const saveDesc = () => {
    if (desc !== (record.discount_description || '')) {
      api.updateRecord(record.id, { discount_description: desc }).then(() => onSaved()).catch(() => {});
    }
  };
  const saveAmt = () => {
    const val = parseFloat(amt) || 0;
    if (val !== (parseFloat(record.discount_amount) || 0)) {
      api.updateRecord(record.id, { discount_amount: val }).then(() => onSaved()).catch(() => {});
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.875rem', borderTop: '1px dashed #d1d5db', marginTop: '4px' }}>
      <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
        Discount
        {isEditable ? (
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={saveDesc}
            placeholder="Reason" style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '0.8rem', width: '160px', marginLeft: '4px' }} autoComplete="off" />
        ) : desc ? (
          <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>({desc})</span>
        ) : null}
      </span>
      <span style={{ color: '#dc2626' }}>
        {isEditable ? (
          <input type="number" step="0.01" min="0" value={amt} onChange={(e) => setAmt(e.target.value)} onBlur={saveAmt}
            placeholder="0.00" style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '0.875rem', width: '90px', textAlign: 'right' }} autoComplete="off" />
        ) : (
          `-${formatCurrency(record.discount_amount)}`
        )}
      </span>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const sectionStyle = {
  marginBottom: '24px', padding: '20px', backgroundColor: '#fff',
  borderRadius: '8px', border: '1px solid #e5e7eb',
};
const sectionTitle = {
  fontSize: '1rem', fontWeight: 700, color: '#1e3a5f',
  marginTop: 0, marginBottom: '16px', paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb',
};
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' };
const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
const thStyle = { textAlign: 'left', padding: '8px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' };
const btnPrimary = { padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnDanger = { padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSquare = { padding: '8px 16px', backgroundColor: '#006aff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnPayMethod = { padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnQbSync = { padding: '8px 16px', backgroundColor: '#2ca01c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnSignoff = { padding: '10px 20px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' };
const btnPrint = { padding: '8px 16px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnSchedule = { padding: '8px 16px', backgroundColor: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnEditYellow = { padding: '8px 16px', backgroundColor: '#FFD700', color: '#000', border: '1px solid #ccaa00', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' };
const btnLink = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: 0 };
const btnFile = { padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  width: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

function PaymentLinkModal({ recordId, record, onClose }) {
  const suggestedParts = parseFloat(record?.parts_subtotal || 0) || 0;
  const suggestedFinal = parseFloat(record?.amount_due || 0) || 0;
  const [paymentType, setPaymentType] = useState('parts_deposit');
  const [amount, setAmount] = useState(suggestedParts > 0 ? suggestedParts.toFixed(2) : '');
  const [email, setEmail] = useState(record?.email_primary || '');
  const [link, setLink] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTypeChange = (t) => {
    setPaymentType(t);
    if (t === 'parts_deposit' && suggestedParts > 0) setAmount(suggestedParts.toFixed(2));
    if (t === 'final_payment' && suggestedFinal > 0) setAmount(suggestedFinal.toFixed(2));
  };

  const handleGenerate = async () => {
    setError('');
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { setError('Enter a valid amount'); return; }
    setCreating(true);
    try {
      const result = await api.createOnlinePaymentLink({
        record_id: recordId,
        amount_dollars: parsed,
        payment_type: paymentType,
        customer_email: email || null,
      });
      setLink(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!link?.url) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, width: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>Send Payment Link</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
        </div>

        {!link ? (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Payment Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <TypeOption active={paymentType === 'parts_deposit'} onClick={() => handleTypeChange('parts_deposit')} title="Parts Deposit" desc="Customer not yet in. WO status unchanged." />
                <TypeOption active={paymentType === 'final_payment'} onClick={() => handleTypeChange('final_payment')} title="Final Payment" desc="Work complete. Moves WO to Paid." />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Amount (USD)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#6b7280' }}>$</span>
                <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                {paymentType === 'parts_deposit' && suggestedParts > 0 && `Suggested: $${suggestedParts.toFixed(2)} (parts subtotal)`}
                {paymentType === 'final_payment' && suggestedFinal > 0 && `Suggested: $${suggestedFinal.toFixed(2)} (amount due)`}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Customer Email (optional — for pre-filled receipt)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>

            {error && <div style={{ padding: 8, background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleGenerate} disabled={creating}
                style={{ padding: '8px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                {creating ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#374151' }}>
              Share this link with the customer. It stays active until paid.
            </p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: 12 }}>
              <input readOnly value={link.url}
                onFocus={(e) => e.target.select()}
                style={{ flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'monospace' }} />
              <button onClick={handleCopy}
                style={{ padding: '8px 12px', background: copied ? '#10b981' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, fontSize: '0.8rem', color: '#374151' }}>
              <div>Type: {link.payment_type === 'parts_deposit' ? 'Parts Deposit' : 'Final Payment'}</div>
              <div>Amount: ${(parseInt(link.amount_cents) / 100).toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={onClose} style={{ padding: '8px 14px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OnlinePaymentLinksSection({ recordId, refreshKey }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [pushingId, setPushingId] = useState(null);
  const [sentMsg, setSentMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getOnlinePaymentLinks(recordId);
      setLinks(data);
      setError('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [recordId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  // Auto-poll Poynt every 5s for any links that were pushed to the terminal
  // and are waiting for the customer to tap their card. Stops polling as soon
  // as nothing is in terminal_pending state anymore.
  useEffect(() => {
    const waiting = (links || []).filter(l => l.status === 'terminal_pending');
    if (waiting.length === 0) return undefined;
    const t = setInterval(async () => {
      let anyChange = false;
      for (const l of waiting) {
        try {
          const r = await api.getTerminalPaymentStatus(l.id);
          if (r.settled) anyChange = true;
        } catch { /* keep polling */ }
      }
      if (anyChange) load();
    }, 5000);
    return () => clearInterval(t);
  }, [links, load]);

  if (loading) return null;
  if (!links || links.length === 0) return null;

  const pending = links.filter(l => l.status === 'pending' || l.status === 'terminal_pending');
  if (pending.length === 0 && !links.some(l => l.status === 'paid')) return null;

  const handleResend = async (id) => {
    setSendingId(id);
    setError('');
    setSentMsg('');
    try {
      const r = await api.sendOnlinePaymentLinkReminder(id);
      setSentMsg(`Reminder sent to ${r.sentTo}`);
      setTimeout(() => setSentMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingId(null);
    }
  };

  const handlePushTerminal = async (id) => {
    setPushingId(id);
    setError('');
    setSentMsg('');
    try {
      await api.pushPaymentToTerminal(id);
      setSentMsg('Sent to terminal — have the customer tap their card.');
      setTimeout(() => setSentMsg(''), 6000);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPushingId(null);
    }
  };

  const handleRemoveLink = async (id, isPaid) => {
    const msg = isPaid
      ? 'Remove this paid link from the list? The actual payment in your Payment Ledger is NOT affected — this only clears the link row.'
      : 'Remove this payment link?';
    if (!window.confirm(msg)) return;
    setError('');
    try {
      await api.cancelOnlinePaymentLink(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = async (token) => {
    const base = window.location.origin;
    try { await navigator.clipboard.writeText(`${base}/pay/${token}`); } catch {}
  };

  const typeLabel = (t) => t === 'parts_deposit' ? 'Parts Deposit' : 'Final Payment';

  return (
    <div style={{ margin: '12px 0', padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Online Payment Links</h3>
        {sentMsg && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>{sentMsg}</span>}
        {error && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</span>}
      </div>
      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#6b7280', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '4px 8px' }}>Created</th>
            <th style={{ padding: '4px 8px' }}>Type</th>
            <th style={{ padding: '4px 8px', textAlign: 'right' }}>Amount</th>
            <th style={{ padding: '4px 8px' }}>Status</th>
            <th style={{ padding: '4px 8px' }}>Paid</th>
            <th style={{ padding: '4px 8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => {
            const isPending = l.status === 'pending';
            const isTerminalPending = l.status === 'terminal_pending';
            const statusStyle = l.status === 'paid' ? { bg: '#d1fae5', c: '#065f46' }
              : l.status === 'failed' ? { bg: '#fee2e2', c: '#991b1b' }
              : isTerminalPending ? { bg: '#dbeafe', c: '#1e40af' }
              : { bg: '#fef3c7', c: '#92400e' };
            const statusLabel = isTerminalPending ? 'Waiting on terminal' : l.status;
            return (
              <tr key={l.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 8px', color: '#374151' }}>{formatDate(l.created_at)}</td>
                <td style={{ padding: '6px 8px' }}>{typeLabel(l.payment_type)}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 500 }}>${(parseInt(l.amount_cents) / 100).toFixed(2)}</td>
                <td style={{ padding: '6px 8px' }}>
                  <span style={{ background: statusStyle.bg, color: statusStyle.c, padding: '2px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {statusLabel}
                  </span>
                </td>
                <td style={{ padding: '6px 8px', color: '#374151' }}>
                  {l.paid_at ? formatDate(l.paid_at) : '—'}
                </td>
                <td style={{ padding: '6px 8px' }}>
                  {isPending && (
                    <>
                      <button onClick={() => handleCopy(l.payment_token)}
                        style={{ marginRight: 6, padding: '3px 10px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
                        Copy Link
                      </button>
                      <button onClick={() => handleResend(l.id)} disabled={sendingId === l.id}
                        style={{ marginRight: 6, padding: '3px 10px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        {sendingId === l.id ? 'Sending...' : 'Send Reminder'}
                      </button>
                      <button onClick={() => handlePushTerminal(l.id)} disabled={pushingId === l.id}
                        style={{ padding: '3px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        {pushingId === l.id ? 'Pushing...' : 'Charge Terminal'}
                      </button>
                    </>
                  )}
                  {isTerminalPending && (
                    <span style={{ fontSize: '0.7rem', color: '#1e40af' }}>Sent to terminal — waiting for tap...</span>
                  )}
                  {l.status === 'paid' && l.transaction_id && (
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b7280', marginRight: 8 }}>Txn: {l.transaction_id}</span>
                  )}
                  {l.status !== 'cancelled' && (
                    <button onClick={() => handleRemoveLink(l.id, l.status === 'paid')}
                      style={{ padding: '3px 8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
                      title={l.status === 'paid' ? 'Remove this link from the list (does not affect the actual payment)' : 'Cancel this payment link'}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TypeOption({ active, onClick, title, desc }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
      border: active ? '2px solid #059669' : '1px solid #d1d5db',
      background: active ? '#ecfdf5' : '#fff', borderRadius: 6,
    }}>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: active ? '#065f46' : '#111827' }}>{title}</div>
      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 2 }}>{desc}</div>
    </button>
  );
}
