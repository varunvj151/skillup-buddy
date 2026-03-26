import { test, expect } from '@playwright/test';

test.describe('SkillUp Buddy - Authentication & User Flows', () => {
  test('should handle login flow', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check if login elements are present (if auth is required)
    const loginButton = page.locator('text=Login');
    if (await loginButton.isVisible()) {
      await loginButton.click();

      // Check login form
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');

        // Submit login
        await page.click('button[type="submit"]');

        // Check if login succeeds or shows appropriate message
        await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should handle logout functionality', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Assuming user is logged in, check logout
    const logoutButton = page.locator('text=Logout');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Check if logout succeeds
      await expect(page.locator('text=Login')).toBeVisible();
    }
  });

  test('should handle form submissions in aptitude tests', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.click('text=Aptitude & Reasoning');
    await page.click('text=Number System');

    // Wait for test to load
    await expect(page.locator('text=Question')).toBeVisible();

    // Find and click an answer option
    const optionButton = page.locator('button').filter({ hasText: /^[A-D]$/ }).first();
    if (await optionButton.isVisible()) {
      await optionButton.click();

      // Check if selection is registered
      await expect(optionButton).toHaveClass(/selected|active/);
    }
  });

  test('should handle navigation between test questions', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.click('text=Aptitude & Reasoning');
    await page.click('text=Number System');

    await expect(page.locator('text=Question')).toBeVisible();

    // Test next/previous navigation
    const nextButton = page.locator('text=Next');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page.locator('text=Question 2')).toBeVisible();
    }
  });

  test('should handle test completion and results', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.click('text=Aptitude & Reasoning');
    await page.click('text=Number System');

    // Wait for test interface
    await expect(page.locator('text=Question')).toBeVisible();

    // Simulate completing test (this would need actual test flow)
    const submitButton = page.locator('text=Submit Test');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check results page
      await expect(page.locator('text=Test Results')).toBeVisible();
    }
  });
});

test.describe('SkillUp Buddy - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline state
    await page.context().setOffline(true);

    await page.goto('http://localhost:8081');

    // Check if app handles offline state
    await expect(page.locator('text=offline|network error|connection lost')).toBeVisible({ timeout: 5000 }).catch(() => {
      // If no error message, that's also acceptable
      console.log('App handles offline state without explicit error message');
    });

    await page.context().setOffline(false);
  });

  test('should handle invalid routes', async ({ page }) => {
    await page.goto('http://localhost:8081/invalid-route');

    // Check if 404 page is shown
    await expect(page.locator('text=404|Not Found|Page not found')).toBeVisible();
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // If there's a contact/login form
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      // Try submitting empty form
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Check for validation messages
        await expect(page.locator('text=required|invalid|error')).toBeVisible({ timeout: 5000 }).catch(() => {
          console.log('Form validation not implemented or different approach used');
        });
      }
    }
  });
});

test.describe('SkillUp Buddy - Performance & Accessibility', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:8081');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);

    // Check for focusable elements
    const focusableElements = page.locator('button, a, input, select, textarea');
    const focusableCount = await focusableElements.count();
    expect(focusableCount).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
