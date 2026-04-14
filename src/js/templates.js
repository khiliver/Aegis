import { formatLastUpdated } from './state.js';

function themeButton(theme) {
  const isDark = theme === 'dark';
  const title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const icon = isDark
    ? '<svg class="icon-btn__svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"></path></svg>'
    : '<svg class="icon-btn__svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z" fill="currentColor"></path></svg>';

  return `<button class="icon-btn" data-action="toggle-theme" title="${title}" aria-label="${title}">${icon}</button>`;
}

function logoutButton() {
  return '<button class="icon-btn" data-action="logout" title="Log out" aria-label="Log out">Log out</button>';
}

function mapStyleLabel(style) {
  if (style === 'terrain') {
    return 'Terrain';
  }
  if (style === 'dark') {
    return 'Dark';
  }
  return 'Street';
}

function locationStatus(state) {
  const point = state.userLocation;
  if (!point) {
    return {
      text: 'Waiting for GPS location',
      coords: '--'
    };
  }

  const source = point.source === 'gps' ? 'Live GPS' : 'Fallback location';
  const acc = Number.isFinite(point.accuracy) ? ` | Accuracy ${Math.round(point.accuracy)}m` : '';
  return {
    text: source + acc,
    coords: `${point.lat.toFixed(5)} N, ${point.lng.toFixed(5)} E`
  };
}

function shellHeader({ title, subtitle = '', left = '', actions = '' }) {
  return `
    <header class="header">
      <div class="header-row">
        <div>
          <div class="brand">${title}</div>
          ${subtitle ? `<p class="helper" style="color: rgba(255,255,255,0.82)">${subtitle}</p>` : ''}
        </div>
        <div class="row">${left}${actions}</div>
      </div>
    </header>
  `;
}

export function authScreen(state) {
  const isSignup = state.authMode === 'signup';
  const errorKey = isSignup ? 'signup' : 'login';
  const error = state.errors[errorKey] || '';

  return `
    <section class="screen active" data-screen="login">
      <div class="auth-wrap">
        <div class="auth-panel">
          <div class="auth-brand">
            <h1 class="auth-title">Aegis</h1>
            <p class="auth-subtitle">${isSignup ? 'Create your safe account' : 'Sign in to access your account'}</p>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
            <button class="btn ${isSignup ? 'ghost' : 'nav'}" style="width: 50%; cursor: pointer;" data-action="set-auth-mode" data-mode="login">Sign In</button>
            <button class="btn ${isSignup ? 'nav' : 'ghost'}" style="width: 50%; cursor: pointer;" data-action="set-auth-mode" data-mode="signup">Sign Up</button>
          </div>

          <form class="form" data-form="${isSignup ? 'signup' : 'login'}" novalidate>
            ${isSignup ? `
              <label class="label">Full Name
                <input class="input" name="name" type="text" placeholder="Juan Dela Cruz" autocomplete="name" required>
              </label>
            ` : ''}

            <label class="label">Email
              <input class="input" name="email" type="email" placeholder="name@email.com" autocomplete="email" required>
            </label>

            ${isSignup ? `
              <label class="label">Account Type
                <select class="select" name="role">
                  <option value="user" selected>Resident User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            ` : ''}

            <label class="label">Password
              <input class="input" name="password" type="password" placeholder="${isSignup ? 'Minimum 6 characters' : 'Enter password'}" autocomplete="${isSignup ? 'new-password' : 'current-password'}" required>
            </label>

            ${isSignup ? `
              <label class="label">Confirm Password
                <input class="input" name="confirmPassword" type="password" placeholder="Repeat password" autocomplete="new-password" required>
              </label>
            ` : ''}

            <p class="error">${error}</p>
            <button class="btn ${isSignup ? 'safe' : 'nav'}" type="submit">${isSignup ? 'Create Account' : 'Sign In'}</button>
          </form>

          <p class="helper" style="text-align: center; margin-top: 1.2rem;">Barangay official? <button class="link-btn" data-nav="admin-login">Admin login</button></p>
        </div>
      </div>
    </section>
  `;
}

export function adminLoginScreen(state) {
  return `
    <section class="screen active" data-screen="admin-login">
      <div class="auth-wrap">
        <div class="auth-panel">
          <div class="auth-brand">
            <h1 class="auth-title">Admin Access</h1>
            <p class="auth-subtitle">For barangay officials and local authorities only.</p>
          </div>

          <form class="form" data-form="admin-login" novalidate>
            <label class="label">Admin Email
              <input class="input" name="email" type="email" placeholder="admin@legazpi.gov.ph" required>
            </label>
            <label class="label">Password
              <input class="input" name="password" type="password" placeholder="Enter admin password" required>
            </label>
            <p class="error">${state.errors.admin || ''}</p>
            <button class="btn nav" type="submit">Secure Sign In</button>
          </form>

          <p class="helper">Return to user login: <button class="link-btn" data-nav="login">Back</button></p>
        </div>
      </div>
    </section>
  `;
}

function userNav(active) {
  const navs = [
    { key: 'home', icon: 'Home' },
    { key: 'navigate', icon: 'Route' },
    { key: 'scan', icon: 'Scan' },
    { key: 'sos', icon: 'SOS' }
  ];

  return `
    <nav class="bottom-nav">
      ${navs.map((n) => `<button class="nav-item ${active === n.key ? 'active' : ''}" data-nav="${n.key}"><span>${n.icon}</span></button>`).join('')}
    </nav>
  `;
}

export function homeScreen(state) {
  const data = state.data;
  const loc = locationStatus(state);
  return `
    <section class="screen active screen-main" data-screen="home">
      <div>
        ${shellHeader({
          title: 'Aegis',
          subtitle: `Welcome, ${state.session?.name || 'Resident'}`,
          actions: `${themeButton(state.theme)}${logoutButton()}`
        })}

        <main class="content stack">
          <div class="notice success">Offline-first cache is active. Last updated: ${formatLastUpdated(data.lastUpdated)}</div>
          <div class="notice ${state.isOnline ? '' : 'offline'}">${state.isOnline ? 'Online: checking for route updates automatically.' : 'Offline mode: using preloaded routes, centers, and emergency guide.'}</div>

          <div class="location-box">
            <div class="location-title">Current Location</div>
            <div class="location-value">${loc.text}</div>
            <div class="helper">${loc.coords}</div>
          </div>

          <div class="card">
            <div class="row">
              <div>
                <h3 class="card-title">Safety Status</h3>
                <p class="helper">Flood conditions monitored from synced city advisories.</p>
              </div>
              <span class="badge ${state.safetyStatus === 'Safe' ? 'safe' : 'alert'}">${state.safetyStatus}</span>
            </div>
          </div>

          <div class="btn-grid">
            <button class="btn nav" data-nav="navigate">Find Safe Route</button>
            <button class="btn danger" data-nav="sos">SOS</button>
            <button class="btn ghost" data-nav="guide">Emergency Guide</button>
            <button class="btn safe" data-nav="scan">Tap-to-Scan Safe Zone</button>
          </div>
        </main>
      </div>
      ${userNav('home')}
    </section>
  `;
}

export function navigateScreen(state) {
  const nearest = state.routeRecommendation;
  const style = mapStyleLabel(state.mapStyle);

  return `
    <section class="screen active screen-main" data-screen="navigate">
      <div>
        ${shellHeader({
          title: 'Safe Route Map',
          subtitle: 'Real-time location with offline route overlays',
          left: '<button class="icon-btn" data-nav="home" title="Back">Back</button>',
          actions: '<button class="icon-btn" data-action="simulate-sync" title="Sync">Sync</button>'
        })}

        <main class="content stack">
          <div class="card">
            <div class="row">
              <div>
                <h3 class="card-title">Recommended Center</h3>
                <p>${nearest?.center?.name || 'No center coordinates available'}</p>
                <p class="helper">Distance ${nearest ? nearest.distanceKm.toFixed(2) : '--'} km | ETA ${nearest?.etaMin || '--'} min | Route confidence: ${nearest?.confidence || '--'}</p>
              </div>
              <span class="badge info">Route A</span>
            </div>
          </div>

          <div class="map-full map-full--leaflet" aria-label="Evacuation map preview">
            <div class="map-label">Style ${style} | Blue user | Green center | Red flood zone</div>
            <div id="user-route-map" class="map-canvas" role="img" aria-label="Route map"></div>
          </div>

          <div class="btn-grid">
            <button class="btn nav" data-action="start-navigation">Start Navigation</button>
            <button class="btn ghost" data-action="cycle-map-style">Map Style: ${style}</button>
            <button class="btn ghost" data-action="refresh-gps">Use My GPS</button>
            <button class="btn ghost" data-action="alternate-route">View Alternate Routes</button>
          </div>
        </main>
      </div>
      ${userNav('navigate')}
    </section>
  `;
}

export function scanScreen() {
  return `
    <section class="screen active screen-main" data-screen="scan">
      <div>
        ${shellHeader({
          title: 'Tap-to-Scan Safe Zone',
          subtitle: 'Camera guidance works offline',
          left: '<button class="icon-btn" data-nav="home" title="Back">Back</button>'
        })}

        <main class="content stack">
          <div class="scan-area">
            <div class="scan-reticle"></div>
            <div class="scan-arrow up">Up</div>
            <div class="scan-arrow right">Right</div>
            <div class="scan-arrow down">Down</div>
            <div class="scan-arrow left">Left</div>
          </div>

          <div class="card">
            <h3 class="card-title">Safety Labels</h3>
            <p class="helper">Detected marker: Safe Zone 2, elevated building, flood-free access lane.</p>
          </div>

          <button class="btn safe" data-action="confirm-scan">Confirm Safe Zone</button>
        </main>
      </div>
      ${userNav('scan')}
    </section>
  `;
}

export function sosScreen(state) {
  return `
    <section class="screen active screen-main" data-screen="sos">
      <div>
        ${shellHeader({
          title: 'Emergency SOS',
          subtitle: 'Send location and pre-written emergency message',
          left: '<button class="icon-btn" data-nav="home" title="Back">Back</button>'
        })}

        <main class="content stack">
          <div class="notice offline">Use SMS or nearby device communication when internet is unavailable.</div>

          <div class="card">
            <h3 class="card-title">Location to Share</h3>
            <p>Bagacay, Legazpi City (14.1294 N, 123.7462 E)</p>
          </div>

          <form class="form" data-form="sos" novalidate>
            <label class="label">Emergency Message
              <textarea class="textarea" name="message">Need immediate assistance due to flooding. Sharing my current location now.</textarea>
            </label>
            <label class="label">Send Method
              <select class="select" name="method">
                <option value="SMS">SMS</option>
                <option value="Nearby Device">Nearby Device Communication</option>
              </select>
            </label>
            <button class="btn danger" type="submit">Send SOS Now</button>
          </form>

          <div class="card">
            <h4 class="card-title">Recent SOS Log</h4>
            <p class="helper">${state.sosLog.length} record(s) stored locally for responders.</p>
          </div>
        </main>
      </div>
      ${userNav('sos')}
    </section>
  `;
}

export function guideScreen(state) {
  const tab = state.guideTab;
  const sections = {
    before: [
      'Prepare a go-bag with food, medicine, flashlight, and IDs.',
      'Save offline map data and verify nearest evacuation center.',
      'Coordinate family meeting points and emergency contacts.'
    ],
    during: [
      'Follow the highlighted safe route and avoid moving water.',
      'Use SOS if trapped or injured.',
      'Move to higher ground immediately when water rises rapidly.'
    ],
    after: [
      'Return only after official clearance.',
      'Boil water and inspect electrical lines before using appliances.',
      'Report hazards and request aid through barangay channels.'
    ]
  };

  return `
    <section class="screen active screen-main" data-screen="guide">
      <div>
        ${shellHeader({
          title: 'Emergency Guide',
          subtitle: 'Always available offline',
          left: '<button class="icon-btn" data-nav="home" title="Back">Back</button>'
        })}

        <main class="content stack">
          <div class="notice success">Last guide sync: ${formatLastUpdated(state.data.lastUpdated)}</div>

          <div class="tabs">
            <button class="tab ${tab === 'before' ? 'active' : ''}" data-tab="before">Before</button>
            <button class="tab ${tab === 'during' ? 'active' : ''}" data-tab="during">During</button>
            <button class="tab ${tab === 'after' ? 'active' : ''}" data-tab="after">After</button>
          </div>

          <div class="timeline">
            ${sections[tab].map((item) => `<div class="timeline-item"><strong>${tab.toUpperCase()}</strong>${item}</div>`).join('')}
          </div>
        </main>
      </div>
      ${userNav('home')}
    </section>
  `;
}

export function adminDashboardScreen(state) {
  const stats = state.stats;
  const style = mapStyleLabel(state.mapStyle);

  return `
    <section class="screen active" data-screen="admin-dashboard">
      ${shellHeader({
        title: 'Admin Dashboard',
        subtitle: 'Barangay emergency operations and control center',
        actions: `${themeButton(state.theme)}${logoutButton()}`
      })}

      <main class="content stack">
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-value">${stats.activeUsers}</div><div class="kpi-label">Active Users</div></div>
          <div class="kpi"><div class="kpi-value">${stats.recentSos}</div><div class="kpi-label">Recent SOS Alerts</div></div>
          <div class="kpi"><div class="kpi-value">${stats.centers}</div><div class="kpi-label">Evacuation Centers</div></div>
          <div class="kpi"><div class="kpi-value">${stats.criticalZones}</div><div class="kpi-label">Critical Zones</div></div>
        </div>

        <div class="card">
          <h3 class="card-title">Map View: Incidents and Shared Locations</h3>
          <div class="row" style="margin-bottom: 0.6rem;">
            <p class="helper">Shared user locations and reported incidents</p>
            <button class="btn ghost" style="width: auto; padding: 0.55rem 0.8rem;" data-action="cycle-map-style">Map Style: ${style}</button>
          </div>
          <div class="map-full map-full--leaflet" style="height: 260px;">
            <div class="map-label">Style ${style} | Incident overview</div>
            <div id="admin-incident-map" class="map-canvas" role="img" aria-label="Incident map"></div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Manage Evacuation Centers and Safe Routes</h3>
          <form class="form" data-form="add-center" novalidate>
            <label class="label">Center Name
              <input class="input" name="name" placeholder="Center name" required>
            </label>
            <label class="label">Capacity
              <input class="input" type="number" name="capacity" placeholder="Capacity" required>
            </label>
            <label class="label">Status
              <select class="select" name="status"><option>Open</option><option>Standby</option><option>Full</option></select>
            </label>
            <button class="btn safe" type="submit">Add Center</button>
          </form>

          <form class="form" data-form="add-route" novalidate>
            <label class="label">From
              <input class="input" name="from" placeholder="Barangay / point" required>
            </label>
            <label class="label">To
              <input class="input" name="to" placeholder="Evacuation center" required>
            </label>
            <div class="btn-grid">
              <input class="input" name="distanceKm" type="number" step="0.1" placeholder="Distance km" required>
              <input class="input" name="etaMin" type="number" placeholder="ETA min" required>
            </div>
            <label class="label">Risk
              <select class="select" name="risk"><option>Low</option><option>Medium</option><option>High</option></select>
            </label>
            <button class="btn nav" type="submit">Add Safe Route</button>
          </form>
        </div>

        <div class="card">
          <h3 class="card-title">Notification and Announcement</h3>
          <form class="form" data-form="announcement" novalidate>
            <label class="label">Title
              <input class="input" name="title" placeholder="Advisory title" required>
            </label>
            <label class="label">Message
              <textarea class="textarea" name="body" placeholder="Write alert for residents" required></textarea>
            </label>
            <button class="btn danger" type="submit">Send Alert to Users</button>
          </form>
        </div>

        <div class="card">
          <h3 class="card-title">Report Log: SOS and User Activity</h3>
          <table class="table">
            <thead>
              <tr><th>Actor</th><th>Activity</th><th>Time</th></tr>
            </thead>
            <tbody>
              ${state.activity.slice(0, 8).map((row) => `<tr><td>${row.actor}</td><td>${row.action}</td><td>${row.time}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </main>
    </section>
  `;
}
