import { readFile } from 'node:fs/promises';
const env = await readFile('.env.local', 'utf8');
for (const line of env.split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
}
const base = 'http://localhost:7127';
const common = { Origin: base, 'Content-Type': 'application/json' };
const request = async (path, options = {}) => {
  const response = await fetch(base + path, options);
  const body = await response.json();
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: HTTP ${response.status} ${body.error || ''}`);
  return { response, body };
};
const email = process.env.STAFF_EMAILS?.split(',')[0].trim() || 'mahmoudkonsowa678@gmail.com';
const password = process.env.STAFF_PASSWORD || '011025';
const login = await request('/api/auth/login', { method: 'POST', headers: common, body: JSON.stringify({ email, password }) });
const cookie = login.response.headers.get('set-cookie').split(';')[0];
const created = await request('/api/bookings', { method: 'POST', headers: common, body: JSON.stringify({ name: 'QA SUPABASE TEMP', phone: '0000000000', preferredAt: new Date(Date.now() + 48 * 3600000).toISOString(), groupSize: 2 }) });
const id = created.body.id;
if (!id?.startsWith('ALG-')) throw new Error('No valid QA ticket ID');
try {
  let historyLength = 1;
  for (const status of ['confirmed', 'deposit', 'completed']) {
    const { body } = await request(`/api/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...common, Cookie: cookie }, body: JSON.stringify({ status }) });
    if (body.booking.status !== status) throw new Error(`Incorrect status: ${status}`);
    historyLength = body.booking.history.length;
  }
  if (historyLength !== 4) throw new Error(`Incorrect audit history length: ${historyLength}`);
  for (const path of ['/api/bookings', '/api/system/status', '/dashboard', '/dashboard/pipeline', '/dashboard/system']) {
    const response = await fetch(base + path, { headers: { Cookie: cookie } });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    await response.text();
  }
  console.log(JSON.stringify({ apiBookingCreated: true, statusesPassed: 4, historyEntries: historyLength, dashboardRoutesPassed: 5 }));
} finally {
  await request(`/api/bookings/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { ...common, Cookie: cookie } });
}
const { body } = await request('/api/bookings', { headers: { Cookie: cookie } });
if (body.bookings.some((booking) => booking.id === id || booking.name === 'QA SUPABASE TEMP')) throw new Error('QA record remains after deletion');
if (body.bookings.length !== 5) throw new Error(`Unexpected production count: ${body.bookings.length}`);
console.log(JSON.stringify({ qaDeleted: true, productionBookings: body.bookings.length }));
