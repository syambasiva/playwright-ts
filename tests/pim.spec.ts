import { test, expect } from '@playwright/test';

test('PIM page shows Employee Information and Add/Search buttons, then logout', async ({ page }) => {
  // 1. Navigate to base URL (playwright.config.ts baseURL set)
  await page.goto('/');

  // 2. Login to OrangeHRM with username Admin / admin123
  const username = page.locator('input[name="username"]');
  const password = page.locator('input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');

  await page.waitForLoadState('networkidle');
  await expect(username).toBeVisible({ timeout: 10000 });
  await expect(password).toBeVisible({ timeout: 10000 });
  await expect(loginButton).toBeVisible({ timeout: 10000 });

  await username.fill('Admin');
  await password.fill('admin123');

  // Click Login and wait for dashboard/main page
  await Promise.all([
    page.waitForURL(/.*(dashboard|index).*/i, { timeout: 15000 }),
    loginButton.click(),
  ]);

  // Wait for dashboard to be visible
  await page.waitForLoadState('networkidle');
  // look for a dashboard indicator
  const dashboardIndicator = page.locator('text=Dashboard').first();
  await expect(dashboardIndicator).toBeVisible({ timeout: 10000 });

  // 3. Click on "PIM" in the left sidebar menu.
  // Try role-based link first
  const pimNav = page.getByRole('link', { name: 'PIM' }).first();
  if (await pimNav.count() > 0) {
    await Promise.all([
      page.waitForURL(/.*pim.*/i, { timeout: 10000 }),
      pimNav.click(),
    ]);
  } else {
    // fallback to text/button
    const pimFallback = page.locator('text=PIM').first();
    await expect(pimFallback).toBeVisible({ timeout: 8000 });
    await Promise.all([
      page.waitForURL(/.*pim.*/i, { timeout: 10000 }),
      pimFallback.click(),
    ]);
  }

  // 4. Verify that the "Employee Information" page is displayed.
  // The PIM page often contains heading "Employee Information"
  const empInfo = page.getByRole('heading', { name: /Employee Information/i }).first();
  // fallback to text
  if ((await empInfo.count()) > 0) {
    await expect(empInfo).toBeVisible({ timeout: 8000 });
  } else {
    const empText = page.locator('text=Employee Information').first();
    await expect(empText).toBeVisible({ timeout: 8000 });
  }

  // 5. Check that both "Add" and "Search" buttons are visible on the page.
  // "Add" button
  const addButton = page.getByRole('button', { name: 'Add' }).first();
  await expect(addButton).toBeVisible({ timeout: 5000 });
  // Search could be an input or a button labeled 'Search'
  const searchButton = page.getByRole('button', { name: 'Search' }).first();
  const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
  if ((await searchButton.count()) > 0) {
    await expect(searchButton).toBeVisible({ timeout: 5000 });
  } else {
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  }

  // 6. Click the "user icon" in the top right corner.
  // Try common selectors for profile dropdown
  const profileSelectors = [
    'button[aria-label="profile"]',
    'img.oxd-userdropdown-img',
    '.oxd-userdropdown',
    'header button:has-text("Admin")',
    'text=Admin'
  ];
  let opened = false;
  for (const sel of profileSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.count() > 0) {
      try {
        await loc.click({ force: true });
        opened = true;
        break;
      } catch (e) {
        // continue
      }
    }
  }
  if (!opened) {
    // as last resort try clicking top-right area
    await page.locator('header').click({ position: { x: 1000, y: 20 } }).catch(() => {});
  }

  // 7. Click on "Logout" option from the dropdown.
  const logout = page.getByText('Logout').first();
  await expect(logout).toBeVisible({ timeout: 8000 });
  await Promise.all([
    page.waitForURL(/.*auth\/login.*/i, { timeout: 15000 }),
    logout.click(),
  ]);

  // 8. Verify that the login page is displayed again.
  await page.waitForLoadState('networkidle');
  await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 8000 });

  // 9. Close - Playwright test runner will close the browser automatically
});

