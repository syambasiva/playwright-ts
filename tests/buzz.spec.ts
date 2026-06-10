import { test, expect } from '@playwright/test';

test('Buzz module: post a message and verify it appears in Latest Posts', async ({ page }) => {
  // 1. Navigate to the app root (baseURL is set in playwright.config.ts)
  await page.goto('/');

  // 2. Login to OrangeHRM with provided credentials
  const username = page.locator('input[name="username"]');
  const password = page.locator('input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');

  await page.waitForLoadState('networkidle');
  await expect(username).toBeVisible({ timeout: 10000 });
  await expect(password).toBeVisible({ timeout: 10000 });
  await expect(loginButton).toBeVisible({ timeout: 10000 });

  await username.fill('Admin');
  await password.fill('admin123');

  // click login and wait for dashboard/navigation
  await Promise.all([
    page.waitForURL(/.*(dashboard|index).*/i, { timeout: 15000 }),
    loginButton.click(),
  ]);

  await page.waitForLoadState('networkidle');

  // 3. Go to the "Buzz" module. Try role-based locator first, fallback to text.
  const buzzLink = page.getByRole('link', { name: 'Buzz' }).first();
  if (await buzzLink.count() > 0) {
    await Promise.all([
      page.waitForURL(/.*buzz.*/i, { timeout: 10000 }),
      buzzLink.click(),
    ]);
  } else {
    const buzzFallback = page.locator('text=Buzz').first();
    await expect(buzzFallback).toBeVisible({ timeout: 8000 });
    await Promise.all([
      page.waitForURL(/.*buzz.*/i, { timeout: 10000 }),
      buzzFallback.click(),
    ]);
  }

  // Wait for Buzz area to load
  await page.waitForLoadState('networkidle');

  // 4. Wait for the Buzz post textarea to appear (actual app uses .oxd-buzz-post-input)
  const messageBox = page.locator('textarea.oxd-buzz-post-input').first();
  await expect(messageBox, 'No message input found on Buzz').toBeVisible({ timeout: 10000 });

  // 6. Enter a message and click "Post"
  const uniqueMessage = `Excited for testing! ${Date.now()}`;
  await messageBox.fill(uniqueMessage);

  // Post button text is "Post" inside an oxd-button--main
  const postButton = page.locator('button:has-text("Post")').first();
  await expect(postButton).toBeVisible({ timeout: 8000 });
  await postButton.click();

  // 7. Verify that the post appears in the feed. The app renders the posted text in
  // an element with class `orangehrm-buzz-post-body-original-text` or as body-text.
  const posted = page.locator('.orangehrm-buzz-post-body-original-text, .orangehrm-buzz-post-body-text', { hasText: uniqueMessage }).first();
  await expect(posted).toBeVisible({ timeout: 10000 });
});

