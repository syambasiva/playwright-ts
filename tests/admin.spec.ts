import { test, expect } from '@playwright/test';

test('Login and verify Admin -> System Users page and Add button', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/web/index.php/auth/login');

  // Wait for login form
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');

  await page.waitForLoadState('networkidle');
  await expect(usernameInput).toBeVisible({ timeout: 5000 });
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await expect(loginButton).toBeVisible({ timeout: 5000 });

  // Login
  await usernameInput.fill('Admin');
  await passwordInput.fill('admin123');
  await Promise.all([
    // clicking Login triggers navigation to Dashboard
    page.waitForURL(/.*(dashboard|index).*/i, { timeout: 15000 }),
    loginButton.click(),
  ]);

  // Ensure page settled
  await page.waitForLoadState('networkidle');

  // Click the "Admin" tab in the navigation
  // Use a robust locator - look for a navigation link or button with the text 'Admin'
  const adminNav = page.getByRole('link', { name: 'Admin' }).first();
  if (await adminNav.count() === 0) {
    // fallback to text locator
    await Promise.all([
      page.waitForURL(/.*admin.*/i, { timeout: 15000 }),
      page.locator('text=Admin').first().click(),
    ]);
  } else {
    await Promise.all([
      page.waitForURL(/.*admin.*/i, { timeout: 15000 }),
      adminNav.click(),
    ]);
  }

  // Wait for admin page to load
  await page.waitForLoadState('networkidle');

  // Verify page contains "System Users"
  const systemUsers = page.getByText('System Users');
  await expect(systemUsers).toBeVisible({ timeout: 10000 });

  // Verify that the "Add" button is visible
  const addButton = page.getByRole('button', { name: 'Add' });
  await expect(addButton).toBeVisible({ timeout: 5000 });
});

