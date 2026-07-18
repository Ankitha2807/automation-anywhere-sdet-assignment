# Automation Anywhere Community Edition - UI Automation Suite

Automated UI tests for two flows in Automation Anywhere Community Edition:

1. **Use Case 1** - Message Box Task creation (Task Bot editor)
2. **Use Case 2** - Form Builder + Rules Builder (rule creation, conditions, actions, context menu)

Built with **Playwright + JavaScript**, following the **Page Object Model (POM)** design pattern.
Both flows were built and verified against a live Automation Anywhere Community Edition account.

## Framework & Tools

| Tool | Purpose |
|---|---|
| Playwright Test | Browser automation + test runner |
| Node.js / JavaScript | Language |
| dotenv | Loads credentials from a local `.env` file (never committed) |
| Playwright HTML Reporter | Test run reports (`npx playwright show-report`) |

## Project Structure
├── pages/                        # Page Object Model classes
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── AutomationPage.js         # Left nav + Create dropdown + Task Bot/Form creation
│   ├── MessageBoxPage.js         # Use Case 1: Actions panel, Message Box config
│   ├── FormPage.js               # Use Case 2: Form Builder (renders inside an iframe)
│   ├── RulesBuilderPage.js       # Use Case 2: rules, conditions, actions, context menu
│   └── apiHelpers.js             # Network response assertions
├── tests/
│   ├── usecase1-messagebox.spec.js
│   └── usecase2-rulesbuilder.spec.js
├── playwright.config.js
├── .env.example
└── package.json

## Setup

1. Install Node.js (v18+ recommended).
2. Install dependencies:
npm install
npx playwright install --with-deps chromium
3. Copy `.env.example` to `.env` and fill in your own Community Edition credentials:
AA_BASE_URL=<your control room URL, e.g. https://community.cloud.automationanywhere.digital>
AA_USERNAME=<your registered email>
AA_PASSWORD=<your password>
   `.env` is gitignored - credentials are never pushed to the repo.

## Running the Tests
npm test                    # run all tests, headless
npx playwright test tests/usecase1-messagebox.spec.js --headed
npx playwright test tests/usecase2-rulesbuilder.spec.js --headed
npx playwright show-report  # open the last HTML report

## Technical notes on the live app (things that weren't obvious upfront)

- **The Form Builder renders inside an `<iframe>`.** Every locator that touches the form
  canvas, properties panel, or Rules tab is scoped through `page.locator('iframe').first().contentFrame()`.
- **Adding a Textbox to the Form canvas requires a genuine mouse drag** (down → several
  intermediate `mousemove` steps → up). Double-click, which works for adding actions in the
  Task Bot editor, does not work here - the two builders use different interaction patterns.
- **Dropdown fields ("Select element") are a custom widget**, not a native `<select>`.
  They're opened by clicking `.rio-select-input`, then picking the option by its visible
  text from `.rio-select-input-dropdown-option__control`.
- **The "Form rules" tab has a broken accessible name** (renders as `[object Object]` in
  the accessibility tree, likely due to its live count badge) - matched by visible text
  instead of ARIA role name.
- A brief loading overlay can appear right after Save and intercept the next click -
  `goToRulesTab()` waits for the Save button to re-disable and retries the tab click for
  up to 90s to absorb this.
- Two field checks (Tooltip textarea, AND/OR selected-state) are implemented as **soft
  assertions** - they log a warning rather than failing the whole run, since their exact
  underlying markup wasn't fully confirmed during testing.

## Test Coverage

### Use Case 1 (`usecase1-messagebox.spec.js`)
Login → Automation nav → Create Task Bot → search & add Message Box action →
configure title/message/scrollbar lines → verify required-field validation →
save → assert save confirmation (Save button disables) → assert underlying save
API call returns a 2xx response.

### Use Case 2 (`usecase2-rulesbuilder.spec.js`)
Login → create Form → drag two Textboxes onto canvas → configure properties
(label, min/max length, hint, tooltip, default value) → save → open Rules tab →
create Rule1, assert expanded mode and Edit button → add two conditions (asserting
value-input visibility differs by condition type) → set AND mode → add a Set Value
action → use the rule card's "⋮" context menu to add Rule2, then Rule3 → save,
reload, and verify all three rules persist.

## Environment / Configuration Notes

- `workers: 1` and `fullyParallel: false` are intentional - both use cases share a
  logged-in session flow, and running serially proved far more reliable against this
  particular app than parallel workers.
- Screenshots, video, and trace are captured automatically on failure
  (`test-results/`, `playwright-report/` - both gitignored).