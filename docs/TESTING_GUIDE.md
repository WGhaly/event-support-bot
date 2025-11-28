# Testing Guide - Event Management Platform

## 🚀 Local Testing (CURRENT)

### Server Status
✅ Development server running at: **http://localhost:3000**

### Test Credentials

#### Super Admin Account
- **Email**: superadmin@luuj.com
- **Password**: SuperAdmin123!
- **Access**: Full platform control

#### Regular User Account
- **Email**: w@w.com
- **Password**: 12345678
- **Access**: Badge Creation module only

---

## 📋 Testing Checklist

### 1. Authentication Testing

#### Test Login Flow
- [ ] Visit http://localhost:3000
- [ ] Click "Sign In" or go to /auth/login
- [ ] Login with super admin credentials
- [ ] Verify redirect to dashboard
- [ ] Check navigation shows "Super Admin" link
- [ ] Logout
- [ ] Login with regular user (w@w.com)
- [ ] Verify no "Super Admin" link in navigation

#### Test Route Protection
- [ ] While logged out, try to access /dashboard (should redirect to login)
- [ ] While logged in as regular user, try /super-admin (should redirect to dashboard)
- [ ] While logged in as super admin, access /super-admin (should work)

---

### 2. Super Admin Portal Testing

Login as: **superadmin@luuj.com** / **SuperAdmin123!**

#### User Management (/super-admin/users)
- [ ] View list of all users
- [ ] Verify user table shows:
  - Name and email
  - Role badge (Super Admin, User)
  - Project counts
  - Status (Active/Disabled)
  - Join dates
- [ ] Click "Modules" button on regular user (w@w.com)
- [ ] See module assignment modal
- [ ] Toggle "Badge Creation" module off
- [ ] Close modal and verify change
- [ ] Toggle module back on
- [ ] Try to disable super admin account (should fail with error)

#### Admin Management (/super-admin/admins)
- [ ] View list of admin users
- [ ] Click "Create Admin" button
- [ ] Fill in form:
  - Email: testadmin@luuj.com
  - Name: Test Admin
  - Password: TestAdmin123!
  - Role: Administrator
- [ ] Submit and verify new admin appears in table
- [ ] Try to delete the new admin (should work)
- [ ] Try to delete super admin (button should not appear)

#### Module Management (/super-admin/modules)
- [ ] View module cards (Badge Creation, Attendee Management, Schedule Management)
- [ ] Verify Badge Creation shows as "Active"
- [ ] Verify user count shows correctly
- [ ] Toggle Badge Creation module off
- [ ] Toggle it back on
- [ ] Check that inactive modules show "Inactive" badge

---

### 3. Regular User Dashboard Testing

Logout and login as: **w@w.com** / **12345678**

#### Dashboard (/dashboard)
- [ ] Since user has only one module, should auto-redirect to Badge Creation
- [ ] OR if multiple modules assigned, see module grid
- [ ] Click on Badge Creation module card
- [ ] Should go to /dashboard/modules/badges

#### Badge Creation Module (/dashboard/modules/badges)
- [ ] View existing projects
- [ ] Click "New Project"
- [ ] Create a test project
- [ ] Upload a template
- [ ] Upload a CSV dataset
- [ ] Create field mappings
- [ ] Generate badges
- [ ] Download ZIP
- [ ] Verify all existing functionality works

---

### 4. Module Access Control Testing

Login as: **superadmin@luuj.com**

#### Test Module Disabling
1. Go to /super-admin/users
2. Click "Modules" on w@w.com
3. Disable "Badge Creation" module
4. Logout
5. Login as w@w.com
6. Dashboard should show "No Modules Available" message
7. Logout and login as super admin
8. Re-enable module for w@w.com

#### Test Global Module Toggle
1. Go to /super-admin/modules
2. Toggle "Badge Creation" OFF globally
3. Logout and login as w@w.com
4. Should see "No Modules Available"
5. Even with user-level module enabled, global toggle overrides
6. Logout, login as super admin, toggle back ON

---

### 5. Navigation Testing

#### Super Admin Navigation
- [ ] Logo links to /dashboard
- [ ] "Modules" link works
- [ ] "Super Admin" link visible and works
- [ ] User name displays correctly
- [ ] Sign out button works

#### Regular User Navigation  
- [ ] Logo links to /dashboard
- [ ] "Modules" link works
- [ ] No "Super Admin" link visible
- [ ] User name displays correctly
- [ ] Sign out button works

---

### 6. Database Verification

Open Prisma Studio to inspect database:
```bash
npm run db:studio
```

Check:
- [ ] 3 roles exist (super-admin, admin, user)
- [ ] 3 modules exist (badge-creation, attendee-management, schedule-management)
- [ ] Users have correct roleId
- [ ] UserModules table has correct relationships
- [ ] Badge Creation module is active
- [ ] Other modules are inactive

---

## 🐛 Known Issues to Watch For

### Potential Issues
1. **Middleware loops**: If redirects cause infinite loops
2. **Session issues**: If role not properly stored in JWT
3. **Module access**: If module check doesn't respect global toggle
4. **Link updates**: If any old /dashboard/projects links remain

### How to Debug
```bash
# Check server console for errors
# Look for [ZIP API] or auth logs

# Check browser console
# Press F12 and look for errors

# Check database state
npm run db:studio
```

---

## ✅ Success Criteria

### All Tests Pass When:
- [x] Super admin can access all portals
- [x] Regular users are restricted to dashboard
- [x] Module assignment works correctly
- [x] Admin creation/deletion works
- [x] Module toggle affects user access
- [x] Badge creation module still works perfectly
- [x] All navigation links are correct
- [x] No console errors
- [x] No infinite redirect loops

---

## 🚀 Next Steps After Local Testing

1. **Fix any issues found during testing**
2. **Update production environment variables**
3. **Create production migration plan**
4. **Deploy to Vercel**
5. **Test in production**
6. **Migrate existing users to new schema**

---

## 📝 Notes

- Logo should load correctly (fixed luuj-logo.png)
- ZIP download debugging logs still active (can remove later)
- SQLite for local, PostgreSQL for production
- All existing badge projects preserved
