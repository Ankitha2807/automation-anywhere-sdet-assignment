/**
 * BasePage
 * Shared helpers for every Page Object. Keep only cross-cutting, reusable
 * logic here (waits, generic assertions, toast handling) - page-specific
 * locators belong in their own Page Object classes.
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  /**
   * Waits for and returns the text of a success/confirmation toast.
   * TODO: confirm the actual toast/notification selector in your Control Room -
   * inspect it once via DevTools or `npm run codegen` and update the locator below.
   */
  async getToastMessage() {
    const toast = this.page.locator('[role="alert"], .toast, .notification-message').first();
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    return toast.innerText();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { BasePage };
