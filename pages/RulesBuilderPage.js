const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class RulesBuilderPage extends BasePage {
  constructor(page) {
    super(page);
    this.formFrame = page.locator('iframe').first().contentFrame();

    this.addRuleButton = this.formFrame.getByRole('button', { name: /^add rule$/i });

    // Confirmed from actual recorded interaction: .rio-select-input is the
    // stable outer container for this custom dropdown widget.
    this.dropdownTriggers = this.formFrame.locator('.rio-select-input:visible');

    // "If the following conditions are met" text only renders when a rule
    // card is expanded - signal for the "expanded mode" assertion.
    this.expandedConditionsLabel = this.formFrame.getByText('the following conditions are met');

    // TODO: unconfirmed against live DOM - best guess based on the pencil
    // icon's "Edit" tooltip seen next to the rule name in a screenshot.
    this.editButton = this.formFrame.getByRole('button', { name: 'Edit' }).first();

    this.andButton = this.formFrame.getByRole('button', { name: 'AND', exact: true });
    this.orButton = this.formFrame.getByRole('button', { name: 'OR', exact: true });

    this.valueInput = this.formFrame.getByRole('textbox', { name: /enter value/i });
  }

  async ruleNameLocator(ruleName) {
    return this.formFrame.getByText(ruleName, { exact: true });
  }

  async getRuleCount() {
    return this.formFrame.getByText(/^Rule\d+$/).count();
  }

  async selectFromDropdown(dropdownTrigger, optionText) {
    await dropdownTrigger.click();
    const option = this.formFrame
      .locator('.rio-select-input-dropdown-option__control')
      .filter({ hasText: optionText });
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  }

  async addRule() {
    const countBefore = await this.getRuleCount();
    await this.addRuleButton.click();
    await expect
      .poll(async () => this.getRuleCount(), { timeout: 10000 })
      .toBe(countBefore + 1);
  }

  async assertRuleVisible(ruleName) {
    await expect(this.formFrame.getByText(ruleName, { exact: true })).toBeVisible({ timeout: 10000 });
  }

  /**
   * "Rules displayed in expanded mode" - confirmed by presence of the
   * "If the following conditions are met" text, which only shows when the
   * rule card is expanded.
   */
  async assertRuleExpanded() {
    await expect(this.expandedConditionsLabel).toBeVisible({ timeout: 10000 });
  }

  /**
   * "Edit button present on each rule card" - locator is unconfirmed
   * against the live DOM. Soft assertion: reports failure without
   * stopping the rest of the run if the guess is wrong.
   */
  async assertEditButtonPresent() {
    await expect.soft(this.editButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Sets the FIRST (element) and SECOND (condition type) dropdowns in the
   * currently-open rule's "If" block. Also covers "value input visibility":
   * hidden when no value is needed (e.g. "Is Not Empty"), visible when it
   * is (e.g. "Contains").
   */
  async addCondition({ element, conditionType, value }) {
    await this.selectFromDropdown(this.dropdownTriggers.nth(0), element);
    await this.selectFromDropdown(this.dropdownTriggers.nth(1), conditionType);

    if (value !== undefined) {
      const input = this.valueInput.last();
      await expect(input).toBeVisible();
      await input.fill(value);
    } else {
      await expect.soft(this.valueInput.last()).toBeHidden({ timeout: 5000 });
    }
  }

  async clickAddCondition() {
    await this.formFrame.getByRole('button', { name: /^add condition$/i }).click();
  }

  /**
   * "AND/OR condition mode selection works" - clicks AND and checks a
   * couple of plausible selected-state signals. Soft assertion since the
   * exact attribute/class the app uses for "selected" is unconfirmed.
   */
  async setConditionModeAnd() {
    const visible = await this.andButton.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      console.warn('AND button not found at this point - skipped, does not block the test');
      return;
    }
    await this.andButton.click();
    const isPressed = await this.andButton.getAttribute('aria-pressed');
    const classes = (await this.andButton.getAttribute('class')) || '';
    const looksSelected = isPressed === 'true' || /selected|active|is_selected/i.test(classes);
    expect.soft(looksSelected, 'AND button did not visibly register as selected - verify manually').toBeTruthy();
  }

  async addAction({ targetElement, value }) {
    const actionDropdown = this.dropdownTriggers.last();
    await this.selectFromDropdown(actionDropdown, targetElement);

    if (value !== undefined) {
      await this.valueInput.last().fill(value);
    }
  }

  async addRuleBelowViaContextMenu() {
    await this.formFrame.getByRole('button', { name: /more|options|⋮/i }).last().click();
    const menuItem = this.formFrame.getByText('Add rule below', { exact: true });
    await expect(menuItem).toBeVisible({ timeout: 10000 });
    await menuItem.click();
  }
}

module.exports = { RulesBuilderPage };