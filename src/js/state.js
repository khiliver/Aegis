import { isSupabaseConfigured, supabase } from './supabaseClient.js';

const KEYS = {
  users: 'aegis.users',
  session: 'aegis.session',
  theme: 'aegis.theme',
  data: 'aegis.data',
  sosLog: 'aegis.sosLog',
  activity: 'aegis.activity',
  remoteUsersCount: 'aegis.remoteUsersCount',
  pendingRemoteWrites: 'aegis.pendingRemoteWrites'
};

const ADMIN_ACCOUNT = {
  email: 'admin@legazpi.gov.ph',
  password: 'AegisAdmin#2026',
  role: 'admin',
  name: 'Legazpi DRRM Officer'
};

const CENTER_COORDINATES = {
  1: { lat: 13.1401, lng: 123.7516 },
  2: { lat: 13.1294, lng: 123.7462 },
  3: { lat: 13.1364, lng: 123.7429 },
  'legazpi national high school': { lat: 13.1401, lng: 123.7516 },
  'bagacay barangay hall': { lat: 13.1294, lng: 123.7462 },
  'rawis covered court': { lat: 13.1364, lng: 123.7429 }
};

const seedData = {
  lastUpdated: Date.now(),
  centers: [
    { id: 1, name: 'Legazpi National High School', capacity: 500, status: 'Open', eta: '11 min', lat: 13.1401, lng: 123.7516 },
    { id: 2, name: 'Bagacay Barangay Hall', capacity: 220, status: 'Open', eta: '8 min', lat: 13.1294, lng: 123.7462 },
    { id: 3, name: 'Rawis Covered Court', capacity: 300, status: 'Standby', eta: '14 min', lat: 13.1364, lng: 123.7429 }
  ],
  routes: [
    { id: 'R-1', from: 'Bagacay', to: 'LNHS', distanceKm: 2.5, etaMin: 12, risk: 'Low' },
    { id: 'R-2', from: 'Rawis', to: 'Bagacay Hall', distanceKm: 3.1, etaMin: 16, risk: 'Low' }
  ],
  floodZones: [
    { id: 'F-03', area: 'Coastal Road', level: 'High' },
    { id: 'F-07', area: 'Rizal St.', level: 'Moderate' }
  ],
  announcements: [
    { id: 1, title: 'Rainfall Advisory', body: 'Expect moderate to heavy rainfall this evening.', at: Date.now() - 1000 * 60 * 32 }
  ]
};

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

async function safeSupabaseInsert(table, payload) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false };
  }

  try {
    const { error } = await supabase.from(table).insert(payload);
    if (error) {
      return { ok: false, error };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function getPendingRemoteWrites() {
  const rows = read(KEYS.pendingRemoteWrites, []);
  return Array.isArray(rows) ? rows : [];
}

function setPendingRemoteWrites(rows) {
  write(KEYS.pendingRemoteWrites, Array.isArray(rows) ? rows : []);
}

function enqueueRemoteInsert(table, payload) {
  const queue = getPendingRemoteWrites();
  const items = Array.isArray(payload) ? payload : [payload];
  const now = Date.now();

  items.forEach((item) => {
    queue.push({
      id: `${now}-${Math.random().toString(36).slice(2)}`,
      table,
      payload: item,
      queuedAt: now,
      retries: 0
    });
  });

  setPendingRemoteWrites(queue.slice(-200));
}

async function persistRemoteInsert(table, payload) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, queued: false };
  }

  if (!navigator.onLine) {
    enqueueRemoteInsert(table, payload);
    return { ok: false, queued: true };
  }

  const result = await safeSupabaseInsert(table, payload);
  if (result.ok) {
    return { ok: true, queued: false };
  }

  enqueueRemoteInsert(table, payload);
  return { ok: false, queued: true, error: result.error };
}

export async function flushPendingRemoteWrites() {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return { flushed: false, count: 0 };
  }

  const queue = getPendingRemoteWrites();
  if (!queue.length) {
    return { flushed: true, count: 0 };
  }

  const remaining = [];
  let flushedCount = 0;

  for (const entry of queue) {
    try {
      const { error } = await supabase.from(entry.table).insert([entry.payload]);
      if (error) {
        remaining.push({ ...entry, retries: Number(entry.retries || 0) + 1 });
      } else {
        flushedCount += 1;
      }
    } catch {
      remaining.push({ ...entry, retries: Number(entry.retries || 0) + 1 });
    }
  }

  setPendingRemoteWrites(remaining.slice(-200));
  return { flushed: remaining.length === 0, count: flushedCount, remaining: remaining.length };
}

async function upsertAccountProfile({ id, email, name, role }) {
  if (!isSupabaseConfigured || !supabase || !id || !email) {
    return { ok: false };
  }

  const payload = {
    id,
    email,
    name: name || 'Resident',
    role: role === 'admin' ? 'admin' : 'user',
    updated_at: new Date().toISOString()
  };

  const tables = ['profiles', 'users'];
  let lastError = null;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
      if (!error) {
        return { ok: true, table };
      }
      lastError = error;
    } catch (error) {
      lastError = error;
    }
  }

  return { ok: false, error: lastError };
}

function normalizeData(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const rawCenters = Array.isArray(data.centers) ? data.centers : [...seedData.centers];

  const centers = rawCenters.map((center) => {
    const hasValidCoordinates = Number.isFinite(center?.lat) && Number.isFinite(center?.lng);
    if (hasValidCoordinates) {
      return center;
    }

    const byId = CENTER_COORDINATES[String(center?.id)] || CENTER_COORDINATES[Number(center?.id)];
    const byName = CENTER_COORDINATES[String(center?.name || '').trim().toLowerCase()];
    const fallback = byId || byName;

    if (!fallback) {
      return center;
    }

    return {
      ...center,
      lat: fallback.lat,
      lng: fallback.lng
    };
  });

  return {
    lastUpdated: Number(data.lastUpdated) || Date.now(),
    centers,
    routes: Array.isArray(data.routes) ? data.routes : [...seedData.routes],
    floodZones: Array.isArray(data.floodZones) ? data.floodZones : [...seedData.floodZones],
    announcements: Array.isArray(data.announcements) ? data.announcements : [...seedData.announcements]
  };
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function parseCoordinatesFromLocation(location) {
  const raw = String(location || '');
  const match = raw.match(/\(([-+]?\d+(?:\.\d+)?)\s*[Nn]?,\s*([-+]?\d+(?:\.\d+)?)\s*[Ee]?\)/);
  if (!match) {
    return { lat: null, lng: null };
  }

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null
  };
}

function normalizeSosEntry(entry) {
  const fallbackPoint = parseCoordinatesFromLocation(entry?.location);
  const lat = Number(entry?.lat);
  const lng = Number(entry?.lng);
  const at = Number(entry?.at) || Date.parse(entry?.created_at || '') || Date.now();

  return {
    name: entry?.name || 'Resident',
    location: entry?.location || 'Location unavailable',
    lat: Number.isFinite(lat) ? lat : fallbackPoint.lat,
    lng: Number.isFinite(lng) ? lng : fallbackPoint.lng,
    accuracy: Number.isFinite(Number(entry?.accuracy)) ? Number(entry?.accuracy) : null,
    locationSource: entry?.locationSource || entry?.location_source || 'gps',
    status: entry?.status || 'Active',
    method: entry?.method || 'SMS',
    message: entry?.message || '',
    at
  };
}

function mergeSosLogs(localRows, remoteRows) {
  const merged = new Map();
  const rows = [...remoteRows, ...localRows].map(normalizeSosEntry);

  rows.forEach((row) => {
    const key = `${row.at}|${row.name}|${row.method}|${row.message}`;
    if (!merged.has(key)) {
      merged.set(key, row);
    }
  });

  return Array.from(merged.values())
    .sort((a, b) => b.at - a.at)
    .slice(0, 50);
}

export function initStorage() {
  const existingData = read(KEYS.data, null);
  write(KEYS.data, normalizeData(existingData || seedData));
  if (!read(KEYS.sosLog, null)) {
    write(KEYS.sosLog, [
      {
        name: 'Juan Dela Cruz',
        location: 'Bagacay, Legazpi City (13.12940 N, 123.74620 E)',
        lat: 13.1294,
        lng: 123.7462,
        accuracy: 28,
        locationSource: 'gps',
        status: 'Active',
        at: Date.now() - 1000 * 60 * 6
      },
      {
        name: 'Maria Santos',
        location: 'Rawis, Legazpi City (13.13640 N, 123.74290 E)',
        lat: 13.1364,
        lng: 123.7429,
        accuracy: 40,
        locationSource: 'gps',
        status: 'Resolved',
        at: Date.now() - 1000 * 60 * 41
      }
    ]);
  }
  if (!read(KEYS.activity, null)) {
    write(KEYS.activity, [
      { actor: 'system', action: 'Offline cache loaded', time: nowTime() },
      { actor: 'admin', action: 'Flood zone F-03 marked high risk', time: nowTime() }
    ]);
  }
}

export function getTheme() {
  return localStorage.getItem(KEYS.theme) || 'light';
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem(KEYS.theme, next);
  return next;
}

export function getSession() {
  return read(KEYS.session, null);
}

export async function clearSession() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Fall through to local cleanup even if remote sign-out fails.
    }
  }

  localStorage.removeItem(KEYS.session);
}

export async function registerUser({ name, email, password, role = 'user' }) {
  const normalizedRole = role === 'admin' ? 'admin' : 'user';

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: normalizedRole
        }
      }
    });

    if (error) {
      return { ok: false, message: error.message || 'Sign up failed' };
    }

    await upsertAccountProfile({
      id: data.user?.id,
      email: data.user?.email || email,
      name,
      role: normalizedRole
    });

    const session = data.session;
    if (!session) {
      return { ok: true, pendingVerification: true };
    }

    const user = data.user;
    const current = {
      role: user?.user_metadata?.role === 'admin' ? 'admin' : 'user',
      name: user?.user_metadata?.name || name,
      email: user?.email || email,
      at: Date.now()
    };
    write(KEYS.session, current);
    return { ok: true, session: current };
  }

  const users = read(KEYS.users, []);
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { ok: false, message: 'Email already registered. Please sign in.' };
  }

  users.push({ name, email, password, role: normalizedRole, createdAt: Date.now() });
  write(KEYS.users, users);

  return { ok: true };
}

export async function loginUser({ email, password }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, message: 'Invalid email or password' };
    }

    const user = data.user;
    const session = {
      role: user?.user_metadata?.role === 'admin' ? 'admin' : 'user',
      name: user?.user_metadata?.name || 'Resident',
      email: user.email || email,
      at: Date.now()
    };

    void upsertAccountProfile({
      id: user?.id,
      email: user?.email || email,
      name: session.name,
      role: session.role
    });

    write(KEYS.session, session);
    appendActivity('user', `Logged in: ${session.email}`);

    return { ok: true, session };
  }

  const users = read(KEYS.users, []);
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!found || found.password !== password) {
    return { ok: false, message: 'Invalid email or password' };
  }

  const session = { role: 'user', name: found.name, email: found.email, at: Date.now() };
  write(KEYS.session, session);
  appendActivity('user', `Logged in: ${found.email}`);

  return { ok: true, session };
}

export async function loginAdmin({ email, password }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, message: 'Invalid email or password' };
    }

    const role = data.user.user_metadata?.role;
    if (role !== 'admin') {
      await supabase.auth.signOut();
      return { ok: false, message: 'Unauthorized admin account' };
    }

    const session = {
      role: 'admin',
      name: data.user.user_metadata?.name || 'Admin',
      email: data.user.email || email,
      at: Date.now()
    };

    void upsertAccountProfile({
      id: data.user?.id,
      email: data.user?.email || email,
      name: session.name,
      role: 'admin'
    });

    write(KEYS.session, session);
    appendActivity('admin', 'Admin session started');

    return { ok: true, session };
  }

  const users = read(KEYS.users, []);
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (found && found.password === password && found.role === 'admin') {
    const session = {
      role: 'admin',
      name: found.name || 'Admin',
      email: found.email,
      at: Date.now()
    };
    write(KEYS.session, session);
    appendActivity('admin', 'Admin session started');

    return { ok: true, session };
  }

  if (email !== ADMIN_ACCOUNT.email || password !== ADMIN_ACCOUNT.password) {
    return { ok: false, message: 'Invalid admin email or password' };
  }

  const session = { role: ADMIN_ACCOUNT.role, name: ADMIN_ACCOUNT.name, email: ADMIN_ACCOUNT.email, at: Date.now() };
  write(KEYS.session, session);
  appendActivity('admin', 'Admin session started');

  return { ok: true, session };
}

export function getData() {
  const normalized = normalizeData(read(KEYS.data, seedData));
  write(KEYS.data, normalized);
  return normalized;
}

export function getSosLog() {
  const sos = read(KEYS.sosLog, []);
  const normalized = Array.isArray(sos) ? sos.map(normalizeSosEntry).sort((a, b) => b.at - a.at).slice(0, 50) : [];
  write(KEYS.sosLog, normalized);
  return normalized;
}

export async function syncSosLogFromRemote() {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return { synced: false };
  }

  try {
    const { data, error } = await supabase
      .from('sos_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return { synced: false, error };
    }

    const remoteRows = Array.isArray(data) ? data : [];
    const localRows = getSosLog();
    const merged = mergeSosLogs(localRows, remoteRows);
    write(KEYS.sosLog, merged);

    return { synced: true, count: merged.length };
  } catch (error) {
    return { synced: false, error };
  }
}

export function getRemoteUsersCount() {
  const value = Number(localStorage.getItem(KEYS.remoteUsersCount));
  return Number.isFinite(value) ? value : null;
}

export async function syncUsersFromRemote() {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return { synced: false };
  }

  const tables = ['profiles', 'users'];
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      if (error) {
        continue;
      }

      const normalizedCount = Number(count);
      if (Number.isFinite(normalizedCount)) {
        localStorage.setItem(KEYS.remoteUsersCount, String(normalizedCount));
        return { synced: true, count: normalizedCount, table };
      }
    } catch {
      // Try next table.
    }
  }

  return { synced: false };
}

export function getActivity() {
  const activity = read(KEYS.activity, []);
  return Array.isArray(activity) ? activity : [];
}

export function appendActivity(actor, action) {
  const log = read(KEYS.activity, []);
  log.unshift({ actor, action, time: nowTime() });
  write(KEYS.activity, log.slice(0, 40));
}

export function addCenter({ name, capacity, status }) {
  const data = getData();
  data.centers.unshift({ id: Date.now(), name, capacity, status, eta: 'TBD' });
  data.lastUpdated = Date.now();
  write(KEYS.data, data);
  appendActivity('admin', `Added center: ${name}`);
}

export function addRoute({ from, to, distanceKm, etaMin, risk }) {
  const data = getData();
  data.routes.unshift({ id: `R-${String(Date.now()).slice(-4)}`, from, to, distanceKm, etaMin, risk });
  data.lastUpdated = Date.now();
  write(KEYS.data, data);
  appendActivity('admin', `Added route: ${from} to ${to}`);
}

export function addAnnouncement({ title, body }) {
  const data = getData();
  data.announcements.unshift({ id: Date.now(), title, body, at: Date.now() });
  data.lastUpdated = Date.now();
  write(KEYS.data, data);
  appendActivity('admin', `Sent alert: ${title}`);

  void persistRemoteInsert('announcements', [
    {
      title,
      body,
      created_at: new Date().toISOString()
    }
  ]);
}

export function addSOS({ name, location, lat, lng, accuracy, locationSource, method, message }) {
  const sos = getSosLog();
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);
  sos.unshift({
    name,
    location,
    lat: hasPin ? lat : null,
    lng: hasPin ? lng : null,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    locationSource: locationSource || 'fallback',
    status: 'Active',
    method,
    message,
    at: Date.now()
  });
  write(KEYS.sosLog, sos.slice(0, 50));
  appendActivity('user', `SOS sent via ${method}${hasPin ? ` at ${lat.toFixed(5)}, ${lng.toFixed(5)}` : ''}`);

  void persistRemoteInsert('sos_requests', [
    {
      name,
      location,
      method,
      message,
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ]);
}

export function formatLastUpdated(ts) {
  const dt = new Date(ts);
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function performSyncIfOnline() {
  if (!navigator.onLine) {
    return { synced: false };
  }

  void flushPendingRemoteWrites();

  const data = getData();
  data.lastUpdated = Date.now();
  if (Math.random() > 0.6) {
    data.announcements.unshift({
      id: Date.now(),
      title: 'Auto Update',
      body: 'Latest flood depth and route confidence data synced.',
      at: Date.now()
    });
  }
  write(KEYS.data, data);
  appendActivity('system', 'Online sync completed');

  return { synced: true, lastUpdated: data.lastUpdated };
}

export function summarizeSystem() {
  const users = read(KEYS.users, []);
  const sos = getSosLog();
  const data = getData();
  const remoteUsersCount = getRemoteUsersCount();

  return {
    activeUsers: Number.isFinite(remoteUsersCount) ? remoteUsersCount : users.length,
    recentSos: sos.filter((x) => x.status === 'Active').length,
    centers: data.centers.length,
    criticalZones: data.floodZones.filter((z) => z.level === 'High').length
  };
}
