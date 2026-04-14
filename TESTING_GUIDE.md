# Aegis Prototype - Quick Navigation Guide

## File Location
```
c:\Users\User\AEGIS\prototype.html
```

**To View:** Double-click the HTML file or drag to your browser

---

## 🔐 Authentication Flows

### User Login (Default)
```
Screen: Login
Email:    test@email.com
Password: password
Click:    "Sign In"
Result:   → Home Screen
```

### New User Registration
```
Screen: Login
Click:  "Sign Up" link
→ Sign Up Form
Name:                Juan Dela Cruz
Email:               user@example.com
Password:            mypassword
Confirm Password:    mypassword
Click:               "Create Account"
Result:              → Home Screen (Auto-logged in)
```

**Error Examples to Try:**
- Invalid email format: `notanemail`
- Password too short: `123`
- Passwords don't match: Password `secret` vs Confirm `different`
- Missing fields: Leave any blank and click Create

### Admin Access
```
Screen: Login
Click:  "Access Admin Panel" button
→ Admin Login
Email:    admin@barangay.gov.ph
Password: admin123
Click:    "Admin Sign In"
Result:   → Admin Dashboard
```

---

## 👤 User Dashboard Features

### Home Screen Actions
```
Location Card        → Shows: 14.1234° N, 123.7536° E
Last Updated Badge   → Shows offline sync status
Safety Status        → Current: Safe (Green)
Offline Indicator    → Only shows when no internet

Buttons:
[🗺️ Find Safe Route]  → Goes to Navigation screen
[🆘 SOS]              → Emergency alert screen
[📖 Emergency Guide]  → Offline instructions
```

### Test Dark Mode
1. Click moon icon (🌙) in top right
2. Background changes from light to dark
3. Setting persists on page reload

---

## 🗺️ Navigation & Routes

### Route Finder Screen
```
Click: "Find Safe Route" from Home

See:
- Destination: Legazpi National High School
- Distance: 2.5 km away • 12 min by car
- Interactive map with:
  * Blue dot (your location)
  * Green marker (evacuation center)
  * Red marker (danger zone)
  * Blue path (safe route)

Actions:
[▶️ Start Navigation]   → Shows navigation prompt
[🔄 Alternate Routes]   → Lists 3 route options
[📞 Call Emergency]     → Contacts display
[📤 Share Location]     → Confirmation message
```

### Camera Scan Screen
```
Click: 🔍 Scan button (bottom nav)

See:
- Full-screen camera frame (dark overlay)
- 4 directional arrows (pointing camera)
- Green animated scan box in center
- Step-by-step instructions

Actions:
[✓ Confirm Location]   → Locks in safe zone
[Cancel]                → Back to home

Try: Point arrows in different directions to see changes
```

---

## 🆘 Emergency SOS

### Sending Emergency Alert
```
Click: 🆘 SOS (bottom nav or Home)

Fill:
- Message: (Optional) Pre-filled with default
- "Need help! Stuck in flooded area. Sending location."

Choose Send Method:
[📱 Emergency SMS]      → Text-based emergency
[📡 Nearby Device]      → Peer-to-peer (offline capable)

Pre-filled Contacts Shown:
- 🚒 BFP (Fire):  09XX-XXX-XXXX
- 🚨 PNP (Police): 09XX-XXX-XXXX
- 🏥 Hospital:     09XX-XXX-XXXX

Click: [🆘 SEND SOS NOW]
Result: Confirmation + Auto-return to Home
```

---

## 📖 Emergency Guide (Offline)

### Access Guide
```
Click: 📖 Emergency Guide (Home screen)

Three Tabs:
```

### BEFORE FLOOD Tab
```
Checklist:
✓ Prepare emergency kit with water, food, medicine
✓ Know evacuation routes and centers
✓ Inform family members of your plan
✓ Store important documents in waterproof bag
✓ Check flood status regularly via Aegis
✓ Keep vehicle fuel tank at least half full
```

### DURING FLOOD Tab
```
Action Items:
⚡ Evacuate immediately when warned
⚡ Do NOT cross flooded streets
⚡ Stay tuned to official announcements
⚡ Keep family together
⚡ Use designated evacuation routes
⚡ Send SOS if stranded (tap 🆘 button)
⚡ Turn off utilities (gas, electricity) if time permits
```

### AFTER FLOOD Tab
```
Recovery Steps:
✓ Return home only when declared safe
✓ Document property damage with photos
✓ Clean and disinfect all surfaces
✓ Check for structural damage
✓ Dispose contaminated items properly
✓ Apply for government assistance if needed
✓ Monitor health of family and livestock
```

### Emergency Calls
```
Bottom of Guide:
[🚨 Call 911 - Police]      → Simulates emergency call
[🚒 Call 122 - Fire]         → Simulates fire dept
[🏥 Call 143 - Medical]      → Simulates ambulance
```

---

## ⚙️ Admin Dashboard

### Accessing Admin
```
From Login Screen:
Click: "Access Admin Panel"
Enter: admin@barangay.gov.ph / admin123
```

### Dashboard Overview

**Stats Grid Shows:**
```
┌─────────────┬──────────────┐
│ 247         │ 8            │
│ Active Users│ SOS Alerts   │
├─────────────┼──────────────┤
│ 5           │ 2            │
│ Safe Centers│ Critical Areas
└─────────────┴──────────────┘
```

### Admin Tabs

#### Overview Tab
```
System Status:
✓ All servers online
✓ Data sync: Real-time
✓ Alert system: Active
⚠️ 3 users in critical zones

Map View:
Interactive map showing flood zones in Legazpi
```

#### Alerts Tab
```
Recent SOS Alerts List:
- Juan Dela Cruz (Bagacay • 5 min ago) [Active]
- Maria Santos (Rawis • 12 min ago) [Responded]
- Pedro Garcia (Legazpi Proper • 28 min ago) [Resolved]

Each row shows status badge indicating response level
```

#### Management Tab
```
Evacuation Centers:
✓ Legazpi National High School (Capacity: 500)
✓ Barangay Hall Bagacay (Capacity: 200)

Actions:
[➕ Add Evacuation Center]  → Modal form for new center
[📢 Send Announcement]     → Broadcast to all users
```

### Add Evacuation Center Modal
```
Click: [➕ Add Evacuation Center]

Form:
Center Name:  [             ]  e.g., School Name
Capacity:     [             ]  e.g., 500
Location:     [             ]  Coordinates or address

Actions:
[Save Center]   → Saves and closes modal
[Cancel]        → Closes without saving
```

### Send Announcement Modal
```
Click: [📢 Send Announcement]

Form:
Title:   [                    ]  Announcement title
Message: [                    ]  Full announcement text
         [                    ]  (Text area - multi-line)

Actions:
[Send to All Users]  → Broadcasts to everyone
[Cancel]             → Closes without sending
```

---

## 🎨 Visual Design Elements

### Color Meanings
```
🟢 GREEN (#10b981)   = Safe, approved, go
🔴 RED (#ef4444)     = Danger, emergency, stop
🔵 BLUE (#3b82f6)    = Navigation, information, action
```

### Status Badges
```
✓ Safe/Responded    = Green background, green text
⚠️ Alert/Active      = Red background, red text
```

### Offline Indicator
```
Appears When: No internet connection (DevTools > Network > Offline)
Message: "📡 Offline Mode - Using cached data"
Shows: User can continue using saved data
```

### Last Updated Badge
```
Always Visible: At top of content area
Format: "✓ Last updated: X minutes ago"
Purpose: Shows data freshness and sync status
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete User Journey
```
1. Open prototype.html
2. Signup with new credentials
3. Explore Home screen
4. Find safe route
5. View alternate routes
6. Check emergency guide
7. Send SOS alert
8. Logout (header icon)
```

**Expected Result:** Smooth navigation, all buttons responsive, return to login

### Scenario 2: Authentication Error Handling
```
1. Try login with:
   - Empty email
   - Invalid email format (no @)
   - Empty password
   - Correct email, wrong password
   
Expected: Each shows specific error message
```

### Scenario 3: Offline Functionality
```
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Try accessing different screens
5. Try sending SOS (should work - uses SMS)
6. Note "Offline Indicator" appears
7. Uncheck offline
8. Indicator disappears
```

### Scenario 4: Dark Mode Across Screens
```
1. Toggle dark mode (moon icon)
2. Navigate to each screen
3. Expected: Consistent dark styling everywhere
4. Reload page
5. Expected: Dark mode setting persists
```

### Scenario 5: Admin Workflow
```
1. Logout from user account
2. Access Admin Panel
3. View dashboard stats
4. Check recent alerts
5. Add new evacuation center
6. Send broadcast announcement
7. Admin logout (header icon)
```

**Expected Result:** Admin has full control, can manage users and centers

---

## 🔧 Troubleshooting

### Page Won't Load
- Check file path: `c:\Users\User\AEGIS\prototype.html`
- Try different browser (Chrome recommended)
- Disable browser extensions
- Clear browser cache (Ctrl+Shift+Delete)

### Buttons Not Working
- Make sure JavaScript is enabled in browser
- Check browser console for errors (F12 > Console)
- Try in incognito/private window

### Dark Mode Not Persisting
- Browser localStorage might be disabled
- Try another browser
- Check privacy settings

### Map Displays but Looks Wrong
- This is a mock map - it's intentionally simplified
- Real implementation would use Mapbox/Google Maps
- All interactive elements work as designed

---

## 📱 Best Viewing Practices

### Desktop Development Tools
```
F12                          → Open DevTools
Ctrl+Shift+M                 → Mobile device emulation
Device toolbar               → Toggle responsive design
Network throttle             → Simulate slow connection
Offline checkbox             → Test offline mode
```

### Recommended Screen Size
```
Mobile View: 375px x 812px (iPhone 12)
Tablet View: 768px x 1024px
Full Screen: Use F11 for immersive demo
```

---

## 📋 Feature Checklist

### User Features ✅
- [x] Login with validation
- [x] Signup with password confirmation
- [x] Home dashboard with location & status
- [x] Real-time safe route finder
- [x] Interactive map with markers
- [x] Camera scan interface
- [x] Emergency SOS with multiple methods
- [x] Offline emergency guide (Before/During/After)
- [x] Emergency contact quick-call
- [x] Dark mode support
- [x] Offline indicator
- [x] Last updated tracking

### Admin Features ✅
- [x] Secure admin authentication
- [x] Dashboard overview stats
- [x] SOS alerts management
- [x] Evacuation center management
- [x] Add new centers
- [x] Broadcast announcements
- [x] Activity logging
- [x] User analytics

### Design Features ✅
- [x] Mobile-first responsive
- [x] High contrast colors
- [x] Large touch targets
- [x] Clear error messages
- [x] Accessibility support
- [x] Dark/light mode
- [x] Emergency context design
- [x] Offline-first approach

---

## 🚀 Next Steps for Production

1. **Backend Integration**: Connect to real API
2. **Database**: Add PostgreSQL/MongoDB
3. **Real Maps**: Integrate Mapbox or Google Maps API
4. **SMS Gateway**: Twilio integration for actual SMS
5. **Push Notifications**: Firebase for real alerts
6. **Authentication**: OAuth2/JWT tokens
7. **App Deployment**: App Store & Play Store
8. **Analytics**: User behavior tracking
9. **Multi-Language**: Tagalog support
10. **Performance**: Optimize for slow networks

---

**Last Updated:** 2024  
**Prototype Status:** Production-Ready for Presentation
