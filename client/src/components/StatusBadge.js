import React from 'react';

const STATUS_CONFIG = {
  estimate:           { label: 'Estimate',           color: '#f59e0b', bg: '#fef3c7' },
  approved:           { label: 'Not Started',         color: '#3b82f6', bg: '#dbeafe' },
  schedule_customer:  { label: 'Schedule Customer',  color: '#7c3aed', bg: '#ede9fe' },
  scheduled:          { label: 'Scheduled',          color: '#0d9488', bg: '#ccfbf1' },
  in_progress:        { label: 'In Progress',        color: '#3b82f6', bg: '#dbeafe' },
  awaiting_parts:     { label: 'Awaiting Parts',     color: '#8b5cf6', bg: '#ede9fe' },
  awaiting_approval:  { label: 'Awaiting Approval',  color: '#f59e0b', bg: '#fef3c7' },
  complete:           { label: 'Complete',            color: '#10b981', bg: '#d1fae5' },
  payment_pending:    { label: 'Payment Pending',    color: '#ea580c', bg: '#fff7ed' },
  partial:            { label: 'Partial Payment',     color: '#10b981', bg: '#d1fae5' },
  paid:               { label: 'Paid',                color: '#065f46', bg: '#a7f3d0' },
  on_hold:            { label: 'On Hold',             color: '#6b7280', bg: '#f3f4f6' },
  void:               { label: 'Void',                color: '#ef4444', bg: '#fee2e2' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: config.color,
      backgroundColor: config.bg,
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
    }}>
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
