import { test, expect } from '@playwright/test'
import path from 'path'

// Test credentials
const TEST_USER = {
  email: 'w@w.com',
  password: '12345678'
}

// Test event data generator (creates unique slugs for each test)
function createTestEvent(uniqueId: string) {
  return {
    name: `E2E Test Event ${uniqueId}`,
    slug: `e2e-test-${uniqueId}-${Date.now()}`,
    description: 'This is an end-to-end test event created by Playwright automation',
    location: 'Test Convention Center',
    maxAttendees: '100'
  }
}

test.describe('Event Registration Module - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:3000/auth/login')
    
    // Login as test user
    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email)
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('should display Event Registration module in dashboard', async ({ page }) => {
    // Verify Event Registration module is visible
    const eventModule = page.getByRole('link', { name: /Event Registration/ })
    await expect(eventModule).toBeVisible()
    await expect(page.getByText('Create events, build registration forms, and manage attendees')).toBeVisible()
  })

  test('should navigate to events listing page', async ({ page }) => {
    // Click on Event Registration module
    await page.getByRole('link', { name: /Event Registration/ }).click()
    
    // Verify we're on the events page
    await expect(page).toHaveURL(/.*modules\/events/)
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible()
    await expect(page.getByText('Create and manage your event registrations')).toBeVisible()
  })

  test('should create event with all fields including logo upload', async ({ page }) => {
    // Navigate to events page
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await expect(page).toHaveURL(/.*modules\/events/)
    
    // Click Create Event button
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    await expect(page).toHaveURL(/.*events\/create/)
    
    // Verify form is displayed
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible()
    
    // Fill in event name
    await page.getByPlaceholder('Annual Tech Conference 2024').fill(TEST_EVENT.name)
    
    // Fill in slug
    await page.getByPlaceholder('tech-conference-2024').fill(TEST_EVENT.slug)
    
    // Fill in description
    await page.getByPlaceholder('Tell attendees about your event...').fill(TEST_EVENT.description)
    
    // Upload logo
    const logoPath = path.join(__dirname, '../fixtures/test-logo.png')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(logoPath)
    
    // Verify logo preview appears
    await expect(page.getByAltText('Logo preview')).toBeVisible()
    await expect(page.getByText('test-logo.png')).toBeVisible()
    
    // Fill in dates
    const startDate = '2024-12-15T09:00'
    const endDate = '2024-12-16T17:00'
    await page.getByLabel('Start Date').fill(startDate)
    await page.getByLabel('End Date').fill(endDate)
    
    // Fill in location
    await page.getByPlaceholder('Convention Center, Downtown').fill(TEST_EVENT.location)
    
    // Fill in max attendees
    await page.locator('input[name="maxAttendees"]').fill(TEST_EVENT.maxAttendees)
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Event' }).click()
    
    // Wait for navigation to event details page
    await page.waitForURL(/.*modules\/events\/[^/]+$/, { timeout: 10000 })
    
    // Verify we're on the event details page
    await expect(page.getByRole('heading', { name: TEST_EVENT.name })).toBeVisible()
  })

  test('should create event without optional fields', async ({ page }) => {
    // Navigate to create event page
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    // Fill only required fields
    await page.getByPlaceholder('Annual Tech Conference 2024').fill('Minimal Test Event')
    await page.getByPlaceholder('tech-conference-2024').fill('minimal-test-event')
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Event' }).click()
    
    // Wait for navigation
    await page.waitForURL(/.*modules\/events\/[^/]+$/, { timeout: 10000 })
    
    // Verify event was created
    await expect(page.getByRole('heading', { name: 'Minimal Test Event' })).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Navigate to create event page
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Create Event' }).click()
    
    // Verify form validation triggers (browser native validation)
    const nameInput = page.getByPlaceholder('Annual Tech Conference 2024')
    await expect(nameInput).toHaveAttribute('required')
    
    const slugInput = page.getByPlaceholder('tech-conference-2024')
    await expect(slugInput).toHaveAttribute('required')
  })

  test('should navigate to event details and display information', async ({ page }) => {
    // Create an event first
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    await page.getByPlaceholder('Annual Tech Conference 2024').fill('Details Test Event')
    await page.getByPlaceholder('tech-conference-2024').fill('details-test-event')
    await page.getByPlaceholder('Tell attendees about your event...').fill('Testing event details page')
    
    await page.getByRole('button', { name: 'Create Event' }).click()
    await page.waitForURL(/.*modules\/events\/[^/]+$/, { timeout: 10000 })
    
    // Verify event details are displayed
    await expect(page.getByRole('heading', { name: 'Details Test Event' })).toBeVisible()
    await expect(page.getByText('Testing event details page')).toBeVisible()
  })

  test('should allow logo removal before upload', async ({ page }) => {
    // Navigate to create event page
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    // Upload logo
    const logoPath = path.join(__dirname, '../fixtures/test-logo.png')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(logoPath)
    
    // Verify logo preview appears
    await expect(page.getByAltText('Logo preview')).toBeVisible()
    
    // Click remove button
    await page.getByRole('button').filter({ has: page.locator('svg') }).last().click()
    
    // Verify logo preview is removed
    await expect(page.getByAltText('Logo preview')).not.toBeVisible()
    await expect(page.getByText('Click to upload logo')).toBeVisible()
  })

  test('should validate logo file size', async ({ page }) => {
    // This test would need a large file in fixtures
    // For now, we test that the validation message appears in the UI
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    // Verify max size message is displayed
    await expect(page.getByText('Max size: 5MB')).toBeVisible()
  })

  test('should navigate back to events list', async ({ page }) => {
    // Navigate to create event page
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    // Click Back to Events link
    await page.getByRole('link', { name: 'Back to Events' }).click()
    
    // Verify we're back on events listing
    await expect(page).toHaveURL(/.*modules\/events$/)
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible()
  })

  test('should display created events in the list', async ({ page }) => {
    // Create an event
    await page.getByRole('link', { name: /Event Registration/ }).click()
    await page.getByRole('link', { name: 'Create Event' }).first().click()
    
    const eventName = 'List Display Test Event'
    await page.getByPlaceholder('Annual Tech Conference 2024').fill(eventName)
    await page.getByPlaceholder('tech-conference-2024').fill('list-display-test')
    
    await page.getByRole('button', { name: 'Create Event' }).click()
    await page.waitForURL(/.*modules\/events\/[^/]+$/, { timeout: 10000 })
    
    // Go back to events list
    await page.getByRole('link', { name: 'Back to Events' }).click()
    
    // Verify event appears in the list
    await expect(page.getByText(eventName)).toBeVisible()
  })
})
