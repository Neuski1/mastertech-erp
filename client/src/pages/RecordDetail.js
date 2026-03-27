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
import BulletTextarea, { BulletDisplay } from '../components/BulletTextarea';

const NEXT_STATUS = {
  estimate: 'approved',
  approved: 'in_progress',
  schedule_customer: 'in_progress',
  scheduled: 'in_progress',
  in_progress: 'complete',
  awaiting_parts: 'in_progress',
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
  awaiting_approval: 'Resume Work',
};

const ALL_STATUSES = [
  { value: 'estimate', label: 'Estimate' },
  { value: 'approved', label: 'Not Started' },
  { value: 'schedule_customer', label: 'Schedule Customer' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_parts', label: 'Awaiting Parts' },
  { value: 'awaiting_approval', label: 'Awaiting Approval' },
  { value: 'complete', label: 'Complete' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'on_hold', label: 'On Hold' },
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
  const { canSeeFinancials, canEditRecords, canPostPayments, isAdmin, isBookkeeper, user } = useAuth();
  const [record, setRecord] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [qbSyncing, setQbSyncing] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [manualPayModal, setManualPayModal] = useState(null); // 'check' | 'cash' | 'zelle' | null
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);

  // Section-level inline editing
  const [editingDates, setEditingDates] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [sectionForm, setSectionForm] = useState({});
  const [sectionSaving, setSectionSaving] = useState(false);

  const startSectionEdit = (section) => {
    setSectionForm({ ...record });
    if (section === 'dates') setEditingDates(true);
    if (section === 'insurance') setEditingInsurance(true);
  };

  const cancelSectionEdit = (section) => {
    if (section === 'dates') setEditingDates(false);
    if (section === 'insurance') setEditingInsurance(false);
  };

  const handleSectionSave = async (section, fields) => {
    setSectionSaving(true);
    try {
      const updates = {};
      fields.forEach(f => {
        if (sectionForm[f] !== record[f]) updates[f] = sectionForm[f] ?? null;
      });
      if (Object.keys(updates).length > 0) {
        await api.updateRecord(id, updates);
      }
      if (section === 'dates') setEditingDates(false);
      if (section === 'insurance') setEditingInsurance(false);
      await fetchRecord();
    } catch (err) {
      setError(err.message);
    } finally {
      setSectionSaving(false);
    }
  };

  const handleSectionField = (field, value) => {
    setSectionForm(prev => ({ ...prev, [field]: value }));
  };

  // Ref to track editing state inside fetchRecord without adding it as dependency
  const editingRef = useRef(false);
  editingRef.current = editing;

  const fetchRecord = useCallback(async () => {
    try {
      const data = await api.getRecord(id);
      setRecord(data);
      // Only overwrite form data when NOT in edit mode
      if (!editingRef.current) {
        setFormData(data);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  // Reset editing when navigating to a different record
  useEffect(() => {
    setEditing(false);
  }, [id]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Record fields
      const recordFields = [
        'key_number', 'job_description', 'mileage_at_intake',
        'intake_date', 'start_date', 'expected_completion_date', 'actual_completion_date',
        'is_insurance_job', 'insurance_company', 'insurance_contact_name',
        'insurance_phone', 'insurance_email', 'claim_number', 'policy_number',
        'estimate_valid_until', 'internal_notes', 'customer_notes',
        'under_warranty_amount', 'no_charge_amount', 'discount_amount', 'discount_description', 'deductible_amount',
        'deposit_amount', 'cc_fee_applied', 'shop_supplies_exempt', 'tax_waived',
      ];
      const recordUpdates = {};
      recordFields.forEach(f => {
        if (formData[f] !== record[f]) recordUpdates[f] = formData[f];
      });
      if (Object.keys(recordUpdates).length > 0) {
        const result = await api.updateRecord(id, recordUpdates);
        if (result.labor_lines_created > 0) {
          setSuccessMsg(`${result.labor_lines_created} labor line${result.labor_lines_created > 1 ? 's' : ''} created from job description`);
          setTimeout(() => setSuccessMsg(''), 5000);
        }
      }

      // Unit fields
      const unitFields = ['year', 'make', 'model', 'vin', 'license_plate'];
      const unitUpdates = {};
      unitFields.forEach(f => {
        if (formData[f] !== record[f]) unitUpdates[f] = formData[f];
      });
      if (Object.keys(unitUpdates).length > 0 && record.unit_id) {
        await api.updateUnit(record.unit_id, unitUpdates);
      }

      // Customer fields
      const custFields = ['company_name', 'phone_primary', 'email_primary',
        'address_street', 'address_city', 'address_state', 'address_zip'];
      const custUpdates = {};
      custFields.forEach(f => {
        if (formData[f] !== record[f]) custUpdates[f] = formData[f];
      });
      if (Object.keys(custUpdates).length > 0 && record.customer_id) {
        await api.updateCustomer(record.customer_id, custUpdates);
      }

      setEditing(false);
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
      const missing = record.labor_lines.filter(l => !l.hours || parseFloat(l.hours) === 0);
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

  const handleSignEstimate = async (signatureData) => {
    try {
      const result = await api.signEstimate(id, signatureData);
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
      const missing = record.labor_lines.filter(l => !l.hours || parseFloat(l.hours) === 0);
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

  const handleEmailDocument = async () => {
    const email = record.email_primary;
    if (!email) { alert('No email address on file for this customer.'); return; }
    if (!window.confirm(`Email this document to ${email}?`)) return;
    setEmailing(true);
    setEmailMsg(null);
    try {
      const result = await api.emailDocument(record.id);
      setEmailMsg({ type: 'success', text: `${result.docType} emailed to ${result.sentTo}` });
      setTimeout(() => setEmailMsg(null), 6000);
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message });
      setTimeout(() => setEmailMsg(null), 6000);
    } finally {
      setEmailing(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }

    const r = record;
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

    // Build labor rows
    const laborLines = r.labor_lines || [];
    const totalHours = laborLines.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    const laborRows = laborLines.map((l, i) =>
      `<tr><td>${i+1}</td><td>L</td><td>${l.description || ''}</td><td style="text-align:right">${parseFloat(l.hours || 0).toFixed(2)}</td><td style="text-align:right">${fmtCur(l.rate)}</td><td style="text-align:right">${fmtCur(l.line_total)}</td></tr>`
    ).join('');
    const laborTotalRow = laborLines.length > 0 ? `
      <tr style="background:#f3f4f6"><td colspan="3" style="text-align:right;font-weight:bold;padding:6px 8px;border-top:2px solid #d1d5db">TOTAL HOURS:</td><td style="text-align:right;font-weight:bold;padding:6px 8px;border-top:2px solid #d1d5db">${totalHours.toFixed(2)} hrs</td><td></td><td></td></tr>
    ` : '';

    // Build parts rows
    const partsRows = (r.parts_lines || []).map(p =>
      `<tr><td>P</td><td>${p.part_number ? p.part_number + ' — ' : ''}${p.description || ''}</td><td style="text-align:right">${parseFloat(p.quantity || 0)}</td><td style="text-align:right">${fmtCur(p.sale_price_each)}</td><td style="text-align:right">${fmtCur(p.line_total)}</td></tr>`
    ).join('');

    // Build freight rows
    const freightRows = (r.freight_lines || []).map(f =>
      `<tr><td>S</td><td>${f.description || ''}</td><td style="text-align:right">1</td><td style="text-align:right">${fmtCur(f.amount)}</td><td style="text-align:right">${fmtCur(f.amount)}</td></tr>`
    ).join('');

    const underWarranty = parseFloat(r.under_warranty_amount) || 0;
    const noCharge = parseFloat(r.no_charge_amount) || 0;
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

      // Deposit row first if applicable
      if (deposit > 0) {
        const depositDate = r.intake_date
          ? fmtPrintDateShort(r.intake_date.includes('T') ? r.intake_date : r.intake_date + 'T12:00:00')
          : (r.created_at ? fmtPrintDateShort(r.created_at) : '\u2014');
        payRows += `<tr><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px">${depositDate}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px">Deposit</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px">\u2014</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;font-size:11px;text-align:right">${fmtCur(deposit)}</td></tr>`;
        totalCollectedInTable += deposit;
      }

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
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 3px solid #1a2a4a; padding-bottom: 12px; }
  .header-left { display: flex; align-items: flex-start; gap: 12px; }
  .header-left img { height: 120px; max-width: 280px; object-fit: contain; }
  .header-left h1 { color: #1a2a4a; margin: 0; font-size: 16px; font-weight: bold; }
  .header-left p { margin: 2px 0; font-size: 10px; color: #333; }
  .header-right { text-align: right; }
  .header-right h2 { color: #fff !important; background: ${docColor} !important; margin: 0; font-size: 18px; font-weight: bold; padding: 6px 14px; border-radius: 4px; display: inline-block; }
  .header-right p { color: #333; font-size: 10px; margin: 3px 0; }
  .info-block { display: flex; gap: 20px; margin-bottom: 16px; padding: 10px; background: #f9fafb !important; border: 1px solid #ccc; border-radius: 4px; }
  .info-block div { flex: 1; }
  .info-block label { font-weight: bold; font-size: 9px; text-transform: uppercase; color: #1a2a4a; display: block; }
  .info-block span { font-size: 11px; color: #111; }
  table.lines { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  table.lines th { background: #1a2a4a !important; color: #fff !important; padding: 6px 8px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1a2a4a; letter-spacing: 0.02em; }
  table.lines td { padding: 4px 8px; border-bottom: 1px solid #ddd; font-size: 11px; color: #111; }
  .totals-block { margin-top: 16px; display: flex; justify-content: flex-end; }
  .auth-section { margin-top: 20px; }
  .auth-text { font-size: 9px; color: #333; line-height: 1.5; }
  .totals { width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; color: #000; }
  .totals .row.bold { font-weight: bold; font-size: 12px; color: #1a2a4a !important; }
  .totals .row.divider { border-top: 2px solid #1a2a4a !important; margin-top: 4px; padding-top: 4px; }
</style></head><body>
<div class="header">
  <div class="header-left">
    <img src="${window.location.origin}/master-rvtech-logo-dark.jpg" alt="Master Tech RV" style="height:120px;max-width:280px;object-fit:contain" />
    <div>
    <h1>MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p>6590 EAST 49TH AVENUE</p>
    <p>COMMERCE CITY CO 80022</p>
    <p>(303) 557-2214</p>
    <p>https://mastertechrvrepair.com/</p>
    <p>service@mastertechrvrepair.com</p>
    <br/>
    <p><em>Our Service Makes Happy Campers!</em></p>
    </div>
  </div>
  <div class="header-right">
    <h2>${docTitle} #${r.record_number}</h2>
    <p>Original Date: ${intakeDate}</p>
    ${r.start_date ? `<p>Start Date: ${fmtPrintDateShort(r.start_date.includes('T') ? r.start_date : r.start_date + 'T12:00:00')}</p>` : ''}
    ${r.status === 'paid'
      ? (r.actual_completion_date ? `<p>Completed Date: ${fmtPrintDateShort(r.actual_completion_date.includes('T') ? r.actual_completion_date : r.actual_completion_date + 'T12:00:00')}</p>` : '')
      : (r.expected_completion_date ? `<p>Due Date: ${fmtPrintDateShort(r.expected_completion_date.includes('T') ? r.expected_completion_date : r.expected_completion_date + 'T12:00:00')}</p>` : '')
    }
    ${r.status !== 'estimate' && r.status !== 'paid' && r.actual_completion_date ? `<p>Completed Date: ${fmtPrintDateShort(r.actual_completion_date.includes('T') ? r.actual_completion_date : r.actual_completion_date + 'T12:00:00')}</p>` : ''}
    <p>Time: ${timePrinted}</p>
  </div>
</div>

<div class="info-block">
  <div>
    <label>Customer</label>
    <span>${r.company_name ? r.company_name + ' (' + (r.account_number || '') + ')' : ''}</span><br/>
    <span>${customerName}</span><br/>
    <span>${address || '—'}</span><br/>
    <span>${r.email_primary || ''}</span><br/>
    <span>${formatPhone(r.phone_primary) || ''}</span>
  </div>
  <div>
    <label>Unit</label>
    <span>${[r.year, r.make, r.model].filter(Boolean).join(' ') || '—'}</span><br/>
    <label>License Plate</label><span>${r.license_plate || '—'}</span><br/>
    <label>VIN</label><span>${r.vin || '—'}</span><br/>
    <label>Key #</label><span>${r.key_number || '—'}</span>
  </div>
</div>
${r.insurance_company ? `<div class="info-block"><div><label>Insurance</label><span>${r.insurance_company}</span>${r.claim_number ? ' &nbsp; <label style="display:inline">Claim #</label> <span>' + r.claim_number + '</span>' : ''}</div></div>` : ''}

${r.job_description ? `<div style="margin:8px 0"><strong style="font-size:12px;text-transform:uppercase;color:#1a2a4a;border-bottom:1px solid #1a2a4a;display:inline-block;padding-bottom:2px">Job Description:</strong><p style="margin:4px 0 0;font-size:11px;white-space:pre-wrap">${r.job_description}</p></div>` : ''}
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

<div class="totals-block">
  <div class="totals">
    <div class="row"><span>SUBTOTAL — PARTS</span><span>${fmtCur(r.parts_subtotal)}</span></div>
    ${freightSub > 0 ? `<div class="row"><span>SUBTOTAL — FREIGHT/MISC</span><span>${fmtCur(freightSub)}</span></div>` : ''}
    <div class="row" style="padding-left:20px;font-size:9px;color:#333"><span>&rarr; Shop Supplies (5%)</span><span>${r.shop_supplies_exempt ? 'WAIVED' : fmtCur(r.shop_supplies_amount)}</span></div>
    <div class="row" style="padding-left:20px;font-size:9px;color:#333"><span>&rarr; CC Fee (3%)</span><span>${r.cc_fee_applied ? fmtCur(r.cc_fee_amount) : 'N/A'}</span></div>
    <div class="row" style="padding-left:20px;font-size:9px;color:#333"><span>&rarr; SUBTOTAL — OTHERS</span><span>${fmtCur(r.subtotal_others)}</span></div>
    ${underWarranty > 0 ? `<div class="row"><span>UNDER WARRANTY</span><span>(${fmtCur(underWarranty)})</span></div>` : ''}
    ${noCharge > 0 ? `<div class="row"><span>NOT COVERED</span><span>(${fmtCur(noCharge)})</span></div>` : ''}
    ${(parseFloat(r.discount_amount) || 0) > 0 ? `<div class="row"><span>DISCOUNT${r.discount_description ? ' — ' + r.discount_description : ''}</span><span>-${fmtCur(r.discount_amount)}</span></div>` : ''}
    <div class="row"><span>TOTAL TAX (Parts + Supplies)</span><span>${r.tax_waived ? 'WAIVED' : fmtCur(r.tax_amount)}</span></div>
    <div class="row bold divider"><span>TOTAL SALES</span><span>${fmtCur(r.total_sales)}</span></div>
    <div class="row"><span>TOTAL COLLECTED</span><span>${fmtCur((parseFloat(r.total_collected) || 0) + deposit)}</span></div>
    <div class="row bold divider" style="color:${(parseFloat(r.amount_due) || 0) > 0 ? '#dc2626' : '#111'}"><span>AMOUNT DUE</span><span>${fmtCur(r.amount_due)}</span></div>
  </div>
</div>

${paymentDetailHtml}

<div class="auth-section">
  <div class="auth-text">
    ${r.status === 'estimate' ? `
    <p style="font-size:12px;font-weight:bold;color:#1a2a4a;margin:0 0 8px">Authorization Agreement:</p>
    <p>By signing below, I authorize Master Tech RV Repair &amp; Storage to perform the services and repairs described in this estimate on my RV/unit. I understand that the final charges may vary from this estimate due to unforeseen conditions discovered during the repair process. Any additional work or costs beyond this estimate will be communicated to me for approval before proceeding.</p>
    <p>I agree to pay the full balance for all authorized services upon completion of work.</p>
    <p>I understand that Master Tech RV Repair &amp; Storage takes reasonable care of all units in our possession; however, we are not responsible for loss or damage to the RV or personal belongings left inside in the event of fire, theft, weather events, or other circumstances beyond our control. We recommend removing valuables prior to drop-off.</p>
    <p>I grant Master Tech RV Repair &amp; Storage permission to operate my RV/unit as needed for testing, inspection, and the safe movement of the vehicle within our facility.</p>
    ` : `
    <p>I hereby authorize Master Tech RV Repair &amp; Storage to operate and store the above vehicle for the purpose of testing, inspection, repair and delivery, at my own risk. I understand that Master Tech RV Repair and Storage is not responsible for loss or damage equipment or articles left on or in vehicles in case of fire, theft, or any cause beyond their control. I understand that if I wish to retain worn and damaged parts, that request will be made at the time of authorization or repairs.</p>
    <p>I understand that TWO (2) days after notice of completion of services rendered, that an OUTDOOR storage charge of $25 per day will be charged unless otherwise agreed to in writing.</p>
    <p>WARRANTY - 60 days on parts and labor unless otherwise stated from parts manufacturer. If customer provides parts, warranty is only on labor.</p>
    <p>If paying by credit card, a 3% courtesy fee will be added to the final bill.</p>
    `}
    ${r.authorization_signature ? `
      <div style="margin-top:24px">
        <div style="font-size:12px;font-weight:bold;margin-bottom:4px">Signature:</div>
        <img src="${r.authorization_signature}" style="height:60px; display:block; margin-bottom:8px" />
        <div style="font-size:11px;font-weight:bold">${(r.first_name || '') + ' ' + (r.last_name || '')}</div>
        <div style="margin-top:20px">
          <span style="font-size:12px;font-weight:bold">Date:</span>
          <span style="font-size:12px;font-weight:bold;margin-left:8px">${r.authorization_signed_at ? fmtPrintDateShort(r.authorization_signed_at) : '\u2014'}</span>
        </div>
      </div>
    ` : `
      <div style="margin-top:24px">
        <div style="margin-bottom:6px"><span style="font-size:12px;font-weight:bold">Signature:</span></div>
        <div style="border-bottom:2px solid #333;width:320px;margin-bottom:20px"></div>
        <div style="margin-bottom:6px"><span style="font-size:12px;font-weight:bold">Date:</span></div>
        <div style="border-bottom:2px solid #333;width:200px;margin-bottom:16px"></div>
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
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const toDateVal = (val) => {
    if (!val) return '';
    const s = typeof val === 'string' ? val : '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  if (error && !record) return <div style={{ color: 'red', padding: '40px' }}>Error: {error}</div>;
  if (!record) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const statusEditable = !['paid', 'void'].includes(record.status);
  const isEditable = statusEditable && canEditRecords;
  const canDeletePayments = isAdmin || isBookkeeper;

  const editSectionStyle = {
    ...sectionStyle,
    ...(editing ? { borderColor: '#93c5fd', backgroundColor: '#fafbff' } : {}),
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => navigate(fromCustomer ? `/customers/${fromCustomerId}` : '/records')} style={btnLink}>
          &larr; {fromCustomer ? 'Back to Customer' : 'Back to Records'}
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditable && !editing && (
            <button onClick={() => setEditing(true)} style={btnEditYellow}>Edit</button>
          )}
          {editing && (
            <>
              <button onClick={() => { setEditing(false); setFormData(record); }} style={btnSecondary}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
          {!editing && (
            <>
              <button onClick={handlePrint} style={btnPrint}>Print</button>
              <button onClick={handleEmailDocument} disabled={emailing} style={{ ...btnPrint, backgroundColor: '#0369a1' }}>
                {emailing ? 'Sending...' : '\u2709 Email'}
              </button>
            </>
          )}
          {canEditRecords && !editing && record.status !== 'void' && (
            <button onClick={() => setShowScheduleModal(true)} style={btnSchedule}>Add to Schedule</button>
          )}
          {isEditable && !editing && record.status !== 'void' && (
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

      {/* Edit mode banner */}
      {editing && (
        <div style={{ padding: '10px 16px', marginBottom: '16px', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>Editing Record #{record.record_number} — make changes below then click Save</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setEditing(false); setFormData(record); }} style={btnSecondary}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={btnPrimary}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
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
          {/* Manual status override dropdown — hidden for technicians */}
          {(isAdmin || canEditRecords || isBookkeeper) && !editing && user?.role !== 'technician' && (
            <select
              value={record.status}
              onChange={(e) => handleManualStatusChange(e.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', color: '#374151', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              {ALL_STATUSES.filter(s => {
                // Paid and Void: only admin and bookkeeper
                if (['paid', 'void'].includes(s.value)) return isAdmin || isBookkeeper;
                // All others: admin and service_writer
                return isAdmin || canEditRecords;
              }).map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEditRecords && NEXT_STATUS[record.status] && !editing && (
            <button onClick={handleAdvanceStatus} style={btnPrimary}>
              {NEXT_LABEL[record.status] || 'Advance Status'}
            </button>
          )}
        </div>
      </div>

      {/* Customer Estimate Sign-Off — only visible for estimates */}
      {record.status === 'estimate' && canEditRecords && !editing && (
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
                Signed {new Date(record.authorization_signed_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Record Header ─── */}
      <div style={editSectionStyle}>
        <h2 style={sectionTitle}>Record Header</h2>
        <div style={gridStyle}>
          <Field label="Record Number" value={record.record_number} />
          <Field label="Record Date" value={formatDate(record.intake_date || record.created_at)} />
          <Field label="Account #" value={record.account_number} />
          <EditableField label="Key #" field="key_number" value={formData.key_number || ''} editing={editing} onChange={handleFieldChange} />
          <div>
            <label style={labelStyle}>Customer</label>
            <div style={{ fontSize: '0.875rem' }}>
              <Link to={`/customers/${record.customer_id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                {record.last_name || ''}{record.first_name ? ', ' + record.first_name : ''}
              </Link>
            </div>
          </div>
          <EditableField label="Company" field="company_name" value={formData.company_name || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Phone" field="phone_primary" value={formData.phone_primary || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Email" field="email_primary" value={formData.email_primary || ''} editing={editing} onChange={handleFieldChange} />
          {editing ? (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '2fr 1fr 80px 120px', gap: '8px' }}>
              <EditableField label="Street" field="address_street" value={formData.address_street || ''} editing={editing} onChange={handleFieldChange} />
              <EditableField label="City" field="address_city" value={formData.address_city || ''} editing={editing} onChange={handleFieldChange} />
              <EditableField label="State" field="address_state" value={formData.address_state || ''} editing={editing} onChange={handleFieldChange} />
              <EditableField label="ZIP" field="address_zip" value={formData.address_zip || ''} editing={editing} onChange={handleFieldChange} />
            </div>
          ) : (
            <FieldFull label="Address" value={[record.address_street, record.address_city, record.address_state, record.address_zip].filter(Boolean).join(', ') || '—'} />
          )}
        </div>
      </div>

      {/* ─── Unit Information ─── */}
      <div style={editSectionStyle}>
        <h2 style={sectionTitle}>Unit Information</h2>
        <div style={gridStyle}>
          <EditableField label="Year" field="year" value={formData.year || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Make" field="make" value={formData.make || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Model" field="model" value={formData.model || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="VIN" field="vin" value={formData.vin || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="License Plate" field="license_plate" value={formData.license_plate || ''} editing={editing} onChange={handleFieldChange} />
        </div>
      </div>

      {/* ─── Insurance / Warranty ─── */}
      {(() => {
        const insEditing = editing || editingInsurance;
        const insForm = editing ? formData : sectionForm;
        const insChange = editing ? handleFieldChange : handleSectionField;
        const insFields = ['mileage_at_intake', 'under_warranty_amount', 'no_charge_amount', 'discount_amount', 'discount_description', 'deductible_amount',
          'is_insurance_job', 'insurance_company', 'insurance_contact_name', 'insurance_phone',
          'insurance_email', 'claim_number', 'policy_number'];
        return (
          <div style={editSectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Insurance / Warranty</h2>
                {insEditing ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={insForm.is_insurance_job || false} onChange={(e) => insChange('is_insurance_job', e.target.checked)} />
                    Insurance Job
                  </label>
                ) : (
                  record.is_insurance_job && <StatusBadge status="estimate" />
                )}
              </div>
              {canEditRecords && !editing && !editingInsurance && statusEditable && (
                <button onClick={() => startSectionEdit('insurance')} style={btnSectionEdit}>Edit</button>
              )}
            </div>
            {/* Row 1: Insurance Company, Claim #, Policy #, Deductible */}
            <div style={gridStyle}>
              <EditableField label="Insurance Company" field="insurance_company" value={insEditing ? (insForm.insurance_company || '') : (record.insurance_company || '')} editing={insEditing} onChange={insChange} />
              <EditableField label="Claim #" field="claim_number" value={insEditing ? (insForm.claim_number || '') : (record.claim_number || '')} editing={insEditing} onChange={insChange} />
              <EditableField label="Policy #" field="policy_number" value={insEditing ? (insForm.policy_number || '') : (record.policy_number || '')} editing={insEditing} onChange={insChange} />
              <EditableField label="Deductible" field="deductible_amount" value={insEditing ? (insForm.deductible_amount || '') : (record.deductible_amount || '')} editing={insEditing} onChange={insChange} type="number" />
            </div>
            {/* Row 2: Contact Name, Phone, Email, Not Covered Amount */}
            <div style={{ ...gridStyle, marginTop: '12px' }}>
              <EditableField label="Contact Name" field="insurance_contact_name" value={insEditing ? (insForm.insurance_contact_name || '') : (record.insurance_contact_name || '')} editing={insEditing} onChange={insChange} />
              <EditableField label="Phone" field="insurance_phone" value={insEditing ? (insForm.insurance_phone || '') : (record.insurance_phone || '')} editing={insEditing} onChange={insChange} />
              <EditableField label="Email" field="insurance_email" value={insEditing ? (insForm.insurance_email || '') : (record.insurance_email || '')} editing={insEditing} onChange={insChange} />
              <EditableField label="Not Covered Amount" field="no_charge_amount" value={insEditing ? (insForm.no_charge_amount || '') : (record.no_charge_amount || '')} editing={insEditing} onChange={insChange} type="number" />
            </div>
            {/* Row 3: Under Warranty Amount, Mileage at Intake */}
            <div style={{ ...gridStyle, marginTop: '12px' }}>
              <EditableField label="Under Warranty Amount" field="under_warranty_amount" value={insEditing ? (insForm.under_warranty_amount || '') : (record.under_warranty_amount || '')} editing={insEditing} onChange={insChange} type="number" />
              <EditableField label="Mileage at Intake" field="mileage_at_intake" value={insEditing ? (insForm.mileage_at_intake || '') : (record.mileage_at_intake || '')} editing={insEditing} onChange={insChange} type="number" />
            </div>
            {!insEditing && !record.is_insurance_job && (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '12px 0 0' }}>Not an insurance job</p>
            )}
            {editingInsurance && !editing && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => handleSectionSave('insurance', insFields)} disabled={sectionSaving} style={btnPrimary}>{sectionSaving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => cancelSectionEdit('insurance')} style={btnSecondary}>Cancel</button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ─── Dates ─── */}
      {(() => {
        const dEditing = editing || editingDates;
        const dForm = editing ? formData : sectionForm;
        const dChange = editing ? handleFieldChange : handleSectionField;
        const dateFields = ['intake_date', 'start_date', 'expected_completion_date', 'actual_completion_date'];
        return (
          <div style={editSectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={sectionTitle}>Dates</h2>
              {canEditRecords && !editing && !editingDates && statusEditable && (
                <button onClick={() => startSectionEdit('dates')} style={btnSectionEdit}>Edit</button>
              )}
            </div>
            <div style={gridStyle}>
              <EditableField label="Intake Date" field="intake_date" value={dEditing ? toDateVal(dForm.intake_date) : formatDate(record.intake_date)} editing={dEditing} onChange={dChange} type={dEditing ? 'date' : 'text'} />
              <EditableField label="Start Date" field="start_date" value={dEditing ? toDateVal(dForm.start_date) : formatDate(record.start_date)} editing={dEditing} onChange={dChange} type={dEditing ? 'date' : 'text'} />
              <EditableField label="Expected Completion" field="expected_completion_date" value={dEditing ? toDateVal(dForm.expected_completion_date) : formatDate(record.expected_completion_date)} editing={dEditing} onChange={dChange} type={dEditing ? 'date' : 'text'} />
              <EditableField label="Completion Date" field="actual_completion_date" value={dEditing ? toDateVal(dForm.actual_completion_date) : formatDate(record.actual_completion_date)} editing={dEditing} onChange={dChange} type={dEditing ? 'date' : 'text'} />
            </div>
            {editingDates && !editing && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => handleSectionSave('dates', dateFields)} disabled={sectionSaving} style={btnPrimary}>{sectionSaving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => cancelSectionEdit('dates')} style={btnSecondary}>Cancel</button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ─── Job Description ─── */}
      <div style={editSectionStyle}>
        <h2 style={sectionTitle}>Job Description</h2>
        {editing ? (
          <BulletTextarea
            value={formData.job_description || ''}
            onChange={(val) => handleFieldChange('job_description', val)}
            placeholder="• Describe the work needed..."
            style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical' }}
          />
        ) : (
          <BulletDisplay text={record.job_description} />
        )}
      </div>

      {/* Labor Lines */}
      <LaborLinesTable
        recordId={record.id}
        laborLines={record.labor_lines}
        isEditable={isEditable}
        onUpdate={fetchRecord}
      />

      {/* Parts Lines */}
      <PartsLinesTable
        recordId={record.id}
        partsLines={record.parts_lines}
        isEditable={isEditable}
        onUpdate={fetchRecord}
      />

      {/* Freight Lines */}
      <FreightLinesTable
        recordId={record.id}
        freightLines={record.freight_lines}
        isEditable={isEditable}
        onUpdate={fetchRecord}
      />

      {/* ─── Invoice Totals ─── */}
      {canSeeFinancials && (
        <div style={{ ...sectionStyle, backgroundColor: '#f9fafb' }}>
          <h2 style={sectionTitle}>Invoice Totals</h2>
          <div style={{ maxWidth: '440px', marginLeft: 'auto' }}>
            <TotalRow label="Subtotal — Parts" value={formatCurrency(record.parts_subtotal)} />
            {parseFloat(record.freight_subtotal) > 0 && (
              <TotalRow label="Subtotal — Freight / Misc." value={formatCurrency(record.freight_subtotal)} />
            )}

            {/* Shop Supplies toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.875rem' }}>
              <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Shop Supplies (5%)
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.875rem' }}>
              <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

            <div style={{ borderTop: '2px solid #1e3a5f', marginTop: '8px', paddingTop: '8px' }}>
              <TotalRow label="Total Sales" value={formatCurrency(record.total_sales)} bold />
              {parseFloat(record.under_warranty_amount) > 0 && <TotalRow label="Under Warranty" value={`-${formatCurrency(record.under_warranty_amount)}`} color="#dc2626" />}
              {parseFloat(record.no_charge_amount) > 0 && <TotalRow label="Not Covered" value={`-${formatCurrency(record.no_charge_amount)}`} color="#dc2626" />}
              {parseFloat(record.discount_amount) > 0 && <TotalRow label={`Discount${record.discount_description ? ' — ' + record.discount_description : ''}`} value={`-${formatCurrency(record.discount_amount)}`} color="#dc2626" />}
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                      {p.square_transaction_id && <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '4px' }}>(Square)</span>}
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

      {/* QuickBooks Sync */}
      {canSeeFinancials && record.status === 'paid' && (
        <div style={{ ...sectionStyle, backgroundColor: record.quickbooks_synced_at ? '#f0fdf4' : '#fffbeb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ ...sectionTitle, borderBottom: 'none', marginBottom: '4px', paddingBottom: 0 }}>QuickBooks</h2>
              {record.quickbooks_synced_at ? (
                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  Synced {new Date(record.quickbooks_synced_at).toLocaleString()}
                  {record.quickbooks_invoice_id && (
                    <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                      Invoice ID: {record.quickbooks_invoice_id}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#92400e' }}>Not synced</div>
              )}
            </div>
            {!record.quickbooks_synced_at && (
              <button onClick={handleQbSync} disabled={qbSyncing} style={btnQbSync}>
                {qbSyncing ? 'Syncing...' : 'Sync to QuickBooks'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notes — always editable */}
      <div style={editSectionStyle}>
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

      {/* Communication Log */}
      <PhotoLinksSection recordId={record.id} isEditable={isEditable} />

      <CommunicationLog customerId={record.customer_id} recordId={record.id} />
    </div>
  );
}

// ─── Manual Payment Modal (Check / Cash / Zelle) ────────────────────────────
// ─── Schedule Modal ─────────────────────────────────────────────────────────
function ScheduleModal({ record, onSuccess, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [apptType, setApptType] = useState('drop_off');
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
                <option value="drop_off">Drop Off</option>
                <option value="pick_up">Pick Up</option>
                <option value="rv_repair">RV Repair</option>
                <option value="parts">Parts</option>
                <option value="storage">Storage</option>
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
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
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

function FieldFull({ label, value }) {
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ fontSize: '0.875rem' }}>{value || '—'}</div>
    </div>
  );
}

function EditableField({ label, field, value, editing, onChange, type = 'text' }) {
  const isPhone = field && (field.includes('phone') && !field.includes('email'));
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {editing ? (
        <input
          type={type}
          value={isPhone ? handlePhoneInput((value ?? '').replace(/\D/g, '')) : (value ?? '')}
          onChange={(e) => isPhone ? onChange(field, handlePhoneInput(e.target.value)) : onChange(field, type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
          style={inputStyle}
        />
      ) : (
        <div style={{ fontSize: '0.875rem' }}>{isPhone ? (formatPhone(value) || '—') : (value || '—')}</div>
      )}
    </div>
  );
}

function TotalRow({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.875rem' }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
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
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' };
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
const btnSectionEdit = { padding: '4px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
const btnLink = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: 0 };
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  width: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};
