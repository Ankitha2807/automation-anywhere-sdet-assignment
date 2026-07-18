const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { AutomationPage } = require('../pages/AutomationPage');
const { FormPage } = require('../pages/FormPage');
const { RulesBuilderPage } = require('../pages/RulesBuilderPage');

test('Use Case 2: Form with Rules Builder - full flow @usecase2', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const automationPage = new AutomationPage(page);
  const formPage = new FormPage(page);
  const rulesPage = new RulesBuilderPage(page);

  await loginPage.goto();
  await loginPage.login(process.env.AA_USERNAME, process.env.AA_PASSWORD);
  await loginPage.assertLoginSuccessful();

  await automationPage.navigateToAutomation();
  await automationPage.selectCreateForm();

  // Textbox 1 - all properties from the assignment's step 4
  await formPage.dragTextboxOntoCanvas();
  await formPage.selectCanvasTextbox(0);
  await formPage.setTextboxProperties({
    label: 'First Name',
    minLength: 2,
    maxLength: 50,
    hintText: 'Enter first name',
    tooltip: 'Required field',
    defaultValue: '',
  });

  // Textbox 2 - all properties
  await formPage.dragTextboxOntoCanvas();
  await formPage.selectCanvasTextbox(1);
  await formPage.setTextboxProperties({
    label: 'Last Name',
    minLength: 2,
    maxLength: 50,
    hintText: 'Enter last name',
    tooltip: 'Required field',
    defaultValue: '',
  });

  await formPage.saveForm();
  await formPage.goToRulesTab();

  // Add Rule button visible and functional
  await expect(rulesPage.addRuleButton).toBeVisible();
  await rulesPage.addRule();
  await rulesPage.assertRuleVisible('Rule1');
  // Rules displayed in expanded mode
  await rulesPage.assertRuleExpanded();
  // Edit button present on the rule card
  await rulesPage.assertEditButtonPresent();

  // Condition 1: no value needed (asserts value input is hidden)
  await rulesPage.addCondition({ element: 'First Name', conditionType: 'Is Not Empty' });

  await rulesPage.clickAddCondition();

  // AND/OR condition mode selection works - the toggle appears once a
  // second condition exists, as the connector between condition 1 and 2.
  await rulesPage.setConditionModeAnd();

  // Condition 2: value needed (asserts value input is visible, then fills it)
  await rulesPage.addCondition({ element: 'Last Name', conditionType: 'Contains', value: 'Doe' });

  // Set Value action assigned to target element
  await rulesPage.addAction({ targetElement: 'Last Name', value: 'Auto-filled' });

  // Context menu "Add Rule Below" - Rule2, then Rule3
  await rulesPage.addRuleBelowViaContextMenu();
  await rulesPage.assertRuleVisible('Rule2');

  await rulesPage.addRuleBelowViaContextMenu();
  await rulesPage.assertRuleVisible('Rule3');

  // All rules visible in the rules list after creation
  expect(await rulesPage.getRuleCount()).toBeGreaterThanOrEqual(3);

  await formPage.saveForm();

  // Save and verify all rules persist after reload
  await page.reload();
  await formPage.goToRulesTab();
  await rulesPage.assertRuleVisible('Rule1');
  await rulesPage.assertRuleVisible('Rule2');
  await rulesPage.assertRuleVisible('Rule3');
});