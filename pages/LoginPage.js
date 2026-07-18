/*const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');


class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Role/label based locators are preferred - they survive markup changes better
    // than CSS classes. Verify these against your Control Room's actual login form.
    //this.usernameInput = page.getByLabel(/username|email/i);
    this.usernameInput = page.locator('input[name="username"]');
    //this.passwordInput = page.getByLabel(/password/i);
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: /log ?in|sign ?in/i });
    this.errorMessage = page.locator('.error-message, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/#/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertLoginSuccessful() {
    // After login, Control Room typically redirects to a dashboard/home route.
    await expect(this.page).toHaveURL(/dashboard|home|myautomation/i, { timeout: 15000 });
  }

  async assertLoginError(expectedMessage) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }
}

module.exports = { LoginPage };
*/

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {

    constructor(page) {
        super(page);

        this.page = page;

        this.usernameInput = page.getByRole('textbox', {
            name: 'Username'
        });

        this.passwordInput = page.getByRole('textbox', {
            name: 'Password'
        });

        this.loginButton = page.getByRole('button', {
            name: 'Log in'
        });

        this.automationLink = page.getByRole('link', {
            name: 'Automation',
            exact: true
        });
    }

    async goto() {
        await this.page.goto('/#/login?next=/index');
    }

    async login(username, password) {

        await expect(this.usernameInput).toBeVisible({
            timeout: 30000
        });

        await this.usernameInput.fill(username);

        await this.passwordInput.fill(password);

        await this.loginButton.click();

        // Wait until login completes
        await expect(this.automationLink).toBeVisible({
            timeout: 60000
        });
    }

    async assertLoginSuccessful() {

        await expect(this.automationLink).toBeVisible({
            timeout: 30000
        });

    }

}

module.exports = { LoginPage };