const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let authToken = null;

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  // Handle 401 — token expired or invalid
  if (res.status === 401) {
    localStorage.removeItem('erp_token');
    authToken = null;
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Server error (${res.status}) — please try again in a moment`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Token management
  setToken: (token) => { authToken = token; },

  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  refreshToken: () => request('/auth/refresh', { method: 'POST' }),

  // User management (admin only)
  getUsers: () => request('/auth/users'),
  createUser: (data) => request('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/auth/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: 'DELETE' }),

  // Records
  getRecords: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/records${qs ? `?${qs}` : ''}`);
  },
  getRecord: (id) => request(`/records/${id}`),
  createRecord: (data) => request('/records', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: (id, data) => request(`/records/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateRecordStatus: (id, status, manualOverride = false) => request(`/records/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, manual_override: manualOverride }) }),
  deleteRecord: (id) => request(`/records/${id}`, { method: 'DELETE' }),
  emailDocument: (id, data = {}) => request(`/records/${id}/email-document`, { method: 'POST', body: JSON.stringify(data) }),
  sendReminder: (recordId) => request(`/records/${recordId}/send-reminder`, { method: 'POST' }),
  copyRecord: (recordId, data) => request(`/records/${recordId}/copy`, { method: 'POST', body: JSON.stringify(data) }),

  // Customers
  getCustomers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers${qs ? `?${qs}` : ''}`);
  },
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  getCustomerUnits: (customerId) => request(`/customers/${customerId}/units`),
  mergeCustomers: (masterId, data) => request(`/customers/${masterId}/merge`, { method: 'POST', body: JSON.stringify(data) }),

  // Units
  createUnit: (data) => request('/units', { method: 'POST', body: JSON.stringify(data) }),
  updateUnit: (id, data) => request(`/units/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUnit: (id) => request(`/units/${id}`, { method: 'DELETE' }),

  // Payments
  addPayment: (recordId, data) => request(`/payments/${recordId}`, { method: 'POST', body: JSON.stringify(data) }),
  getPayments: (recordId) => request(`/payments/${recordId}`),
  deletePayment: (recordId, paymentId) => request(`/payments/${recordId}/${paymentId}`, { method: 'DELETE' }),

  // Labor lines
  addLabor: (recordId, data) => request(`/labor/${recordId}`, { method: 'POST', body: JSON.stringify(data) }),
  updateLabor: (recordId, lineId, data) => request(`/labor/${recordId}/${lineId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLabor: (recordId, lineId) => request(`/labor/${recordId}/${lineId}`, { method: 'DELETE' }),

  // Parts lines
  addPart: (recordId, data) => request(`/parts/${recordId}`, { method: 'POST', body: JSON.stringify(data) }),
  updatePart: (recordId, lineId, data) => request(`/parts/${recordId}/${lineId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePart: (recordId, lineId) => request(`/parts/${recordId}/${lineId}`, { method: 'DELETE' }),

  // Record photos
  getRecordPhotos: (recordId) => request(`/records/${recordId}/photos`),
  addRecordPhoto: (recordId, data) => request(`/records/${recordId}/photos`, { method: 'POST', body: JSON.stringify(data) }),
  updateRecordPhoto: (recordId, photoId, data) => request(`/records/${recordId}/photos/${photoId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRecordPhoto: (recordId, photoId) => request(`/records/${recordId}/photos/${photoId}`, { method: 'DELETE' }),

  // Freight lines
  getFreightLines: (recordId) => request(`/records/${recordId}/freight`),
  addFreightLine: (recordId, data) => request(`/records/${recordId}/freight`, { method: 'POST', body: JSON.stringify(data) }),
  updateFreightLine: (recordId, lineId, data) => request(`/records/${recordId}/freight/${lineId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFreightLine: (recordId, lineId) => request(`/records/${recordId}/freight/${lineId}`, { method: 'DELETE' }),

  // Technicians
  getTechnicians: () => request('/technicians'),
  getAllTechnicians: () => request('/technicians/all'),
  createTechnician: (name) => request('/technicians', { method: 'POST', body: JSON.stringify({ name }) }),
  updateTechnician: (id, data) => request(`/technicians/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Inventory
  searchInventory: (q) => request(`/inventory/search?q=${encodeURIComponent(q)}`),
  searchParts: (q) => request(`/parts/search?q=${encodeURIComponent(q)}`),
  getNextPartNumber: (category) => request(`/inventory/next-part-number?category=${encodeURIComponent(category)}`),
  getInventory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/inventory${qs ? `?${qs}` : ''}`);
  },
  getInventoryItem: (id) => request(`/inventory/${id}`),
  createInventoryItem: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryItem: (id, data) => request(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInventoryItem: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
  getReorderAlerts: () => request('/inventory/reorder-alerts'),
  getLowStockReport: () => request('/inventory/reports/low-stock'),
  getInStockReport: () => request('/inventory/reports/in-stock'),
  getInventoryCategories: () => request('/inventory-categories'),
  createInventoryCategory: (data) => request('/inventory-categories', { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryCategory: (id, data) => request(`/inventory-categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInventoryCategory: (id) => request(`/inventory-categories/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/appointments${qs ? `?${qs}` : ''}`);
  },
  getAppointment: (id) => request(`/appointments/${id}`),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id, data) => request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAppointment: (id, data = {}) => request(`/appointments/${id}`, { method: 'DELETE', body: JSON.stringify(data) }),
  resendConfirmation: (id) => request(`/appointments/${id}/resend-confirmation`, { method: 'POST' }),
  bulkResendConfirmations: () => request('/appointments/bulk-resend', { method: 'POST' }),

  // Communications
  logCommunication: (data) => request('/communications', { method: 'POST', body: JSON.stringify(data) }),
  getCommsByCustomer: (customerId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/communications/customer/${customerId}${qs ? `?${qs}` : ''}`);
  },
  getCommsByRecord: (recordId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/communications/record/${recordId}${qs ? `?${qs}` : ''}`);
  },

  // Square
  getSquareConfig: () => request('/square/config'),
  squareCreatePayment: (data) => request('/square/create-payment', { method: 'POST', body: JSON.stringify(data) }),
  squareGetPayment: (id) => request(`/square/payment/${id}`),
  squareCreateCustomer: (data) => request('/square/create-customer', { method: 'POST', body: JSON.stringify(data) }),
  squareTerminalConfig: () => request('/square/terminal/config'),
  squareTerminalCheckout: (data) => request('/square/terminal/checkout', { method: 'POST', body: JSON.stringify(data) }),
  squareTerminalStatus: (checkoutId) => request(`/square/terminal/checkout/${checkoutId}/status`),
  squareTerminalCancel: (checkoutId) => request(`/square/terminal/checkout/${checkoutId}/cancel`, { method: 'POST' }),
  squareTerminalComplete: (data) => request('/square/terminal/complete-payment', { method: 'POST', body: JSON.stringify(data) }),

  // Square POS (Payment Links)
  squarePosCheckout: (data) => request('/square/pos/checkout', { method: 'POST', body: JSON.stringify(data) }),
  squarePosStatus: (orderId) => request(`/square/pos/status/${orderId}`),
  squarePosRecordPayment: (data) => request('/square/pos/record-payment', { method: 'POST', body: JSON.stringify(data) }),

  // Square Devices
  getSquareDevices: () => request('/square/devices'),

  // Estimates
  signEstimate: (recordId, signatureData) => request(`/estimates/${recordId}/sign`, { method: 'POST', body: JSON.stringify({ signature_data: signatureData }) }),

  // QuickBooks
  getReminderSettings: () => request('/admin/reminder-settings'),
  updateReminderSettings: (data) => request('/admin/reminder-settings', { method: 'POST', body: JSON.stringify(data) }),

  qbGetStatus: () => request('/quickbooks/status'),
  qbGetAuthUrl: () => request('/quickbooks/auth'),
  qbDisconnect: () => request('/quickbooks/disconnect'),
  qbSyncRecord: (recordId) => request(`/quickbooks/sync/${recordId}`, { method: 'POST' }),

  // Reports
  getTechProfitability: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/technician-profitability${qs ? `?${qs}` : ''}`);
  },
  getContractorProfitability: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/contractor-profitability${qs ? `?${qs}` : ''}`);
  },
  getFinancialReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/financial${qs ? `?${qs}` : ''}`);
  },

  // Bookkeeper adjustments
  getBookkeeperAdjustments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bookkeeper-adjustments${qs ? `?${qs}` : ''}`);
  },
  createBookkeeperAdjustment: (data) => request('/bookkeeper-adjustments', { method: 'POST', body: JSON.stringify(data) }),
  updateBookkeeperAdjustment: (id, data) => request(`/bookkeeper-adjustments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBookkeeperAdjustment: (id) => request(`/bookkeeper-adjustments/${id}`, { method: 'DELETE' }),

  // Google Calendar
  calGetStatus: () => request('/calendar/status'),
  calGetAuthUrl: () => request('/calendar/auth'),
  calDisconnect: () => request('/calendar/disconnect', { method: 'DELETE' }),

  // Storage
  getStorageSpaces: () => request('/storage'),
  createStorageSpace: (data) => request('/storage/spaces', { method: 'POST', body: JSON.stringify(data) }),
  assignStorage: (data) => request('/storage/assign', { method: 'POST', body: JSON.stringify(data) }),
  updateStorage: (id, data) => request(`/storage/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  endStorage: (id, data = {}) => request(`/storage/${id}`, { method: 'DELETE', body: JSON.stringify(data) }),
  getBillingPreview: () => request('/storage/billing-preview'),
  runBilling: (data) => request('/storage/run-billing', { method: 'POST', body: JSON.stringify(data) }),
  getStorageCharges: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/storage/charges${qs ? `?${qs}` : ''}`);
  },
  createStorageCharge: (data) => request('/storage/charges', { method: 'POST', body: JSON.stringify(data) }),
  deleteStorageCharge: (id) => request(`/storage/charges/${id}`, { method: 'DELETE' }),
  updateStorageCharge: (id, data) => request(`/storage/charges/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getStorageBillingReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/storage/billing-report${qs ? `?${qs}` : ''}`);
  },
  getStorageByCustomer: (customerId) => request(`/storage/customer/${customerId}`),

  // Storage Waitlist
  getStorageWaitlist: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/storage/waitlist${qs ? `?${qs}` : ''}`);
  },
  addToWaitlist: (data) => request('/storage/waitlist', { method: 'POST', body: JSON.stringify(data) }),
  updateWaitlistEntry: (id, data) => request(`/storage/waitlist/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeFromWaitlist: (id) => request(`/storage/waitlist/${id}`, { method: 'DELETE' }),
  notifyWaitlistEntry: (id) => request(`/storage/waitlist/${id}/notify`, { method: 'POST' }),

  // Storage Contract
  generateStorageContract: (data) => fetch(`${BASE}/storage-contract/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(data),
  }).then(r => { if (!r.ok) throw new Error('Failed to generate contract'); return r.blob(); }),
  emailStorageContract: (billing_id) => request('/storage-contract/email', { method: 'POST', body: JSON.stringify({ billing_id }) }),
  sendStorageGuidelines: (data) => request('/storage-contract/send-guidelines', { method: 'POST', body: JSON.stringify(data) }),

  // CRM — Customer detail sub-resources
  getCustomerRecords: (customerId) => request(`/customers/${customerId}/records`),
  getCustomerStorage: (customerId) => request(`/customers/${customerId}/storage`),

  // Customer Documents
  getCustomerDocuments: (customerId) => request(`/customers/${customerId}/documents`),
  downloadCustomerDocument: async (customerId, docId) => {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}/customers/${customerId}/documents/${docId}/download`, { headers });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    return blob;
  },

  // Marketing
  getMarketingLog: (customerId) => request(`/marketing/customer/${customerId}`),
  addMarketingNote: (data) => request('/marketing/note', { method: 'POST', body: JSON.stringify(data) }),
  logCampaign: (data) => request('/marketing/log-campaign', { method: 'POST', body: JSON.stringify(data) }),

  // Parts Sales
  getPartsSales: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/parts-sales${qs ? `?${qs}` : ''}`);
  },
  getPartsSale: (id) => request(`/parts-sales/${id}`),
  createPartsSale: (data) => request('/parts-sales', { method: 'POST', body: JSON.stringify(data) }),
  updatePartsSale: (id, data) => request(`/parts-sales/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  voidPartsSale: (id) => request(`/parts-sales/${id}`, { method: 'DELETE' }),
  addPartsSaleLine: (saleId, data) => request(`/parts-sales/${saleId}/lines`, { method: 'POST', body: JSON.stringify(data) }),
  updatePartsSaleLine: (saleId, lineId, data) => request(`/parts-sales/${saleId}/lines/${lineId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePartsSaleLine: (saleId, lineId) => request(`/parts-sales/${saleId}/lines/${lineId}`, { method: 'DELETE' }),
  recordPartsSalePayment: (saleId, data) => request(`/parts-sales/${saleId}/payment`, { method: 'POST', body: JSON.stringify(data) }),

  // Campaigns
  getCampaigns: () => request('/campaigns'),
  getCampaignAudit: () => request('/campaigns/audit'),
  getCampaign: (id) => request(`/campaigns/${id}`),
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id, data) => request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCampaign: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),
  previewCampaign: (id) => request(`/campaigns/${id}/preview`, { method: 'POST' }),
  sendCampaign: (id, data = {}) => request(`/campaigns/${id}/send`, { method: 'POST', body: JSON.stringify(data) }),
  retryCampaign: (id) => request(`/campaigns/${id}/retry`, { method: 'POST' }),
  cancelCampaign: (id) => request(`/campaigns/${id}/cancel`, { method: 'POST' }),
  getAudienceCount: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/campaigns/audience/count${qs ? `?${qs}` : ''}`);
  },

  // Partners CRM
  getPartners: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/partners${qs ? `?${qs}` : ''}`);
  },
  getPartner: (id) => request(`/partners/${id}`),
  createPartner: (data) => request('/partners', { method: 'POST', body: JSON.stringify(data) }),
  updatePartner: (id, data) => request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePartner: (id) => request(`/partners/${id}`, { method: 'DELETE' }),
  getPartnerFunnelStats: () => request('/partners/funnel-stats'),
  getPartnerActivities: (partnerId) => request(`/partners/${partnerId}/activities`),
  addPartnerActivity: (partnerId, data) => request(`/partners/${partnerId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  deletePartnerActivity: (partnerId, actId) => request(`/partners/${partnerId}/activities/${actId}`, { method: 'DELETE' }),

  // Vendors
  getVendors: () => request('/vendors'),
  createVendor: (name) => request('/vendors', { method: 'POST', body: JSON.stringify({ name }) }),
  getVendorParts: (name) => request(`/vendors/${encodeURIComponent(name)}/parts`),
  deleteVendor: (name) => request(`/vendors/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  bulkUpdateVendor: (parts) => request('/vendors/bulk-update', { method: 'PATCH', body: JSON.stringify({ parts }) }),
  renameVendor: (name, newName) => request(`/vendors/${encodeURIComponent(name)}/rename`, { method: 'PUT', body: JSON.stringify({ newName }) }),
  mergeVendors: (vendors, mergeInto) => request('/vendors/merge', { method: 'POST', body: JSON.stringify({ vendors, mergeInto }) }),

  // Purchase Orders / Supplier Module
  getPurchaseOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/purchase-orders${qs ? `?${qs}` : ''}`);
  },
  getPurchaseOrder: (id) => request(`/purchase-orders/${id}`),
  createPurchaseOrder: (data) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updatePurchaseOrder: (id, data) => request(`/purchase-orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  receivePurchaseOrder: (id) => request(`/purchase-orders/${id}/receive`, { method: 'POST' }),
  deletePurchaseOrder: (id) => request(`/purchase-orders/${id}`, { method: 'DELETE' }),
  addPOLineItem: (poId, data) => request(`/purchase-orders/${poId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  matchPOLineItem: (poId, itemId, inventoryItemId) => request(`/purchase-orders/${poId}/items/${itemId}/match`, { method: 'PATCH', body: JSON.stringify({ inventory_item_id: inventoryItemId }) }),
  deletePOLineItem: (poId, itemId) => request(`/purchase-orders/${poId}/items/${itemId}`, { method: 'DELETE' }),
  getVendorDetails: () => request('/purchase-orders/vendors/details'),
  updateVendorDetails: (name, data) => request(`/purchase-orders/vendors/details/${encodeURIComponent(name)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVendorDetails: (name) => request(`/purchase-orders/vendors/details/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  getSupplierSubcategories: () => request('/purchase-orders/vendors/subcategories'),
  importAmazonOrders: (orders) => request('/purchase-orders/amazon-import', { method: 'POST', body: JSON.stringify({ orders }) }),
  getAmazonImported: () => request('/purchase-orders/amazon-imported'),
  importSupplierOrders: (vendor, orders) => request('/purchase-orders/supplier-import', { method: 'POST', body: JSON.stringify({ vendor, orders }) }),
  getSupplierImported: (vendor) => request(`/purchase-orders/supplier-imported?vendor=${encodeURIComponent(vendor)}`),

  // Online payments (Poynt / GoDaddy Payments)
  createOnlinePaymentLink: (data) => request('/payments/online/links', { method: 'POST', body: JSON.stringify(data) }),
  getOnlinePaymentLinks: (recordId) => request(`/payments/online/links${recordId ? `?record_id=${recordId}` : ''}`),
  sendOnlinePaymentLinkReminder: (linkId, to = null) => request(`/payments/online/links/${linkId}/reminder`, { method: 'POST', body: JSON.stringify({ to }) }),
  getOnlinePaymentHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/payments/online/history${qs ? `?${qs}` : ''}`);
  },
};
