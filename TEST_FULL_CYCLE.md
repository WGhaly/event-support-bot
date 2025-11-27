# Full E2E Cycle Test Instructions

## Test Credentials
- **Email:** w@w.com
- **Password:** w

## Server Status
- **URL:** http://localhost:3000
- **Status:** Running on port 3000

## Test Steps

### 1. Login ✅
1. Open http://localhost:3000/auth/login
2. Enter credentials:
   - Email: w@w.com
   - Password: w
3. Click "Sign In"
4. Should redirect to http://localhost:3000/dashboard

### 2. Navigate to Project
1. From dashboard, click on any existing project
2. Or create a new project if none exist

### 3. Create/View Field Mapping
1. Go to "Field Mappings" tab
2. Click "Create New Mapping" OR view existing mapping
3. Select a template and dataset
4. Map fields (e.g., field-1 → name, field-2 → title, field-3 → company)
5. Save the mapping

### 4. Generate Badges
1. Go to "Exports" tab
2. Click "Generate Export" or "Generate Badges"
3. Select the field mapping created in step 3
4. Click "Generate"
5. Wait for badge generation to complete
6. Should see status change to "completed" with badge count

### 5. Download ZIP
1. From the completed export, click "View Details"
2. Click "Download All as ZIP" button
3. ZIP file should download with format: `{exportId}_badges.zip`
4. Extract ZIP file
5. Verify contents:
   - Multiple PNG badge files (one per dataset row)
   - manifest.json file with export metadata

### 6. Verify Params Fix  
1. During navigation, check browser console
2. Should see NO warnings about `params.id` or async params
3. All pages should load without Next.js deprecation warnings

## Expected Results

### ✅ Login
- Successful authentication
- Redirect to dashboard
- Session created

### ✅ Badge Generation
- Badges created successfully
- Export shows "completed" status
- Badge count matches dataset rows

### ✅ ZIP Download
- ZIP file downloads successfully
- Contains all generated badges
- Includes manifest.json
- All files are valid PNGs

### ✅ No Params Warnings
- No console warnings about direct params access
- NewMappingPage component uses React.use() properly
- All dynamic routes handle params correctly

## Previous Test Results

### Last Successful Test
- **Export ID:** cmihl6wku0001121boikis0xh
- **Badge Count:** 5
- **Status:** Completed
- **Location:** public/exports/cmihl6wku0001121boikis0xh/

## Known Issues Fixed

1. ✅ Next.js params warnings in NewMappingPage - FIXED
   - Changed params type to Promise<{ id: string }>
   - Added React.use() to unwrap params
   - Replaced all params.id with projectId variable

2. ✅ Login authentication - FIXED
   - Updated password hash for w@w.com user
   - Created loginAction server action
   - Updated LoginForm to use server action
   - Removed broken custom /api/auth/login route

3. ✅ ZIP creation endpoint - READY
   - POST /api/exports/[exportId]/zip
   - Uses archiver package
   - Returns downloadUrl

## Manual Testing URL

**Test Login Now:**
```
http://localhost:3000/auth/login
```

Use credentials:
- Email: `w@w.com`
- Password: `w`

Then follow the steps above to complete the full cycle!
