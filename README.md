Playwright TypeScript test for OrangeHRM demo

Files created:
- `playwright.config.ts` - Playwright configuration (testDir = tests)
- `tsconfig.json` - TypeScript config for tests
- `tests/login.spec.ts` - Test implementing the requested scenario
- `package.json` - npm scripts and dev dependency stub

Quick start

1) Open a terminal in the `playwright-ts` folder:

```bash
cd /Users/syambasiva/PycharmProjects/PlayWrightMCP/playwright-ts
```

2) Install dependencies and browsers:

```bash
npm install
npx playwright install
```

3) Run the test (headless):

```bash
npm test
```

Or run headed (see the browser):

```bash
npm run test:headed
```

Notes
- The test uses the Playwright Test runner and TypeScript.
- The test navigates to the demo app base URL configured in `playwright.config.ts` and performs the login flow.
- If you want to integrate this into your existing project layout, move the `tests` folder contents and config to the desired location and update `playwright.config.ts` accordingly.

