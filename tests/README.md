# PayLens Tests

Playwright test suite for PayLens application testing.

## Setup

1. **Install dependencies**
   ```bash
   cd tests
   npm install
   ```

2. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run tests in headed mode
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### View test reports
```bash
npm run report
```

## Test Structure

```
tests/
├── tests/
│   ├── api/              # API endpoint tests
│   │   ├── payment.spec.ts
│   │   ├── incident.spec.ts
│   │   └── support.spec.ts
│   └── ui/               # UI component tests
│       ├── payment-investigation.spec.ts
│       ├── support-assistant.spec.ts
│       └── aiops-dashboard.spec.ts
├── fixtures/             # Test data fixtures
│   └── test-data.ts
├── playwright.config.ts   # Playwright configuration
└── package.json
```

## Environment Variables

- `BASE_URL`: Frontend URL (default: http://localhost:3000)
- `API_URL`: Backend API URL (default: http://localhost:8000)

## Test Coverage

### API Tests
- Payment investigation endpoints
- Incident investigation endpoints
- Support assistant endpoints
- Error handling and validation

### UI Tests
- Payment investigation workflow
- Support assistant chat interface
- AIOps dashboard components
- Navigation and user interactions

## CI/CD Integration

The tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: cd tests && npm install

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: cd tests && npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/playwright-report/
```

## Troubleshooting

### Tests fail due to backend not running
Ensure the backend is running on the configured API_URL before running API tests.

### Tests fail due to frontend not running
The Playwright config is set to start the frontend dev server automatically. If this fails, start it manually:
```bash
cd frontend && npm run dev
```

### Browser installation issues
```bash
npx playwright install --force
```

### Timeout issues
Increase timeouts in playwright.config.ts if tests are failing due to slow responses.