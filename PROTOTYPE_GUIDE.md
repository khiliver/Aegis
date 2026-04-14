# Aegis: Offline Evacuation Route Finder - UI Prototype

## Overview

This is a high-fidelity, interactive mobile-first UI prototype for **Aegis**, a disaster response application designed for residents of Legazpi City to navigate safely to evacuation centers during flood events, even without internet connectivity.

## Quick Start

### Opening the Prototype
1. Locate the file: `prototype.html` in the project root
2. Double-click to open in your default browser, or
3. Right-click → "Open with" → Select your web browser

**Best viewed on desktop with developer tools collapsed (F12 → toggle device toolbar for mobile view)**

---

## Demo Credentials

### User Account
- **Email:** `test@email.com`
- **Password:** `password`

### Admin Account  
- **Email:** `admin@barangay.gov.ph`
- **Password:** `admin123`

---

## Feature Set

### 🔐 Authentication System

#### Login Screen
- Email and password validation
- Real-time error messaging
- "Invalid email or password" feedback for failed attempts
- Sign Up link for new users
- Admin login access link

#### Sign Up Screen
- Name field (required)
- Email field with format validation
- Password field with minimum 6-character requirement
- Confirm password with match validation
- Clear error messages for each field
- Automatic redirect to Home after successful registration

#### Admin Login Screen
- Secured with different credentials than users
- Role-based authentication
- Direct access to admin dashboard

---

### 👤 User Features

#### Home Screen
- **Current Location Display**: Shows latitude/longitude and human-readable address
- **Safety Status Badge**: Real-time safety indicator (Safe/Alert)
- **Last Updated**: Offline sync timestamp showing data freshness
- **Offline Indicator**: Visible when device is in offline mode
- **Quick Action Buttons**:
  - 🗺️ Find Safe Route
  - 🆘 SOS Emergency Alert
  - 📖 Emergency Guide
- **Flood Status Summary**: Quick overview of area conditions

#### Navigation/Routes Screen
- **Real-time Map Display**: Interactive map showing:
  - User current location (blue marker 👤)
  - Evacuation centers (green marker 🏫)
  - Danger zones (red marker ⚠️)
  - Safe route (highlighted path)
- **Route Details Card**:
  - Destination details
  - Distance and time estimate
  - Route status (Clear/Caution/Blocked)
  - Traffic conditions
- **Navigation Controls**:
  - Start Navigation button
  - Alternate Routes option
  - Emergency Call quick action
  - Share Location option

#### Camera-Based Scan Screen
- **Full-Screen Camera Interface**: Mimics real-time camera scanning
- **Directional Arrows**: Shows which direction to point camera
- **Animated Scan Indicator**: Visual feedback for scanning
- **Instructions**: Step-by-step guidance for users
- **Confirm Location**: Locks in the safe zone

#### SOS Emergency Alert Screen
- **Alert Location**: Auto-populated with user coordinates
- **Message Composition**: Text area for custom emergency messages
- **Pre-filled Contacts**: Quick display of emergency hotlines
- **Multiple Send Methods**:
  - Emergency SMS (works offline)
  - Nearby Device Communication (peer-to-peer)
- **Critical Alert Design**: Red color scheme emphasizes urgency

#### Emergency Guide (Offline-Accessible)
Three-tab interface:

**Before Flood:**
- Prepare emergency kit
- Know evacuation routes
- Store important documents
- Keep vehicle fueled
- Check flood status regularly

**During Flood:**
- Evacuate immediately
- Don't cross flooded streets
- Stay informed
- Use designated routes
- Send SOS if stranded

**After Flood:**
- Return only when safe
- Document damage
- Clean and disinfect
- Check structural integrity
- Access government assistance

**Emergency Contacts Tab:**
- Quick-call buttons for 911, 122 (Fire), 143 (Medical)

---

### ⚙️ Admin Dashboard

#### Dashboard Overview Tab
- **System Stats**:
  - Active Users (247)
  - Pending SOS Alerts (8)
  - Available Evacuation Centers (5)
  - Critical Areas (2)
- **System Status**: All components operational
- **Map Overview**: Visual representation of flood zones

#### Recent SOS Alerts Tab
- List of recent emergency calls
- User name and location
- Time of alert
- Current status (Active/Responded/Resolved)
- Quick-response interface

#### Management Tab
- **Evacuation Centers**: List of active safe zones
  - Center name
  - Capacity
  - Status indicator
- **Add Evacuation Center**: Modal form to add new centers
- **Send Announcement**: Broadcast alerts to all users

---

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Green (Safety) | #10b981 | Safe routes, confirmed actions, evacuation centers |
| Red (Danger) | #ef4444 | Emergency alerts, SOS, danger zones |
| Blue (Navigation) | #3b82f6 | Primary actions, navigation, information |
| Dark Background | #0f172a | Dark mode support |
| Light Background | #f8fafc | Light mode default |

### Typography
- **Font Family**: System fonts (Apple/Windows native)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Small text**: 12-13px for secondary info

### Components
- **Large Buttons**: 14px padding for emergency situations
- **High Contrast**: Text always readable on backgrounds
- **Clear Labels**: Every input and action clearly labeled
- **Visual Hierarchy**: Important info emphasized with size and color

---

## Offline-First Architecture Features

### Preloaded Data
✓ Evacuation routes cached locally
✓ Safe zone locations stored
✓ Emergency guides accessible without internet
✓ User profile data available

### Sync Indicator
- "Last updated: X minutes ago" always visible
- Shows data freshness
- Offline indicator appears when disconnected

### SMS Emergency (Offline Capable)
- SOS can be sent via SMS even without data
- Nearby device communication for peer-to-peer alerts
- Location data cached for immediate access

---

## Dark Mode Support

- **Toggle**: Moon icon (🌙) in header
- **Persistence**: Setting saved to browser localStorage
- **Full Support**: All screens and components theme-aware
- **High Contrast**: Maintained in both modes for accessibility

---

## Responsive Design

- **Mobile-First**: Optimized for 375px-480px width
- **Touch-Friendly**: Large tap targets (44px minimum)
- **Portrait Orientation**: Primary design orientation
- **Scrollable Content**: Bottom navigation always accessible

---

## Accessibility Features

- **Semantic HTML**: Proper markup structure
- **ARIA Labels**: Icon buttons include titles
- **Color + Text**: Don't rely on color alone
- **Clear Errors**: Specific, actionable error messages
- **Keyboard Navigation**: Tab through interactive elements (browser default)

---

## How to Use the Prototype

### For Presentation/Demo
1. Open in full-screen browser (F11 for maximum immersion)
2. Use mobile view (DevTools → Toggle device toolbar)
3. Click through all screens naturally
4. Interact with buttons and forms
5. Show the authentication flow
6. Demonstrate offline mode (DevTools → Network → Offline)

### Testing Scenarios

**Scenario 1: User Registration & Home**
1. Click "Sign Up" on login screen
2. Fill in demo details
3. Verify error handling with invalid data
4. Complete signup → lands on Home

**Scenario 2: Navigation Flow**
1. Click "Find Safe Route"
2. View interactive map with markers
3. Try "Start Navigation" and "Alternate Routes"
4. Return to Home

**Scenario 3: Emergency Response**
1. Click 🆘 SOS button
2. Write emergency message
3. Choose SMS or Device communication
4. Send and see confirmation

**Scenario 4: Offline Guide**
1. Click "Emergency Guide"
2. Switch between Before/During/After tabs
3. Show it's accessible offline
4. Call emergency numbers

**Scenario 5: Admin Access**
1. Return to Login
2. Click "Access Admin Panel"
3. Enter admin credentials
4. Show dashboard stats
5. Browse SOS alerts
6. Add evacuation center
7. Send announcement

---

## Technical Implementation

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Custom properties (variables), Grid, Flexbox, Animations
- **Vanilla JavaScript**: No framework dependencies

### Key Features
- **Local Storage**: Persists user session and dark mode preference
- **Responsive Grid**: Mobile-first layout system
- **Modal System**: Reusable modal component
- **Tab Interface**: Accessible tab switching
- **Form Validation**: Real-time field validation

### Browser Support
- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+

---

## Files in Project

```
AEGIS/
├── prototype.html          (Main interactive prototype - 2000+ lines)
├── README.md              (This file - Usage & feature documentation)
├── package.json           (Project metadata)
├── tsconfig.json          (TypeScript config)
└── src/
    ├── index.ts
    ├── index.js
    └── index.d.ts
```

---

## Future Enhancement Opportunities

1. **Real Map Integration**: Replace mock map with Mapbox/Google Maps
2. **Real-Time Alerts**: WebSocket connection for live updates
3. **Offline Database**: IndexedDB for larger data storage
4. **Camera Integration**: Actual device camera access
5. **SMS API**: Real SMS sending via Twilio or similar
6. **App Wrapper**: React Native or Flutter for mobile apps
7. **Backend API**: Node.js/Express for data persistence
8. **Database**: PostgreSQL or MongoDB for scalability
9. **User Analytics**: Track evacuation patterns
10. **Multi-Language**: Tagalog/English support for Philippines

---

## Design Principles Applied

✓ **Emergency Context**: Large buttons, clear warnings, quick actions
✓ **Offline First**: Data preloaded, works without connectivity
✓ **Dark Mode**: Reduces eye strain during stressful situations
✓ **Color Accessibility**: Green/Red/Blue for safety/danger/navigation
✓ **Minimal Cognitive Load**: Simple navigation, intuitive layout
✓ **Mobile Optimal**: Designed for portrait use on phones
✓ **Fast Loading**: No external dependencies, single HTML file
✓ **Secure**: Role-based access (User vs Admin)

---

## Notes for Developers

### Customization
- Modify colors in `:root` CSS variables
- Update demo credentials in login validation
- Change emergency numbers in Emergency Guide
- Add real API endpoints in JavaScript functions

### Testing
- Use browser DevTools Network tab to simulate offline
- Test on actual mobile devices for real experience
- Check console (F12 → Console) for demo credentials logged

### Performance
- Single HTML file = instant load
- No external resources needed
- ~50KB total size (HTML + CSS + JS combined)

---

## Support & Questions

This prototype demonstrates:
- ✅ Complete user authentication with validation
- ✅ Offline-first mobile design
- ✅ Real-time emergency response workflows
- ✅ Admin dashboard for authorities
- ✅ Dark mode and accessibility
- ✅ Multi-screen navigation
- ✅ Form validation and error handling
- ✅ Responsive mobile-first layout

For questions about implementation details or feature additions, refer to the inline JavaScript comments in the HTML file.

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Presentation & User Testing
