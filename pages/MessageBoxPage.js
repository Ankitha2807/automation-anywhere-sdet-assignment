const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class MessageBoxPage extends BasePage {
  constructor(page) {
    super(page);

    // Left Actions panel
    this.actionsSearchInput = page.getByPlaceholder(/search actions/i);

    // Search result
    this.messageBoxActionItem = page.locator('text=Message box').last();

    // Canvas node (after adding)
    this.canvasMessageBox = page.locator('text=Message box').last();

    // Right Action Details panel
    //this.messageTitleInput = page.locator('input').nth(0);
    //this.messageBodyInput = page.locator('input').nth(1);
    this.messageTitleInput = page.locator(
    'div[role="textbox"][name="title"]'
);

this.messageBodyInput = page.locator(
    'div[role="textbox"][name="content"]'
);
    this.scrollbarLinesInput = page.locator('input').nth(2);
    this.closeAfterCheckbox = page.locator('input[type="checkbox"]');
    this.closeAfterSecondsInput = page.locator('input').nth(3);

    // Save button
    this.saveButton = page.getByRole('button', { name: /^Save$/ });
    this.cancelButton = page.getByRole('button', { name: /^Cancel$/i });

    this.canvasWarningIcon = page.locator('[class*=warning],[class*=error]').first();
  }

  async searchAction(actionName) {
    await this.actionsSearchInput.fill(actionName);
  }

  async addMessageBoxToCanvas() {
    await this.actionsSearchInput.fill('Message');

    const messageAction = this.page.getByRole('button', {
        name: 'Message box',
        exact: true
    });

    // Only click the category header if the leaf action isn't already
    // visible - clicking an already-expanded category collapses it.
    const alreadyVisible = await messageAction.isVisible().catch(() => false);
    if (!alreadyVisible) {
        await this.page.getByRole('button', { name: ' Message box' }).click();
    }

    await expect(messageAction).toBeVisible({ timeout: 15000 });
    await messageAction.dblclick();

    await expect(
        this.page.locator('[data-package-object-key="messagebox#messagebox"]')
    ).toBeVisible({ timeout: 30000 });

    await this.page
        .locator('[data-package-object-key="messagebox#messagebox"]')
        .click();
}

  async assertRequiredFieldWarningVisible() {
    await expect(this.canvasWarningIcon).toBeVisible();
  }

  async configureMessageBox({ title, message }) {

    // Title
    await this.page.getByRole('textbox').nth(1).click();

    await this.page.keyboard.press('Control+A');

    await this.page.keyboard.type(title);

    // Message
    await this.page.getByRole('textbox').nth(2).click();

    await this.page.keyboard.press('Control+A');

    await this.page.keyboard.type(message);

}

  async assertFieldValues({ title, message }) {
    if (title) {
      await expect(this.messageTitleInput).toHaveValue(title);
    }

    await expect(this.messageBodyInput).toHaveValue(message);
  }

  async toggleCloseAfter(checked) {
    if (checked) {
      await this.closeAfterCheckbox.check();
      await expect(this.closeAfterSecondsInput).toBeEnabled();
    } else {
      await this.closeAfterCheckbox.uncheck();
      await expect(this.closeAfterSecondsInput).toBeDisabled();
    }
  }

  async saveBot() {
    await expect(this.saveButton).toBeEnabled({
      timeout: 15000
    });

    await this.saveButton.click();
  }

  async assertSaveConfirmation() {

    await expect(this.page).toHaveURL(/edit/, {
        timeout: 30000
    });

}
}

module.exports = { MessageBoxPage };