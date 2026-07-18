const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class AutomationPage extends BasePage {

    constructor(page) {
        super(page);

        this.page = page;

        // Left navigation
        this.automationNav = page.getByRole('link', {
            name: 'Automation',
            exact: true
        });

        // Create button
        this.createDropdown = page
            .getByRole('heading', {
                name: 'Automation Create Manage'
            })
            .getByLabel('Create');

        // Task Bot option (from Codegen)
        this.taskBotOption = page.getByRole('button', {
            name: /Task Bot/
        });

        // Name textbox
        this.botNameInput = page.getByRole('textbox', {
            name: 'Name'
        });

        // Create & Edit button
        this.createAndEditButton = page.getByRole('button', {
            name: 'Create & edit'
        });

        this.formOption = this.page.getByRole('button', {
    name: /Form/
});

    }

    async navigateToAutomation() {

        await expect(this.automationNav).toBeVisible({
            timeout: 30000
        });

        await this.automationNav.click();

        await expect(this.page).toHaveURL(/bots\/repository/, {
            timeout: 30000
        });

        await expect(this.createDropdown).toBeVisible({
            timeout: 30000
        });

    }

    async openCreateDropdown() {

        await this.createDropdown.click();

        await expect(this.taskBotOption).toBeVisible({
            timeout: 15000
        });

    }

    async selectCreateTaskBot() {

        await this.openCreateDropdown();

        await this.taskBotOption.click();

        await expect(this.botNameInput).toBeVisible({
            timeout: 15000
        });

    }

    async selectCreateForm(formName = `PlaywrightForm_${Date.now()}`) { 

    await this.openCreateDropdown();

    await expect(this.formOption).toBeVisible({
        timeout: 15000
    });

    await this.formOption.click();

    // Wait for Create Form dialog
    const nameInput = this.page.getByRole('textbox', {
        name: 'Name'
    });

    await expect(nameInput).toBeVisible({
        timeout: 30000
    });

    await nameInput.fill(formName);

    await this.page.getByRole('button', {
        name: /Create & edit/i
    }).click();

    // Confirmed live: the Form Builder renders inside an iframe. Waiting for
    // that iframe to appear is more reliable than guessing the exact URL
    // shape, which may not literally contain "form/edit".
    await this.page.locator('iframe').first().waitFor({
        state: 'visible',
        timeout: 60000
    });

    await this.page.waitForLoadState('domcontentloaded');

}
    async fillTaskBotDetails({ name }) {

        await this.botNameInput.click();

        await this.botNameInput.press('Control+A');

        await this.botNameInput.fill(name);

    }

    async submitCreate() {

        await this.createAndEditButton.click();

        await expect(this.page).toHaveURL(/editor|bots/, {
            timeout: 30000
        });

    }

}

module.exports = { AutomationPage };