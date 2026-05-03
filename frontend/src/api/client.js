const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function authHeaders() {
  const t = typeof localStorage !== 'undefined' ? localStorage.getItem('pazar_token') : null;
  const h = { Accept: 'application/json' };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, body, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

export async function apiPatch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPostForm(path, formData) {
  const headers = authHeaders();
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function apiBase() {
  return BASE;
}
