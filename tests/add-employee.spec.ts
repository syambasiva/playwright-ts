import { test, expect } from '@playwright/test';

test('Add a new employee and verify profile shows full name', async ({ page }) => {
  // 1. Navigate to base URL (playwright.config.ts baseURL set to OrangeHRM demo)
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

  await Promise.all([
    page.waitForURL(/.*(dashboard|index).*/i, { timeout: 15000 }),
    loginButton.click(),
  ]);

  await page.waitForLoadState('networkidle');

  // 3. Navigate to the "PIM" module using left sidebar menu
  const pimNav = page.getByRole('link', { name: 'PIM' }).first();
  if (await pimNav.count() > 0) {
    await Promise.all([
      page.waitForURL(/.*pim.*/i, { timeout: 10000 }),
      pimNav.click(),
    ]);
  } else {
    const pimFallback = page.locator('text=PIM').first();
    await expect(pimFallback).toBeVisible({ timeout: 8000 });
    await Promise.all([
      page.waitForURL(/.*pim.*/i, { timeout: 10000 }),
      pimFallback.click(),
    ]);
  }

  // 4. Click on "Add"
  const addButton = page.getByRole('button', { name: 'Add' }).first();
  await expect(addButton).toBeVisible({ timeout: 8000 });
  await addButton.click();

  // 5. Enter first name as "John123" and last name as "Doe456"
  const firstName = page.locator('input[name="firstName"], input[placeholder*="First"], input[placeholder="First Name"]').first();
  const lastName = page.locator('input[name="lastName"], input[placeholder*="Last"], input[placeholder="Last Name"]').first();

  await expect(firstName).toBeVisible({ timeout: 10000 });
  await expect(lastName).toBeVisible({ timeout: 10000 });

  await firstName.fill('John123');
  await lastName.fill('Doe456');

  // 6. Click "Save"
  const saveButton = page.getByRole('button', { name: /Save/i }).first();
  // Click and wait for profile name to appear -- sometimes URL changes, sometimes not
  await Promise.all([
    page.waitForSelector('text=John123 Doe456', { timeout: 15000 }),
    saveButton.click(),
  ]).catch(async () => {
    // fallback: click then wait for some navigation or header to appear
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  });

  // 7. Verify that the employee profile page is displayed
  // and 8. Confirm that "John123 Doe456" is shown on the top
  const fullName = page.getByText('John123 Doe456').first();
  await expect(fullName).toBeVisible({ timeout: 15000 });
});

