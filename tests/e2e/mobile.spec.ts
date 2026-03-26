import { test, expect } from '@playwright/test';

test.describe('SkillUp Buddy - Mobile Android/Chrome Emulation', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  });

  test('should display mobile-optimized homepage', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check if page loads on mobile
    await expect(page).toHaveTitle(/SkillUp Buddy/);

    // Check mobile navigation - hamburger menu should be visible
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('text=Aptitude')).toBeVisible();
    } else {
      // If no hamburger menu, check if navigation is accessible
      await expect(page.locator('text=Aptitude')).toBeVisible();
    }
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Test touch-friendly buttons
    const aptitudeButton = page.locator('text=Aptitude');
    await expect(aptitudeButton).toBeVisible();

    // Check button size for touch accessibility (minimum 44px)
    const buttonBox = await aptitudeButton.boundingBox();
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }

    // Test navigation
    await aptitudeButton.click();
    await expect(page.locator('text=Choose Your Aptitude Topic')).toBeVisible();
  });

  test('should display aptitude topics on mobile', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.locator('text=Aptitude').click();

    // Check if topics are displayed and scrollable
    await expect(page.locator('text=Number System')).toBeVisible();

    // Test scrolling on mobile
    await page.mouse.wheel(0, 200);
    await expect(page.locator('text=Profit & Loss')).toBeVisible();
  });

  test('should handle mobile test session', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.locator('text=Aptitude').click();

    // Select a topic
    await page.locator('text=Number System').click();

    // Check if test interface loads properly on mobile
    await expect(page.locator('text=Question')).toBeVisible();

    // Check if question palette is accessible on mobile
    const paletteButton = page.locator('[data-testid="question-palette"]');
    if (await paletteButton.isVisible()) {
      await paletteButton.click();
      await expect(page.locator('text=Question 1')).toBeVisible();
    }
  });
});

test.describe('SkillUp Buddy - Mobile Safari/iPhone Emulation', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  });

  test('should display mobile-optimized interface on iOS', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check iOS-specific rendering
    await expect(page.locator('text=Aptitude')).toBeVisible();

    // Test touch interactions
    await page.locator('text=Aptitude').click();
    await expect(page.locator('text=Choose Your Aptitude Topic')).toBeVisible();
  });

  test('should handle iOS-specific behaviors', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Test viewport height handling (iOS Safari issues)
    const viewportHeight = page.viewportSize()?.height;
    expect(viewportHeight).toBe(667);

    // Check if content fits within viewport
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeLessThanOrEqual(viewportHeight! * 2); // Allow some scrolling
  });
});
