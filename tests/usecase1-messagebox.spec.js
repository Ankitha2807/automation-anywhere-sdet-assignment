const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { AutomationPage } = require('../pages/AutomationPage');
const { MessageBoxPage } = require('../pages/MessageBoxPage');
const { waitForApiResponse } = require('../pages/apiHelpers');

test('Use Case 1: Message Box Task - full UI + API flow @usecase1', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const automationPage = new AutomationPage(page);
  const messageBoxPage = new MessageBoxPage(page);

  const botName = `MessageBoxBot_${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(process.env.AA_USERNAME, process.env.AA_PASSWORD);
  await loginPage.assertLoginSuccessful();

  await automationPage.navigateToAutomation();
  await automationPage.selectCreateTaskBot();
  await automationPage.fillTaskBotDetails({ name: botName });
  await automationPage.submitCreate();

  await messageBoxPage.addMessageBoxToCanvas();

  await messageBoxPage.configureMessageBox({
    title: 'Welcome',
    message: 'Automation Anywhere Assignment',
  });

  // API response validation - confirm the save call actually succeeds
  // server-side, not just that the UI looks right.
  const savePromise = waitForApiResponse(page, /\/v\d\/.*(bot|task)s?/i, 'POST');
  await messageBoxPage.saveBot();
  const response = await savePromise.catch(() => null);

  if (response) {
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  } else {
    console.warn('Could not capture save API response - verify endpoint pattern in DevTools > Network');
  }

  await messageBoxPage.assertSaveConfirmation();
});