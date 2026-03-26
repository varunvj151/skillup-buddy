import { test, expect } from '@playwright/test';

test.describe('SkillUp Buddy - Desktop Chrome', () => {
  test('should load homepage and navigate through main sections', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check if homepage loads
    await expect(page).toHaveTitle(/SkillUp Buddy/);

    // Check main navigation elements
    await expect(page.locator('text=Aptitude & Reasoning')).toBeVisible();
    await expect(page.locator('text=Interview Prep')).toBeVisible();
    await expect(page.locator('text=Group Discussion')).toBeVisible();

    // Test navigation to Aptitude page
    await page.click('text=Aptitude & Reasoning');
    await expect(page.locator('text=Choose Your Aptitude Topic')).toBeVisible();

    // Test navigation to Interview page
    await page.click('text=Interview Prep');
    await expect(page.locator('text=Interview Preparation')).toBeVisible();

    // Test navigation to Group Discussion page
    await page.click('text=Group Discussion');
    await expect(page.locator('text=Group Discussion Practice')).toBeVisible();
  });

  test('should handle responsive design on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('http://localhost:8081');

    // Check header responsiveness
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check if navigation is visible and functional
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display aptitude topics correctly', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.click('text=Aptitude & Reasoning');

    // Check if topics are displayed
    await expect(page.locator('text=Number System')).toBeVisible();
    await expect(page.locator('text=Percentages')).toBeVisible();
    await expect(page.locator('text=Profit & Loss')).toBeVisible();
  });
});

test.describe('SkillUp Buddy - Desktop Firefox', () => {
  test('should load and function identically to Chrome', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Basic functionality check
    await expect(page.locator('text=Aptitude & Reasoning')).toBeVisible();
    await expect(page.locator('text=Interview Prep')).toBeVisible();
    await expect(page.locator('text=Group Discussion')).toBeVisible();
  });
});

test.describe('SkillUp Buddy - Desktop Safari/WebKit', () => {
  test('should load and function identically to Chrome', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Basic functionality check
    await expect(page.locator('text=Aptitude & Reasoning')).toBeVisible();
    await expect(page.locator('text=Interview Prep')).toBeVisible();
    await expect(page.locator('text=Group Discussion')).toBeVisible();
  });
});
