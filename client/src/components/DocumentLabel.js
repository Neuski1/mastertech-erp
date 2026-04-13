import React from 'react';

const LABEL_MAP = {
  estimate:           'ESTIMATE',
  approved:           'WORK ORDER',
  schedule_customer:  'WORK ORDER',
  scheduled:          'WORK ORDER',
  in_progress:        'WORK ORDER',
  awaiting_parts:     'WORK ORDER',
  awaiting_approval:  'ESTIMATE / WORK ORDER',
  complete:           'INVOICE',
  payment_pending:    'INVOICE',
  partial:            'INVOICE',
  paid:               'INVOICE \u2014 PAID',
  on_hold:            'ON HOLD',
  void:               'VOID',
  filed:              'FILED ESTIMATE',
};

function getDocColor(status) {
  if (status === 'estimate') return '#2e7d32';
  if (['complete', 'payment_pending', 'partial', 'paid'].includes(status)) return '#4a235a';
  if (status === 'void') return '#555';
  if (status === 'filed') return '#64748b';
  return '#1a2a4a'; // WO statuses + on_hold
}

export default function DocumentLabel({ status }) {
  const label = LABEL_MAP[status] || status;
  return (
    <div style={{
      textAlign: 'center',
      padding: '12px 24px',
      marginBottom: '24px',
      backgroundColor: getDocColor(status),
      color: '#fff',
      fontSize: '1.25rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      borderRadius: '4px',
    }}>
      {label}
    </div>
  );
}

// Export for print layout use
export { getDocColor };
