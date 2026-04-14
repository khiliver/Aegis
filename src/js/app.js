import 'leaflet/dist/leaflet.css';
import {
  addAnnouncement,
  addCenter,
  addRoute,
  addSOS,
  clearSession,
  getActivity,
  getData,
  getSession,
  getSosLog,
  getTheme,
  initStorage,
  loginAdmin,
  loginUser,
  performSyncIfOnline,
  registerUser,
  summarizeSystem,
  toggleTheme
} from './state.js';
import { renderMaps } from './map.js';
import {
  adminDashboardScreen,
  adminLoginScreen,
  authScreen,
  guideScreen,
  homeScreen,
  navigateScreen,
  scanScreen,
  sosScreen
} from './templates.js';

const appRoot = document.getElementById('app-root');
const toast = document.getElementById('toast');
const MAP_STYLE_KEY = 'aegis.mapStyle';
const MAP_STYLES = ['street', 'terrain', 'dark'];
const DEFAULT_LOCATION = {
  lat: 13.1294,
  lng: 123.7462,
  accuracy: null,
  at: Date.now(),
  source: 'fallback'
};

let gpsWatchId = null;

function getSavedMapStyle() {
  const saved = localStorage.getItem(MAP_STYLE_KEY);
  return MAP_STYLES.includes(saved) ? saved : 'street';
}

function nextMapStyle(current) {
  const index = MAP_STYLES.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % MAP_STYLES.length;
  return MAP_STYLES[nextIndex];
}

function showFatal(message) {
  const host = appRoot || document.body;
  host.innerHTML = `
    <section style="font-family: system-ui, sans-serif; max-width: 720px; margin: 24px auto; padding: 16px; border: 1px solid #fecaca; background: #fff1f2; color: #7f1d1d; border-radius: 12px;">
      <h2 style="margin: 0 0 8px;">Aegis failed to load</h2>
      <p style="margin: 0 0 8px;">A runtime error prevented rendering.</p>
      <pre style="white-space: pre-wrap; margin: 0; font-size: 13px;">${String(message || 'Unknown error')}</pre>
    </section>
  `;
}

const state = {
  screen: 'login',
  session: null,
  theme: getTheme(),
  mapStyle: 'street',
  userLocation: { ...DEFAULT_LOCATION },
  routeRecommendation: null,
  locationError: '',
  authMode: 'login',
  errors: {
    login: '',
    signup: '',
    admin: ''
  },
  safetyStatus: 'Safe',
  guideTab: 'before',
  isOnline: navigator.onLine,
  data: null,
  sosLog: [],
  activity: [],
  stats: null
};

function showToast(message) {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function canAccess(target) {
  if (['login', 'signup', 'admin-login'].includes(target)) {
    return true;
  }

  if (target === 'admin-dashboard') {
    return state.session?.role === 'admin';
  }

  const userScreens = ['home', 'navigate', 'scan', 'sos', 'guide'];
  if (userScreens.includes(target)) {
    return state.session?.role === 'user';
  }

  return false;
}

function navigate(target) {
  if (!canAccess(target)) {
    if (target === 'admin-dashboard') {
      state.screen = 'admin-login';
      state.errors.admin = 'Unauthorized access. Please sign in as admin.';
    } else {
      state.screen = 'login';
      state.errors.login = 'Please sign in first.';
    }
    render();
    return;
  }

  state.screen = target;
  state.errors.login = '';
  state.errors.signup = '';
  state.errors.admin = '';
  if (target === 'login' || target === 'signup') {
    state.authMode = 'login';
  }
  render();
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(a, b) {
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function updateRouteRecommendation() {
  const centers = (state.data?.centers || []).filter((center) => Number.isFinite(center?.lat) && Number.isFinite(center?.lng));
  if (!centers.length) {
    state.routeRecommendation = null;
    return;
  }

  const statusPriority = {
    Open: 0,
    Standby: 1,
    Full: 2
  };

  const userPoint = {
    lat: state.userLocation?.lat ?? DEFAULT_LOCATION.lat,
    lng: state.userLocation?.lng ?? DEFAULT_LOCATION.lng
  };

  const ranked = centers
    .map((center) => {
      const km = distanceKm(userPoint, { lat: center.lat, lng: center.lng });
      const priority = statusPriority[center.status] ?? 3;
      return { center, km, priority };
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.km - b.km;
    });

  const minVisibleRouteKm = 0.05;
  const nearest = ranked.find((item) => item.km >= minVisibleRouteKm) || ranked[0];

  const etaMin = Math.max(2, Math.round(nearest.km * 12));
  state.routeRecommendation = {
    center: nearest.center,
    distanceKm: nearest.km,
    etaMin,
    confidence: nearest.km <= 2.5 ? 'High' : nearest.km <= 5 ? 'Medium' : 'Low'
  };
}

function setUserLocation(position, source = 'gps') {
  state.userLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    at: Date.now(),
    source
  };
  state.locationError = '';
}

function startGpsTracking() {
  if (!navigator.geolocation || gpsWatchId !== null) {
    return;
  }

  gpsWatchId = navigator.geolocation.watchPosition(
    (position) => {
      setUserLocation(position);
      updateRouteRecommendation();
      renderMaps(state);
    },
    (error) => {
      state.locationError = error?.message || 'GPS unavailable';
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 12000
    }
  );
}

function requestGpsRefresh() {
  if (!navigator.geolocation) {
    showToast('GPS is not supported on this device.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation(position);
      showToast('GPS location updated.');
      render();
    },
    (error) => {
      showToast(error?.message || 'Unable to get GPS location.');
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000
    }
  );
}

function refreshData() {
  state.data = getData();
  state.sosLog = getSosLog();
  state.activity = getActivity();
  state.stats = summarizeSystem();
  updateRouteRecommendation();
}

function syncDataSilently() {
  const result = performSyncIfOnline();
  if (result?.synced) {
    refreshData();
  }
  return result;
}

function applyTheme() {
  state.theme = getTheme();
  document.body.classList.toggle('dark', state.theme === 'dark');
}

function render() {
  refreshData();

  const map = {
    login: authScreen,
    signup: authScreen,
    'admin-login': adminLoginScreen,
    home: homeScreen,
    navigate: navigateScreen,
    scan: scanScreen,
    sos: sosScreen,
    guide: guideScreen,
    'admin-dashboard': adminDashboardScreen
  };

  const builder = map[state.screen] || authScreen;
  if (!appRoot) {
    throw new Error('Missing #app-root element in HTML entry file.');
  }
  appRoot.innerHTML = builder(state);
  renderMaps(state);
}

async function onLogin(form) {
  const email = normalizeEmail(form.get('email'));
  const password = String(form.get('password') || '');

  if (!validEmail(email) || !password) {
    state.errors.login = 'Invalid email or password';
    render();
    return;
  }

  const result = await loginUser({ email, password });
  if (!result.ok) {
    state.errors.login = result.message;
    render();
    return;
  }

  state.session = result.session;
  state.screen = 'home';
  render();
}

async function onSignup(form) {
  const name = String(form.get('name') || '').trim();
  const email = normalizeEmail(form.get('email'));
  const role = String(form.get('role') || 'user');
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirmPassword') || '');

  if (!name || !validEmail(email) || password.length < 6 || password !== confirm) {
    state.errors.signup = 'Please provide valid details and matching passwords (minimum 6 characters).';
    render();
    return;
  }

  const res = await registerUser({ name, email, password, role });
  if (!res.ok) {
    state.errors.signup = res.message;
    render();
    return;
  }

  if (res.session) {
    state.session = res.session;
    state.screen = 'home';
    state.errors.login = '';
    state.errors.signup = '';
    showToast('Welcome! Account created and logged in.');
    render();
    startGpsTracking();
  } else {
    showToast('Account created. Please sign in.');
    state.screen = 'login';
    state.authMode = 'login';
    render();
  }
}

async function onAdminLogin(form) {
  const email = normalizeEmail(form.get('email'));
  const password = String(form.get('password') || '');

  if (!validEmail(email) || !password) {
    state.errors.admin = 'Invalid email or password';
    render();
    return;
  }

  const res = await loginAdmin({ email, password });
  if (!res.ok) {
    state.errors.admin = res.message;
    render();
    return;
  }

  state.session = res.session;
  state.screen = 'admin-dashboard';
  render();
}

function onSOS(form) {
  const message = String(form.get('message') || '').trim();
  const method = String(form.get('method') || 'SMS');

  addSOS({
    name: state.session?.name || 'Resident',
    location: 'Bagacay, Legazpi City',
    method,
    message
  });

  showToast(`SOS sent via ${method}. Location shared.`);
  render();
}

function onAddCenter(form) {
  const name = String(form.get('name') || '').trim();
  const capacity = Number(form.get('capacity'));
  const status = String(form.get('status') || 'Open');

  if (!name || !capacity) {
    showToast('Center name and capacity are required.');
    return;
  }

  addCenter({ name, capacity, status });
  showToast('Evacuation center added.');
  render();
}

function onAddRoute(form) {
  const from = String(form.get('from') || '').trim();
  const to = String(form.get('to') || '').trim();
  const distanceKm = Number(form.get('distanceKm'));
  const etaMin = Number(form.get('etaMin'));
  const risk = String(form.get('risk') || 'Low');

  if (!from || !to || !distanceKm || !etaMin) {
    showToast('Complete all route fields.');
    return;
  }

  addRoute({ from, to, distanceKm, etaMin, risk });
  showToast('Safe route added.');
  render();
}

function onAnnouncement(form) {
  const title = String(form.get('title') || '').trim();
  const body = String(form.get('body') || '').trim();

  if (!title || !body) {
    showToast('Title and message are required.');
    return;
  }

  addAnnouncement({ title, body });
  showToast('Alert sent to users.');
  render();
}

async function logout() {
  await clearSession();
  state.session = null;
  state.screen = 'login';
  state.errors.login = '';
  state.errors.signup = '';
  state.errors.admin = '';
  state.guideTab = 'before';
  showToast('Signed out successfully.');
  render();
}

function initListeners() {
  document.addEventListener('submit', async (event) => {
    const formEl = event.target;
    if (!(formEl instanceof HTMLFormElement)) {
      return;
    }

    event.preventDefault();
    const form = new FormData(formEl);
    const type = formEl.dataset.form;

    if (type === 'login') {
      await onLogin(form);
    }
    if (type === 'signup') {
      await onSignup(form);
    }
    if (type === 'admin-login') {
      await onAdminLogin(form);
    }
    if (type === 'sos') {
      onSOS(form);
    }
    if (type === 'add-center') {
      onAddCenter(form);
    }
    if (type === 'add-route') {
      onAddRoute(form);
    }
    if (type === 'announcement') {
      onAnnouncement(form);
    }
  });

  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const nav = target.closest('[data-nav]');
    if (nav instanceof HTMLElement) {
      navigate(nav.dataset.nav || 'login');
      return;
    }

    const tab = target.closest('[data-tab]');
    if (tab instanceof HTMLElement) {
      state.guideTab = tab.dataset.tab || 'before';
      render();
      return;
    }

    const actionEl = target.closest('[data-action]');
    if (!(actionEl instanceof HTMLElement)) {
      return;
    }

    const action = actionEl.dataset.action;
    if (action === 'toggle-theme') {
      state.theme = toggleTheme();
      applyTheme();
      render();
      return;
    }

    if (action === 'logout') {
      await logout();
      return;
    }

    if (action === 'simulate-sync') {
      const result = syncDataSilently();
      showToast(result.synced ? 'Online data sync completed.' : 'Offline, sync queued.');
      return;
    }

    if (action === 'cycle-map-style') {
      state.mapStyle = nextMapStyle(state.mapStyle);
      localStorage.setItem(MAP_STYLE_KEY, state.mapStyle);
      showToast(`Map style switched to ${state.mapStyle}.`);
      render();
      return;
    }

    if (action === 'refresh-gps') {
      requestGpsRefresh();
      return;
    }

    if (action === 'set-auth-mode') {
      const mode = actionEl.dataset.mode || 'login';
      state.authMode = mode;
      state.errors.login = '';
      state.errors.signup = '';
      render();
      return;
    }

    if (action === 'start-navigation') {
      showToast('Navigation started. Follow blue route to safe center.');
      return;
    }

    if (action === 'alternate-route') {
      showToast('Alternate route loaded: Route B, ETA 15 min.');
      return;
    }

    if (action === 'confirm-scan') {
      showToast('Safe zone confirmed. Guidance updated.');
      navigate('home');
    }
  });

  window.addEventListener('online', () => {
    state.isOnline = true;
    syncDataSilently();
    showToast('Connection restored. Data updated.');
  });

  window.addEventListener('offline', () => {
    state.isOnline = false;
    showToast('You are offline. Using cached emergency data.');
    render();
  });
}

function boot() {
  initStorage();
  applyTheme();
  state.mapStyle = getSavedMapStyle();
  startGpsTracking();
  state.session = getSession();
  state.isOnline = navigator.onLine;

  if (state.session?.role === 'admin') {
    state.screen = 'admin-dashboard';
  } else if (state.session?.role === 'user') {
    state.screen = 'home';
  } else {
    state.screen = 'login';
  }

  const syncResult = syncDataSilently();
  if (syncResult.synced) {
    showToast('Startup sync completed.');
  }

  render();
  initListeners();

  window.setInterval(() => {
    if (state.isOnline && state.session) {
      syncDataSilently();
    }
  }, 30000);
}

window.addEventListener('error', (event) => {
  showFatal(event.error?.message || event.message || 'Unhandled error');
});

window.addEventListener('unhandledrejection', (event) => {
  showFatal(event.reason?.message || String(event.reason));
});

try {
  boot();
} catch (error) {
  showFatal(error?.message || String(error));
}
