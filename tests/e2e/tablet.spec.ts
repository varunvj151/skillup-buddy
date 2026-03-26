import { test, expect } from '@playwright/test';

test.describe('SkillUp Buddy - Tablet Emulation', () => {
  test.use({
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  });

  test('should display tablet-optimized layout', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check if page loads on tablet
    await expect(page).toHaveTitle(/SkillUp Buddy/);

    // Check tablet navigation - should show full nav or hybrid
    await expect(page.locator('text=Aptitude')).toBeVisible();
    await expect(page.locator('text=Interview')).toBeVisible();
    await expect(page.locator('text=Group Discussion')).toBeVisible();
  });

  test('should handle tablet-specific responsive breakpoints', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8081');

    // Check md: breakpoint styles are applied
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Test navigation functionality
    await page.click('text=Aptitude');
    await expect(page.locator('text=Choose Your Aptitude Topic')).toBeVisible();
  });

  test('should display aptitude topics in tablet layout', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.click('text=Aptitude');

    // Check if topics grid adapts to tablet
    await expect(page.locator('text=Number System')).toBeVisible();
    await expect(page.locator('text=Percentages')).toBeVisible();

    // Check if layout uses appropriate columns for tablet (likely 2-3 columns)
    const topicCards = page.locator('[data-testid="topic-card"]');
    const cardCount = await topicCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should handle tablet test session layout', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.click('text=Aptitude');
    await page.click('text=Number System');

    // Check if test interface adapts to tablet
    await expect(page.locator('text=Question')).toBeVisible();

    // Check if question palette is properly sized for tablet
    const palette = page.locator('[data-testid="question-palette"]');
    if (await palette.isVisible()) {
      const paletteBox = await palette.boundingBox();
      if (paletteBox) {
        // Should be wider than mobile but narrower than desktop
        expect(paletteBox.width).toBeGreaterThan(200);
        expect(paletteBox.width).toBeLessThan(400);
      }
    }
  });

  test('should handle tablet touch interactions', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Test touch-friendly interactions
    const aptitudeButton = page.locator('text=Aptitude');
    await aptitudeButton.click();

    // Check if tap navigation works
    await expect(page.locator('text=Choose Your Aptitude Topic')).toBeVisible();

    // Test scrolling and content access
    await page.mouse.wheel(0, 300);
    await expect(page.locator('text=Time & Work')).toBeVisible();
  });
});

test.describe('SkillUp Buddy - Tablet Landscape', () => {
  test.use({
    viewport: { width: 1024, height: 768 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  });

  test('should adapt to landscape tablet orientation', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check landscape layout
    await expect(page.locator('text=Aptitude')).toBeVisible();

    // Test if layout uses more horizontal space
    const mainContent = page.locator('main');
    const contentBox = await mainContent.boundingBox();
    if (contentBox) {
      expect(contentBox.width).toBeGreaterThan(900);
    }
  });
});
