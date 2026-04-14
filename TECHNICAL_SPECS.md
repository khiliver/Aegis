# Aegis Prototype - Technical Specifications & Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Component Reference](#component-reference)
4. [API Integration Points](#api-integration-points)
5. [Data Models](#data-models)
6. [State Management](#state-management)
7. [Offline Features](#offline-features)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

### High-Level Design
```
┌─────────────────────────────────────────────────────┐
│                  Aegis UI Prototype                  │
├─────────────────────────────────────────────────────┤
│ Frontend Layer (HTML/CSS/JavaScript)                 │
│ ├─ Single Page Application (SPA)                     │
│ ├─ Screen-based navigation                           │
│ ├─ Client-side form validation                       │
│ └─ localStorage persistence                          │
├─────────────────────────────────────────────────────┤
│ Would Connect To:                                    │
│ ├─ REST API Backend (authentication, data)           │
│ ├─ Real-time Service (WebSocket for alerts)          │
│ ├─ Map Service (Mapbox/Google Maps)                  │
│ ├─ SMS Gateway (Twilio/Nexmo)                        │
│ └─ Database (PostgreSQL/MongoDB)                     │
└─────────────────────────────────────────────────────┘
```

### Technology Stack
```
HTML5 & CSS3        → Structure and styling
Vanilla JavaScript  → No framework required
localStorage        → Client-side persistence
CSS Grid/Flexbox    → Responsive layout
CSS Custom Props    → Theme variables
ES6+               → Modern JavaScript features
```

### Browser APIs Used
- `localStorage` - Persist user session and preferences
- `window.addEventListener` - Monitor online/offline status
- `document.querySelector` - DOM manipulation
- `classList` - Element class management

---

## File Structure

### Single-File Architecture
```
prototype.html (2000+ lines)
│
├── <head>
│   ├── Meta tags (viewport, charset)
│   └── <style> (2500+ lines CSS)
│       ├── Root variables (:root)
│       ├── Global styles (*, body, .container)
│       ├── Layout components (.screen, .header, .content)
│       ├── Form components (.form-input, .btn, .card)
│       ├── Feature-specific (.map-container, .camera-frame)
│       ├── Animations (@keyframes)
│       └── Media queries (@media)
│
└── <body>
    ├── .container (max-width: 480px)
    ├── 10x Screen divs (.screen)
    │   ├── [data-screen="login"]
    │   ├── [data-screen="signup"]
    │   ├── [data-screen="admin-login"]
    │   ├── [data-screen="home"]
    │   ├── [data-screen="navigate"]
    │   ├── [data-screen="scan"]
    │   ├── [data-screen="sos"]
    │   ├── [data-screen="emergency-guide"]
    │   └── [data-screen="admin-dashboard"]
    ├── .bottom-nav (navigation)
    ├── 2x Modals (.modal)
    │   ├── #add-center-modal
    │   └── #send-announcement-modal
    │
    └── <script> (600+ lines JavaScript)
        ├── Dark mode functions
        ├── Navigation (SPA routing)
        ├── Authentication (login/signup)
        ├── Validation (forms)
        ├── Modals
        ├── Feature implementations
        └── Event listeners
```

---

## Component Reference

### Screen Component
**Purpose:** Container for each view/page

```javascript
<div class="screen" data-screen="screen-name">
    <div class="header"><!-- Header content --></div>
    <div class="content"><!-- Main content --></div>
</div>
```

**Management:**
- Add `.active` class to show screen
- Remove `.active` class to hide
- Managed by `navigateTo()` function

**CSS Properties:**
```css
.screen {
    display: none;              /* Hidden by default */
    flex: 1;
    overflow-y: auto;
    padding-bottom: 60px;       /* Space for bottom nav */
}

.screen.active {
    display: flex;              /* Shown when active */
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
}
```

### Header Component
**Purpose:** Top navigation bar with title and actions

```html
<div class="header">
    <div class="header-title">
        <span>Title</span>
    </div>
    <div class="header-actions">
        <button class="icon-btn">🌙</button>
    </div>
</div>
```

**Styling:**
```css
.header {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    padding: 20px;
    border-bottom: 2px solid #1d4ed8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 18px;
}

.icon-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.3s;
}
```

### Card Component
**Purpose:** Data container with consistent styling

```html
<div class="card">
    <div class="location-label">Label</div>
    <div class="location-value">Value</div>
</div>
```

**Usage:**
- Information display
- Status updates
- Quick actions
- Location details

### Form Components
**Input Field:**
```html
<div class="form-group">
    <label class="form-label">Field Label</label>
    <input type="text" class="form-input" id="field-id">
    <div class="error-message" id="field-error"></div>
</div>
```

**Validation:**
```javascript
function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
    document.getElementById(elementId).classList.add('show');
}

function clearErrors(prefix) {
    document.querySelectorAll(`[id^="${prefix}"][id$="-error"]`)
        .forEach(el => el.classList.remove('show'));
}
```

### Button Component
**Types:**
```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-success">Safe Action</button>
<button class="btn btn-danger">Emergency Action</button>
<button class="btn btn-secondary">Secondary Action</button>
<button class="btn btn-sm">Small Button</button>
```

**CSS:**
```css
.btn {
    padding: 14px 20px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    width: 100%;
    margin-bottom: 10px;
}

.btn-primary {
    background: var(--primary-navigation);
    color: white;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
```

### Bottom Navigation
**Purpose:** Mobile navigation bar

```html
<div class="bottom-nav" id="bottom-nav">
    <button class="nav-item active" data-nav="home">
        <span>🏠</span>
        <span class="nav-item-label">Home</span>
    </button>
    <!-- More nav items -->
</div>
```

**JavaScript:**
```javascript
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item')
            .forEach(n => n.classList.remove('active'));
        item.classList.add('active');
    });
});
```

---

## API Integration Points

### Authentication Endpoint
**Current:** Client-side validation only (mock)
**Production:**

```javascript
// Login
POST /api/auth/login
{
    email: "user@example.com",
    password: "hashedPassword"
}

Response:
{
    success: true,
    token: "eyJhbGciOiJIUzI1NiIs...",
    user: {
        id: "user-uuid",
        email: "user@example.com",
        name: "John Doe",
        role: "user"
    }
}

// Signup
POST /api/auth/signup
{
    name: "John Doe",
    email: "john@example.com",
    password: "hashedPassword"
}
```

**Integration Example:**
```javascript
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigateTo('home');
        } else {
            showError('login-general-error', data.message);
        }
    } catch (error) {
        showError('login-general-error', 'Network error');
    }
}
```

### User Location Endpoint
**Purpose:** Get or update user's real-time location

```javascript
// Get location
GET /api/user/location

Response:
{
    latitude: 14.1234,
    longitude: 123.7536,
    address: "Barangay Bagacay, Legazpi City",
    accuracy: 10.5,  // meters
    timestamp: "2024-01-20T10:30:00Z"
}

// Update location
POST /api/user/location
{
    latitude: 14.1234,
    longitude: 123.7536,
    altitude: 75
}
```

### Evacuation Routes Endpoint
**Purpose:** Get safe routes for navigation

```javascript
// Get routes from current location to destination
GET /api/routes?from=14.1234,123.7536&to=14.1500,123.7600

Response:
{
    routes: [
        {
            id: "route-1",
            name: "Main Route",
            distance: 2.5,  // km
            duration: 12,   // minutes
            difficulty: "safe",  // safe, caution, blocked
            points: [
                { lat: 14.1234, lng: 123.7536 },
                { lat: 14.1300, lng: 123.7550 },
                // More points...
            ]
        }
    ]
}
```

### Evacuation Centers Endpoint
**Purpose:** Get list of safe evacuation zones

```javascript
// Get nearby evacuation centers
GET /api/evacuation-centers?lat=14.1234&lng=123.7536&radius=5

Response:
{
    centers: [
        {
            id: "center-1",
            name: "Legazpi National High School",
            latitude: 14.1500,
            longitude: 123.7600,
            capacity: 500,
            current_occupancy: 247,
            status: "operational",
            distance: 2.5,
            services: ["medical", "food", "shelter"]
        }
    ]
}
```

### SOS Alert Endpoint
**Purpose:** Send emergency alert to authorities

```javascript
// Send SOS
POST /api/sos/alert
{
    user_id: "user-uuid",
    latitude: 14.1234,
    longitude: 123.7536,
    message: "Need help! Stuck in flooded area.",
    method: "sms"  // "sms", "device", "api"
}

Response:
{
    success: true,
    alert_id: "sos-uuid",
    status: "dispatched",
    eta: 15  // minutes
}
```

### Flood Status Endpoint
**Purpose:** Get real-time flood warnings

```javascript
// Get flood status for location
GET /api/flood-status?lat=14.1234&lng=123.7536

Response:
{
    status: "safe",  // safe, alert, critical
    risk_level: 1,   // 1-5 scale
    zones: [
        {
            id: "zone-1",
            name: "Barangay Bagacay",
            status: "clear",
            water_level: 0.5,  // meters
            timestamp: "2024-01-20T10:30:00Z"
        }
    ]
}
```

### Admin Dashboard Endpoints
**Purpose:** Admin operations

```javascript
// Get dashboard stats
GET /api/admin/stats

Response:
{
    active_users: 247,
    sos_alerts: {
        active: 3,
        responded: 5,
        resolved: 120
    },
    evacuation_centers: 5,
    critical_areas: 2
}

// Get recent SOS alerts
GET /api/admin/sos-alerts?limit=10&status=all

// Add evacuation center
POST /api/admin/evacuation-centers
{
    name: "New Center",
    latitude: 14.1500,
    longitude: 123.7600,
    capacity: 500
}

// Send announcement
POST /api/admin/announcements
{
    title: "Flood Warning",
    message: "Heavy flooding reported in Barangay Bagacay",
    priority: "high"
}
```

---

## Data Models

### User Model
```javascript
{
    id: "user-uuid",
    name: "John Doe",
    email: "john@example.com",
    phone: "+63XXXXXXXXX",
    role: "user",  // "user" or "admin"
    latitude: 14.1234,
    longitude: 123.7536,
    address: "Barangay Bagacay, Legazpi City",
    family_members: 4,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T10:30:00Z",
    last_login: "2024-01-20T09:45:00Z"
}
```

### SOS Alert Model
```javascript
{
    id: "sos-uuid",
    user_id: "user-uuid",
    user_name: "John Doe",
    latitude: 14.1234,
    longitude: 123.7536,
    message: "Need help! Stuck in flooded area.",
    method: "sms",
    status: "dispatched",  // "sent", "dispatched", "responded", "resolved"
    responder_id: "admin-uuid",
    responder_name: "Admin Officer",
    priority: "high",
    created_at: "2024-01-20T10:30:00Z",
    resolved_at: null
}
```

### Evacuation Center Model
```javascript
{
    id: "center-uuid",
    name: "Legazpi National High School",
    description: "Large gymnasium and classrooms",
    latitude: 14.1500,
    longitude: 123.7600,
    capacity: 500,
    current_occupancy: 247,
    status: "operational",  // "operational", "full", "closed"
    address: "Legazpi City, Philippines",
    contact: "+63XXXXXXXXX",
    manager: "Ms. Maria Santos",
    services: ["medical", "food", "shelter", "water"],
    resources: {
        medical_staff: 5,
        food_supplies: "7 days",
        water: "5000 liters"
    },
    created_at: "2024-01-01T00:00:00Z"
}
```

### Route Model
```javascript
{
    id: "route-uuid",
    name: "Safe Route to Legazpi NHS",
    from: { lat: 14.1234, lng: 123.7536 },
    to: { lat: 14.1500, lng: 123.7600 },
    distance: 2.5,  // kilometers
    duration: 12,   // minutes
    difficulty: "safe",  // "safe", "caution", "blocked"
    status: "clear",
    waypoints: [
        { lat: 14.1234, lng: 123.7536 },
        { lat: 14.1300, lng: 123.7550 }
    ],
    last_updated: "2024-01-20T10:30:00Z"
}
```

### Flood Zone Model
```javascript
{
    id: "zone-uuid",
    name: "Barangay Bagacay",
    coordinates: {
        type: "polygon",
        points: [/* geo coordinates */]
    },
    status: "alert",  // "safe", "alert", "critical"
    risk_level: 3,    // 1-5
    water_level: 1.2, // meters
    flood_depth_trend: "rising",  // "stable", "rising", "falling"
    affected_population: 2500,
    evacuation_centers_nearby: 3,
    last_updated: "2024-01-20T10:30:00Z"
}
```

---

## State Management

### Using localStorage
**Current Implementation:**
```javascript
// Store user session
localStorage.setItem('user', JSON.stringify({
    email: 'test@email.com',
    name: 'Jane Doe'
}));

// Retrieve user session
const user = JSON.parse(localStorage.getItem('user'));

// Store preferences
localStorage.setItem('darkMode', 'true');

// Check authentication
if (localStorage.getItem('user')) {
    navigateTo('home');
} else {
    navigateTo('login');
}
```

### Production State Management
**Recommended Approach:**

```javascript
// Using Vuex/Redux pattern
const appState = {
    auth: {
        token: null,
        user: null,
        authenticated: false
    },
    location: {
        current: null,
        accuracy: null,
        lastUpdate: null
    },
    routes: [],
    alerts: [],
    evacuationCenters: [],
    floodStatus: null,
    preferences: {
        darkMode: false,
        notifications: true
    }
};

// Action creators
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        appState.auth.token = data.token;
        appState.auth.user = data.user;
        appState.auth.authenticated = true;
        
        return true;
    } catch (error) {
        return false;
    }
}

// Get state
function getAuthToken() {
    return appState.auth.token;
}

function isAuthenticated() {
    return appState.auth.authenticated;
}
```

---

## Offline Features

### Data Sync Strategy
```javascript
// On app initialization
async function initializeApp() {
    // Load cached data
    const cachedRoutes = localStorage.getItem('routes');
    const cachedGuides = localStorage.getItem('emergencyGuides');
    
    // Attempt sync with server
    if (navigator.onLine) {
        await syncDataWithServer();
    } else {
        // Use cached data
        displayOfflineIndicator();
    }
}

// Sync function
async function syncDataWithServer() {
    try {
        const [routes, guides, centers, status] = await Promise.all([
            fetch('/api/routes').then(r => r.json()),
            fetch('/api/guides').then(r => r.json()),
            fetch('/api/evacuation-centers').then(r => r.json()),
            fetch('/api/flood-status').then(r => r.json())
        ]);
        
        // Save to cache
        localStorage.setItem('routes', JSON.stringify(routes));
        localStorage.setItem('emergencyGuides', JSON.stringify(guides));
        localStorage.setItem('evacuationCenters', JSON.stringify(centers));
        localStorage.setItem('floodStatus', JSON.stringify(status));
        localStorage.setItem('lastSync', new Date().toISOString());
        
        hideOfflineIndicator();
    } catch (error) {
        console.log('Sync failed, using cached data');
        displayOfflineIndicator();
    }
}

// Monitor connection
window.addEventListener('online', syncDataWithServer);
window.addEventListener('offline', displayOfflineIndicator);
```

### IndexedDB for Large Data (Future)
```javascript
// Initialize IndexedDB for offline maps and routes
const dbRequest = indexedDB.open('aegis-offline', 1);

dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore('routes', { keyPath: 'id' });
    db.createObjectStore('maps', { keyPath: 'id' });
    db.createObjectStore('guides', { keyPath: 'id' });
};

// Store data
function saveRoute(route) {
    const transaction = db.transaction(['routes'], 'readwrite');
    const store = transaction.objectStore('routes');
    store.put(route);
}

// Retrieve data
function getRoute(id) {
    const transaction = db.transaction(['routes'], 'readonly');
    const store = transaction.objectStore('routes');
    return store.get(id);
}
```

### Service Worker (Future)
```javascript
// Register service worker for offline capability
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed'));
}

// sw.js
const CACHE_NAME = 'aegis-v1';
const urlsToCache = [
    '/',
    '/prototype.html',
    '/css/styles.css',
    '/js/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
```

---

## Security Considerations

### Authentication Security
```javascript
// ✓ Use HTTPS only in production
// ✓ Store JWT token securely
// ✓ Implement token refresh logic
// ✓ Validate on server side always

const API_URL = 'https://api.aegis.gov.ph'; // HTTPS only

function makeAuthenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}
```

### Data Privacy
```javascript
// ✓ User location shared only when necessary
// ✓ SOS data encrypted in transit
// ✓ Admin logs all data access
// ✓ Regular backups

// Sensitive data handling
function handleUserLocation(lat, lng) {
    // Only send when user explicitly shares
    if (user.locationSharing) {
        sendLocationToServer(lat, lng);
    }
}

// Encryption function
async function encryptData(data, publicKey) {
    const encoder = new TextEncoder();
    const encryptedData = await crypto.subtle.encrypt(
        publicKey,
        encoder.encode(data)
    );
    return encryptedData;
}
```

### Admin Access Control
```javascript
// ✓ Role-based access control (RBAC)
// ✓ Two-factor authentication
// ✓ Audit logging for all admin actions
// ✓ Session timeout after inactivity

function checkAdminAccess(requiredRole) {
    const user = getCurrentUser();
    
    if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
    }
}

function logAdminAction(action, details) {
    fetch('/api/admin/audit-log', {
        method: 'POST',
        body: JSON.stringify({
            admin_id: getCurrentUser().id,
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        })
    });
}
```

### Form Validation
```javascript
// ✓ Client-side for UX
// ✓ Server-side for security

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 number, 1 special char
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(password);
}

// Server always validates independently
POST /api/auth/signup
{
    // Client validation passed, but server checks:
    // - Password requirements
    // - Email not already registered
    // - Phone number format
    // - No SQL injection attempts
}
```

---

## Development Workflow

### Adding a New Feature
1. Create new screen HTML
2. Add CSS styles
3. Implement JavaScript functions
4. Test navigation
5. Test validation and error handling
6. Test offline mode
7. Test dark mode

### Making API Calls
```javascript
// Always wrap in try-catch
async function fetchUserData() {
    try {
        const response = await fetch('/api/user/data', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Network response failed');
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        // Fall back to cache
        return JSON.parse(localStorage.getItem('userData'));
    }
}
```

### Testing Checklist
```
□ Login with valid/invalid credentials
□ Signup with various field combinations
□ Navigate to all screens
□ Test dark mode toggle
□ Test offline functionality
□ Test all buttons and forms
□ Check responsive design
□ Verify error messages
□ Test modal interactions
□ Browser compatibility (Chrome, Firefox, Safari, Edge)
```

---

## Performance Optimization Tips

1. **Minimize Network Requests**
   - Batch API calls
   - Use caching headers
   - Implement request debouncing

2. **Optimize Assets**
   - No external CSS/JS files
   - Inline critical CSS
   - Compress images if added

3. **Lazy Load Content**
   - Load routes on demand
   - Defer non-critical features
   - Paginate large lists

4. **Monitor Performance**
   - Use Lighthouse audit
   - Check Core Web Vitals
   - Monitor slow network (DevTools)

---

## Deployment

### Production Checklist
- [ ] Remove console logs and debug code
- [ ] Minify CSS/JavaScript
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Set up error logging (Sentry)
- [ ] Configure CDN for assets
- [ ] Enable gzip compression
- [ ] Set security headers
- [ ] Implement monitoring/alerting

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Development
