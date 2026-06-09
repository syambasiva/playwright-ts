import { test, expect } from '@playwright/test';

// Test: Login then logout flow
// Steps:
// 1. Login with Admin/admin123
// 2. Click profile icon (top-right) — use multiple fallback locators for robustness
// 3. Click "Logout"
// 4. Verify that the login page is displayed and contains the text "Username"

test('Login and Logout returns to login page showing Username', async ({ page }) => {
  // Navigate to login
  await page.goto('/web/index.php/auth/login');

  // Wait for the login form and populate credentials
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');

  await page.waitForLoadState('networkidle');
  await expect(usernameInput).toBeVisible({ timeout: 5000 });
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await expect(loginButton).toBeVisible({ timeout: 5000 });

  await usernameInput.fill('Admin');
  await passwordInput.fill('admin123');

  // Click login and wait for navigation (dashboard or main page)
  await Promise.all([
    page.waitForURL(/.*(dashboard|index).*/i, { timeout: 15000 }),
    loginButton.click(),
  ]);
  await page.waitForLoadState('networkidle');

  // Try a set of fallback locators to open the user/profile menu
  const profileLocators = [
    'button[aria-label="profile"]',
    'button[aria-label="user"]',
    'button:has(img.oxd-userdropdown-img)',
    'p.oxd-userdropdown-name',
    'div.oxd-userdropdown',
    'button:has-text("Paul")', // unlikely but harmless fallback
    'button[title="Profile"]',
  ];

  let openedMenu = false;
  for (const sel of profileLocators) {
    const loc = page.locator(sel).first();
    try {
      if (await loc.count() > 0 && await loc.isVisible()) {
        await loc.click();
        openedMenu = true;
        break;
      }
    } catch (e) {
      // ignore and try next locator
    }
  }

  // If menu not opened yet, try clicking a generic user area in the header
  if (!openedMenu) {
    const headerUser = page.locator('header').locator('text=Admin').first();
    if (await headerUser.count() > 0 && await headerUser.isVisible()) {
      await headerUser.click();
      openedMenu = true;
    }
  }

  // Wait for Logout option to appear, then click it
  const logoutLocator = page.getByText('Logout').first();
  await expect(logoutLocator).toBeVisible({ timeout: 8000 });
  await Promise.all([
    page.waitForURL(/.*auth\/login.*/i, { timeout: 15000 }),
    logoutLocator.click(),
  ]);

  // Verify the login page shows and contains "Username"
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Username')).toBeVisible({ timeout: 5000 });
  // also ensure username input is present
  await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 5000 });
});

