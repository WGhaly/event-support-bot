# Test Credentials for ID Card Automation Platform

## Access Information

**Application URL:** http://localhost:3000

## Test Account

You can create a new account or use these test credentials:

**Email:** test@example.com  
**Password:** Test123456!

## Quick Start Guide

### 1. Sign Up (if needed)
- Go to: http://localhost:3000/signup
- Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: Test123456!
- Click "Create Account"

### 2. Sign In
- Go to: http://localhost:3000/signin
- Use the credentials above
- Click "Sign In"

### 3. Complete Workflow Test

Once logged in, follow these steps:

#### Step 1: Create Project
- Click "New Project"
- Name: "Test Event 2025"
- Description: "Testing badge generation"
- Click "Create Project"

#### Step 2: Upload Template
- Click "Upload Template"
- Use test file: `tests/fixtures/test-badge.png`
- Name: "Test Badge Template"
- Click "Upload Template"

#### Step 3: Define Fields
- Click "Edit Fields"
- Click "Add Text Field"
- Field Name: "Name"
- Sample Text: "John Doe"
- Wait 2 seconds for auto-save
- Click "Back to Template"

#### Step 4: Import Dataset
- Go back to project page
- Click "Import Dataset"
- Use test file: `tests/fixtures/test-data.csv`
- Name: "Test Attendees"
- Click "Import Dataset"

#### Step 5: Map Fields
- Go back to template page
- Click "Map Fields"
- Select your dataset from dropdown
- Map "Name" field to "Name" column
- Mapping Name: "Test Mapping"
- Click "Save Mapping"

#### Step 6: Generate Badges
- Click "Generate Badges"
- Badge Count: 5 (for quick testing)
- Click "Start Generation"
- Wait for completion (~10-15 seconds)

#### Step 7: Download
- View generated badges in gallery
- Click "Download All as ZIP" for bulk download
- Or click individual badges to download

## Test Files Location

- Template: `tests/fixtures/test-badge.png`
- Dataset: `tests/fixtures/test-data.csv`

## Stopping the Server

When done testing, stop the server:
```bash
pkill -f "next dev"
```

Or find the process and kill it:
```bash
lsof -ti:3002 | xargs kill
```

---

**Server Status:** ✅ Running on http://localhost:3000  
**Ready for Testing!**
