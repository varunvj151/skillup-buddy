# End-to-End Testing with Playwright

This project uses Playwright for comprehensive end-to-end testing across multiple devices and browsers.

## Test Structure

```
tests/
└── e2e/
    ├── desktop.spec.ts     # Desktop browser tests (Chrome, Firefox, Safari/WebKit)
    ├── mobile.spec.ts      # Mobile device tests (Android Chrome, iPhone Safari)
    ├── tablet.spec.ts      # Tablet device tests
    └── integration.spec.ts # Authentication, forms, and complex user flows
```

## Test Coverage

### Desktop Tests
- **Chrome**: Full functionality testing
- **Firefox**: Cross-browser compatibility
- **Safari/WebKit**: WebKit engine compatibility

### Mobile Tests
- **Android Chrome**: Mobile Chrome emulation
- **iPhone Safari**: iOS Safari emulation
- Touch interaction testing
- Responsive design validation

### Tablet Tests
- **iPad emulation**: Tablet-specific layouts
- **Landscape/Portrait**: Orientation handling
- Touch and responsive design

### Integration Tests
- Authentication flows
- Form submissions
- Error handling
- Performance and accessibility

## Running Tests

### Prerequisites
1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npm run playwright:install
```

3. Start the development server:
```bash
npm run dev
```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (visual test runner)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run only desktop tests
npm run test:e2e:desktop

# Run only mobile tests
npm run test:e2e:mobile

# Run only tablet tests
npm run test:e2e:tablet
```

### Generating Test Code

To generate test code by interacting with the application:

```bash
npm run playwright:codegen
```

This opens a browser where you can interact with the app, and Playwright will generate the test code automatically.

## Configuration

The test configuration is in `playwright.config.ts` and includes:

- **6 test projects**: Desktop Chrome, Desktop Firefox, Desktop Safari, Mobile Android, Mobile Safari, Tablet
- **Web server setup**: Automatically starts the dev server before tests
- **Device emulation**: Realistic device configurations with proper viewports and user agents
- **Parallel execution**: Tests run in parallel for faster execution

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.use({ browserName: 'firefox' }); // Optional: specify browser

  test('should do something', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Test code here
  });
});
```

### Device-Specific Tests

```typescript
test.describe('Mobile Tests', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)...'
  });

  test('should work on mobile', async ({ page }) => {
    // Mobile-specific test code
  });
});
```

## Best Practices

1. **Use descriptive test names** that explain what the test validates
2. **Test user journeys**, not just individual components
3. **Include assertions** for both positive and negative scenarios
4. **Test across different viewports** to ensure responsive design
5. **Handle async operations** properly with `await`
6. **Use data-testid attributes** for reliable element selection
7. **Test error states** and edge cases

## Troubleshooting

### Common Issues

1. **Tests failing due to timing**: Add `await page.waitForLoadState('networkidle');`
2. **Element not found**: Use more specific selectors or add waits
3. **Flaky tests**: Add retry logic or stabilize the app state
4. **Browser not found**: Run `npm run playwright:install`

### Debug Tips

- Use `test.only()` to run a single test
- Use `page.pause()` to debug interactively
- Check the Playwright trace files for detailed execution logs
- Use `console.log()` in tests for debugging

## CI/CD Integration

For continuous integration, add this to your CI pipeline:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

Make sure to:
1. Install dependencies
2. Install Playwright browsers
3. Start the application server
4. Run the tests

## Performance Testing

The tests include basic performance checks:
- Page load times
- Accessibility validation
- Keyboard navigation testing

For more detailed performance testing, consider using Playwright's performance APIs or integrating with tools like Lighthouse.