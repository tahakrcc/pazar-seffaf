import { apiGet, apiPost, apiPostForm, apiPatch } from './client';

export async function fetchMarkets(city) {
  const q = city ? `?city=${encodeURIComponent(city)}` : '';
  return apiGet(`/api/v1/markets${q}`);
}

export async function fetchMarket(id) {
  return apiGet(`/api/v1/markets/${id}`);
}

export async function fetchMarketPrices(id) {
  return apiGet(`/api/v1/markets/${id}/prices`);
}

export async function fetchMarketSchema(id) {
  return apiGet(`/api/v1/markets/${id}/map-schema`);
}

export async function fetchMarketVendors(marketId) {
  return apiGet(`/api/v1/markets/${marketId}/vendors`);
}

export async function fetchProducts() {
  return apiGet('/api/v1/products');
}

export async function fetchNotifications() {
  return apiGet('/api/v1/meta/notifications');
}

export async function fetchWeather(city) {
  return apiGet(`/api/v1/meta/weather/${encodeURIComponent(city)}`);
}

export async function fetchDaysTr() {
  return apiGet('/api/v1/meta/days');
}

export async function loginApi(email, password, role) {
  return apiPost('/api/v1/auth/login', { email, password, role });
}

export async function shoppingOptimize(city, productIds, quantities) {
  return apiPost('/api/v1/shopping/optimize', { city, productIds, quantities: quantities || {} });
}

export async function aiOptimizeBudget(marketId, budget, productIds, quantities) {
  return apiPost('/api/v1/ai/optimize-budget', {
    marketId,
    budget,
    productIds,
    quantities: quantities || {},
  });
}

export async function submitComplaint({
  marketId,
  vendorId,
  description,
  latitude,
  longitude,
  reporterPhone,
  citizenSessionId,
  photoFile,
}) {
  const fd = new FormData();
  fd.append('marketId', String(marketId));
  fd.append('vendorId', String(vendorId));
  if (description) fd.append('description', description);
  if (latitude != null) fd.append('latitude', String(latitude));
  if (longitude != null) fd.append('longitude', String(longitude));
  if (reporterPhone) fd.append('reporterPhone', reporterPhone);
  if (citizenSessionId) fd.append('citizenSessionId', citizenSessionId);
  if (photoFile) fd.append('photo', photoFile);
  return apiPostForm('/api/v1/complaints', fd);
}

export async function fetchVendorMe() {
  return apiGet('/api/v1/vendor/me');
}

export async function fetchVendorProducts() {
  return apiGet('/api/v1/vendor/products');
}

export async function postVendorProduct(productId, unitPrice) {
  return apiPost('/api/v1/vendor/products', { productId, unitPrice });
}

export async function patchVendorProductPublish(id, published) {
  return apiPatch(`/api/v1/vendor/products/${id}/publish`, { published });
}

export async function fetchVendorInvoices() {
  return apiGet('/api/v1/vendor/invoices');
}

export async function postVendorInvoice(file) {
  const fd = new FormData();
  fd.append('file', file);
  return apiPostForm('/api/v1/vendor/invoices', fd);
}

export async function patchVendorInvoiceLines(invoiceId, lines) {
  return apiPatch(`/api/v1/vendor/invoices/${invoiceId}/lines`, lines);
}

export async function fetchOfficerComplaints() {
  return apiGet('/api/v1/officer/complaints');
}

export async function patchOfficerComplaint(id, status) {
  return apiPatch(`/api/v1/officer/complaints/${id}`, { status });
}

export async function fetchOfficerInspections() {
  return apiGet('/api/v1/officer/inspections');
}

export async function postOfficerInspection(body) {
  return apiPost('/api/v1/officer/inspections', body);
}

export async function postOfficerViolation(body) {
  return apiPost('/api/v1/officer/violations', body);
}

export async function fetchChiefWorkload() {
  return apiGet('/api/v1/chief/workload');
}

export async function fetchChiefOfficers() {
  return apiGet('/api/v1/chief/officers');
}

export async function fetchChiefComplaints() {
  return apiGet('/api/v1/chief/complaints');
}

export async function postChiefAssignment(complaintId, officerUserId) {
  return apiPost('/api/v1/chief/assignments', { complaintId, officerUserId });
}

export async function fetchAdminMunicipalities() {
  return apiGet('/api/v1/admin/municipalities');
}

export async function fetchAdminVendors() {
  return apiGet('/api/v1/admin/vendors');
}

export async function fetchAdminInspections() {
  return apiGet('/api/v1/admin/inspections');
}

export async function fetchAdminOfficers() {
  return apiGet('/api/v1/admin/officers');
}

export async function fetchAdminComplaints() {
  return apiGet('/api/v1/admin/complaints');
}

export async function postAdminAssignment(complaintId, officerUserId) {
  return apiPost('/api/v1/admin/assignments', { complaintId, officerUserId });
}

export async function postAdminMarket(body) {
  return apiPost('/api/v1/admin/markets', body);
}

export async function patchAdminSchemaCell(marketId, cellId, body) {
  const enc = encodeURIComponent(cellId);
  return apiPatch(`/api/v1/admin/markets/${marketId}/schema/cells/${enc}`, body);
}

/** Serbest tuval JSON metni; canvasJson null ile tuval kaldırılır (yalnız ızgara). POST kullanır (PATCH/proxy uyumu). */
export async function patchAdminMarketCanvas(marketId, canvasJson) {
  return apiPost(`/api/v1/admin/markets/${marketId}/map-schema/canvas`, { canvasJson });
}

export async function postAdminAssignVendor(vendorId, marketId) {
  return apiPost('/api/v1/admin/assign/vendor', { vendorId, marketId });
}

export const publicApi = {
  fetchMarkets,
  fetchMarket,
  fetchMarketPrices,
  fetchMarketSchema,
  fetchProducts,
  fetchNotifications,
  fetchWeather,
  fetchDaysTr,
  shoppingOptimize,
  aiOptimizeBudget,
  submitComplaint,
}

export const vendorApi = {
  fetchVendorMe,
  fetchVendorProducts,
  postVendorProduct,
  patchVendorProductPublish,
  fetchVendorInvoices,
  postVendorInvoice,
  patchVendorInvoiceLines,
}

export const officerApi = {
  fetchOfficerComplaints,
  patchOfficerComplaint,
  fetchOfficerInspections,
  postOfficerInspection,
  postOfficerViolation,
}

export const chiefApi = {
  fetchChiefWorkload,
  fetchChiefOfficers,
  fetchChiefComplaints,
  postChiefAssignment,
}

export const adminApi = {
  fetchAdminMunicipalities,
  fetchAdminVendors,
  fetchAdminInspections,
  fetchAdminOfficers,
  fetchAdminComplaints,
  postAdminAssignment,
  postAdminMarket,
  patchAdminSchemaCell,
  patchAdminMarketCanvas,
  postAdminAssignVendor,
}
