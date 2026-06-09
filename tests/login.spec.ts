import { test, expect } from '@playwright/test';

test('Login to OrangeHRM and land on Dashboard', async ({ page }) => {
  // 1. Launch the browser and navigate to the login page.
  await page.goto('/web/index.php/auth/login');

  // 2. Wait for the login form to be fully loaded.
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');

  // ensure page and form are fully loaded
  await page.waitForLoadState('networkidle');
  await expect(usernameInput).toBeVisible({ timeout: 5000 });
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await expect(loginButton).toBeVisible({ timeout: 5000 });

  // 3. Enter username "Admin" in the username field.
  await usernameInput.fill('Admin');
  // 4. Enter password "admin123" in the password field.
  await passwordInput.fill('admin123');
  // 5. Click the Login button.
  // Use a dynamic wait: wait for navigation to the dashboard while clicking
  await Promise.all([
    page.waitForURL(/.*dashboard.*/i, { timeout: 15000 }),
    loginButton.click(),
  ]);

  // 6. Verify that the user is successfully redirected to the Dashboard page.
  // Wait for the Dashboard page to be fully loaded (network idle) and assert URL
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/.*dashboard.*/i, { timeout: 15000 });

  // 7. Assert that the current URL contains the word "dashboard".
  expect(page.url().toLowerCase()).toContain('dashboard');
});

