# Automation Anywhere Community Edition - UI Automation Suite

Automated UI tests for two flows in Automation Anywhere Community Edition:

1. **Use Case 1** - Message Box Task creation (Task Bot editor)
2. **Use Case 2** - Form Builder + Rules Builder (rule creation, conditions, actions, context menu)

Built with **Playwright + JavaScript**, following the **Page Object Model (POM)** design pattern.

## Framework & Tools

| Tool | Purpose |
|---|---|
| Playwright Test | Browser automation + test runner |
| Node.js / JavaScript | Language |
| dotenv | Loads credentials/URL from a local `.env` file (never committed) |
| Playwright HTML Reporter | Test run reports (`npm run test:report`) |

## Project Structure

```
sdet-assignment/
├── pages/                        # Page Object Model classes
│   ├── BasePage.js               # Shared helpers (toasts, waits)
│   ├── LoginPage.js
│   ├── AutomationPage.js         # Left nav + Create dropdown + Task Bot creation
│   ├── MessageBoxPage.js         # Use Case 1: Actions panel, Message Box config
│   ├── FormPage.js               # Use Case 2: canvas, textbox drag/drop, properties
│   ├── RulesBuilderPage.js       # Use Case 2: rules, conditions, actions, context menu
│   └── apiHelpers.js             # Network response assertions
├── tests/
│   ├── usecase1-messagebox.spec.js
│   └── usecase2-rulesbuilder.spec.js
├── playwright.config.js
├── .env.example                  # Copy to .env and fill in your own values
└── package.json
```

## Setup

1. **Install Node.js** (v18+ recommended).
2. Install dependencies:
   ```
   npm install
   npx playwright install --with-deps chromium
   ```
3. Copy the environment template and fill in your own Community Edition credentials:
   ```
   cp .env.example .env
   ```
   Then edit `.env`:
   ```
   AA_BASE_URL=https://<your-control-room-url>.cloud.automationanywhere.digital
   AA_USERNAME=<your registered email>
   AA_PASSWORD=<your password>
   ```
   Your control room URL is account-specific and was sent in your Community Edition welcome email - it is **not** a fixed public URL. `.env` is gitignored, so credentials are never pushed to the repo.

## Running the Tests

```
npm test                    # run all tests, headless
npm run test:headed         # run with a visible browser (useful while debugging)
npm run test:usecase1       # Message Box Task tests only
npm run test:usecase2       # Rules Builder tests only
npm run test:report         # open the last HTML report
```

## ⚠️ Important note on selectors

This suite was built without live access to a running, authenticated Community Edition
instance, so exact CSS selectors / test-ids for a few elements are marked `TODO` in the
Page Object files and use best-guess role/label-based locators (e.g. `getByRole`,
`getByLabel`) instead of brittle CSS classes wherever possible - these are Playwright's
recommended, most resilient locator strategy and should work if the app's markup follows
standard accessibility patterns (ARIA roles/labels).

Before the first real run:
1. Log into your Control Room manually once.
2. Use Playwright's codegen tool to record the exact selectors as you click through
   each flow yourself - this is the fastest way to close any gaps:
   ```
   npm run codegen
   ```
3. Cross-check the generated selectors against the `TODO` comments in `pages/*.js`
   and update as needed (mainly: toast/notification selector in `BasePage.js`,
   rule card / condition row structure in `RulesBuilderPage.js`, and the drag-and-drop
   mechanism in `FormPage.js` if the app doesn't use native HTML5 drag events).

## Test Coverage

### Use Case 1: Message Box Task (`usecase1-messagebox.spec.js`)
- Navigate to Automation, open Create > Task Bot dropdown
- Create a Task Bot with mandatory details
- Search Actions panel for "Message Box" and add it to the canvas
- Configure Message Box fields and verify entered data is reflected
- Save the bot and assert the success/confirmation toast
- Assert the underlying save API call returns a successful (2xx) response

### Use Case 2: Form with Rules Builder (`usecase2-rulesbuilder.spec.js`)
- Add two Textbox elements to the form canvas
- Configure textbox properties (label, min/max length, hint, tooltip, default value)
- Save the form and navigate to the Rules tab
- Create Rule1 and verify it renders in expanded mode with an Edit button
- Add a condition (element + condition type), set AND mode, add a second condition
- Add a Set Value action targeting the other textbox element
- Use the rule card's context menu ("Add Rule Below") to create Rule2, then Rule3
- Save, reload, and verify all three rules persist in the correct order

All tests are tagged (`@usecase1`, `@usecase2`, `@ui`, `@api`, `@functional`, `@smoke`)
so subsets can be run with `npx playwright test --grep @usecase2`.

## Environment / Configuration Notes

- Tests run against a single Chromium project by default (see `playwright.config.js`);
  additional browsers can be added under `projects`.
- `workers: 1` and `fullyParallel: false` are intentional - both use cases share one
  logged-in session flow and Community Edition rate-limits/queues bot creation, so
  serial execution is more reliable than parallel workers here.
- Screenshots, video, and trace are captured automatically on failure for debugging
  (`test-results/` and `playwright-report/`, both gitignored).
