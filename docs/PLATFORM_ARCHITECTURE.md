# Event Management Support Platform - Architecture

## Vision
Transform the current Badge Creation platform into a comprehensive Event Management Support Platform with multiple modules and role-based access control.

## System Architecture

### 1. User Roles & Permissions

#### Super Admin
- **Full Platform Control**
- Manage admins (create, edit, delete admin accounts)
- Manage users (view all users, enable/disable, assign module access)
- Manage modules (enable/disable globally or per-user)
- Access all modules

#### Admin
- **Limited Management**
- View users
- Configure module settings (limited)
- Access assigned modules

#### User
- **Standard Access**
- Access enabled modules only
- Manage own projects within modules

### 2. Module System

#### Current Module
1. **Badge Creation** (existing functionality)
   - Template management
   - Project creation
   - CSV import
   - Badge generation
   - Export management

#### Future Modules (Examples)
2. **Attendee Management**
   - Registration forms
   - Attendee database
   - Check-in system
   - Communication tools

3. **Schedule Management**
   - Event timeline
   - Session scheduling
   - Speaker management
   - Room assignments

4. **Venue Management**
   - Floor plans
   - Capacity tracking
   - Equipment management

5. **Analytics & Reporting**
   - Event metrics
   - Attendance reports
   - Custom dashboards

### 3. Database Schema Updates

#### New Tables

**roles**
```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique  // 'super-admin', 'admin', 'user'
  description String?
  permissions Json     // Flexible permissions object
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**modules**
```prisma
model Module {
  id          String   @id @default(cuid())
  name        String   @unique  // 'badge-creation', 'attendee-management', etc.
  displayName String   // 'Badge Creation', 'Attendee Management'
  description String?
  icon        String?  // Icon identifier
  route       String   // '/dashboard/modules/badges'
  isActive    Boolean  @default(true)  // Global on/off
  order       Int      @default(0)     // Display order
  userModules UserModule[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**userModules** (junction table)
```prisma
model UserModule {
  id        String   @id @default(cuid())
  userId    String
  moduleId  String
  isEnabled Boolean  @default(true)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  module    Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([userId, moduleId])
}
```

**Updated User Model**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  roleId        String    @default("user")  // Foreign key to Role
  role          Role      @relation(fields: [roleId], references: [id])
  isActive      Boolean   @default(true)
  userModules   UserModule[]
  projects      Project[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 4. Route Structure

```
/
├── /auth
│   ├── /login              # Public login
│   └── /signup             # Public registration
│
├── /dashboard              # User dashboard
│   ├── page.tsx            # Module selector/overview
│   └── /modules
│       ├── /badges         # Badge Creation module
│       │   ├── /projects
│       │   ├── /templates
│       │   └── /exports
│       ├── /attendees      # Future: Attendee Management
│       └── /schedule       # Future: Schedule Management
│
├── /admin                  # Admin dashboard
│   ├── /users              # User management (limited)
│   └── /settings           # Module settings
│
└── /super-admin            # Super Admin portal
    ├── /admins             # Admin management
    ├── /users              # User management
    └── /modules            # Module management
```

### 5. Middleware & Protection

#### Route Protection
```typescript
// middleware.ts updates
const publicRoutes = ['/auth/login', '/auth/signup', '/']
const userRoutes = ['/dashboard']
const adminRoutes = ['/admin']
const superAdminRoutes = ['/super-admin']

// Check role and redirect accordingly
if (superAdminRoute && user.role !== 'super-admin') {
  return NextResponse.redirect('/dashboard')
}
```

#### Module Access Check
```typescript
// Helper function
async function canAccessModule(userId: string, moduleName: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { 
      role: true,
      userModules: { include: { module: true } }
    }
  })
  
  // Super admins can access everything
  if (user.role.name === 'super-admin') return true
  
  // Check if module is enabled for user
  const userModule = user.userModules.find(
    um => um.module.name === moduleName && um.isEnabled
  )
  
  // Check if module is globally active
  const module = await db.module.findUnique({
    where: { name: moduleName }
  })
  
  return userModule && module?.isActive
}
```

### 6. Super Admin Portal Features

#### Admin Management
- List all admins
- Create new admin accounts
- Edit admin permissions
- Delete/deactivate admins
- Assign specific module access

#### User Management
- View all registered users (table with pagination)
- Search/filter users
- Enable/disable user accounts
- Assign modules to users (checkboxes)
- View user activity/statistics
- Bulk actions (enable modules for multiple users)

#### Module Management
- List all modules
- Global enable/disable toggle per module
- Reorder modules (drag-and-drop)
- Configure module settings
- View module usage statistics
- Add new modules (future: plugin system)

### 7. UI Components

#### Module Card (Dashboard)
```tsx
<ModuleCard
  name="Badge Creation"
  description="Create and manage event badges"
  icon={<BadgeIcon />}
  href="/dashboard/modules/badges"
  isEnabled={true}
/>
```

#### Permission Matrix (Super Admin)
```tsx
<PermissionMatrix
  users={allUsers}
  modules={allModules}
  onChange={(userId, moduleId, enabled) => updateUserModule()}
/>
```

### 8. Implementation Phases

#### Phase 1: Foundation (Week 1)
- ✅ Local development setup
- Database schema migration (roles, modules, userModules)
- Update User model with roleId
- Seed initial data (roles, modules)

#### Phase 2: Authentication & Middleware (Week 1)
- Update auth system with roles
- Implement role-based middleware
- Module access checking

#### Phase 3: Super Admin Portal (Week 2)
- Admin management UI & API
- User management UI & API
- Module management UI & API

#### Phase 4: Module Refactoring (Week 2)
- Restructure Badge Creation as module
- Update dashboard to show module grid
- Dynamic module loading

#### Phase 5: Testing & Deployment (Week 3)
- Local testing
- Update Vercel environment
- Production deployment

### 9. Database Seeding

Initial data to seed:

**Roles:**
- super-admin (full access)
- admin (limited management)
- user (standard access)

**Modules:**
- badge-creation (displayName: "Badge Creation", route: "/dashboard/modules/badges")

**First Super Admin:**
- Email: superadmin@luuj.com
- Role: super-admin
- All modules enabled

### 10. Security Considerations

- **Password Reset**: Add password reset for admin-created accounts
- **Audit Logs**: Track admin actions (who enabled/disabled what)
- **Session Management**: Invalidate sessions on role change
- **API Rate Limiting**: Prevent abuse of admin endpoints
- **2FA**: Optional two-factor authentication for admins

## Next Steps

1. Update Prisma schema
2. Create migrations
3. Seed initial data
4. Update authentication
5. Build Super Admin portal
6. Refactor Badge Creation module
7. Test locally
8. Deploy to production
