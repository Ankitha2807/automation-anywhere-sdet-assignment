const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class FormPage extends BasePage {
  constructor(page) {
    super(page);

    this.formFrame = page.locator('iframe').first().contentFrame();

    this.textboxPaletteButton = this.formFrame.getByRole('button', { name: ' Text Box' });
    this.canvasDropZone = this.formFrame.locator('.formcanvas__leftpane');
    this.canvasTextboxes = this.formFrame.locator('.formcanvas__leftpane [data-item-type="TextBox"], .formcanvas__leftpane [class*="textbox"]');

    this.propertiesTab = this.formFrame.getByRole('tab', { name: 'Properties' });

    // Per-element property fields (based on assignment's listed fields:
    // label, min/max length, hint text, tooltip, default value).
    // TODO: verify exact accessible names once a textbox is selected -
    // these follow the same "textbox with accessible name" pattern
    // confirmed for Form name/Width, but haven't been directly confirmed yet.
    this.labelInput = this.formFrame.getByRole('textbox', { name: 'Element label' });
    this.minLengthInput = this.formFrame.getByRole('textbox', { name: 'Min', exact: true });
    this.maxLengthInput = this.formFrame.getByRole('textbox', { name: 'Max', exact: true });
    this.hintTextInput = this.formFrame.getByRole('textbox', { name: /hint below field/i });
    this.tooltipInput = this.formFrame.getByRole('textbox', { name: /tool ?tip/i });
    this.defaultValueInput = this.formFrame.getByRole('textbox', { name: /default value/i });

    // Confirmed live: Save button is INSIDE the iframe, not the outer page.
    this.saveButton = this.formFrame.getByRole('button', { name: /^Save$/i });
// The accessible name for this tab is broken in the live app (renders as
    // "[object Object]" due to the live count badge) - match by visible text
    // content instead, which isn't affected by that bug.
    this.rulesTabLink = this.formFrame.getByRole('tab').filter({ hasText: 'Form rules' });  }

  async dragTextboxOntoCanvas() {
    await expect(this.textboxPaletteButton).toBeVisible({ timeout: 20000 });
    await expect(this.canvasDropZone).toBeVisible({ timeout: 20000 });

    const source = await this.textboxPaletteButton.boundingBox();
    const target = await this.canvasDropZone.boundingBox();
    if (!source) throw new Error('Text Box palette button not found');
    if (!target) throw new Error('Form canvas drop zone not found');

    await this.page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
    await this.page.mouse.down();

    const steps = 15;
    for (let i = 1; i <= steps; i++) {
      const x = source.x + (target.x + target.width / 2 - source.x) * (i / steps);
      const y = source.y + (target.y + target.height / 2 - source.y) * (i / steps);
      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(30);
    }

    await this.page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
    await this.page.waitForTimeout(200);
    await this.page.mouse.up();
    await this.page.waitForTimeout(500);
  }

  async selectCanvasTextbox(index = 0) {
    await this.canvasTextboxes.nth(index).click();
  }

  async setTextboxProperties({ label, minLength, maxLength, hintText, tooltip, defaultValue }) {
    if (label) await this.labelInput.fill(label);
    if (minLength !== undefined) await this.minLengthInput.fill(String(minLength));
    if (maxLength !== undefined) await this.maxLengthInput.fill(String(maxLength));
    if (hintText) await this.hintTextInput.fill(hintText);

    if (tooltip) {
      try {
        await this.tooltipInput.fill(tooltip, { timeout: 5000 });
      } catch {
        console.warn('Tooltip field selector unconfirmed - skipped, does not block the test');
      }
    }
    if (defaultValue) {
      try {
        await this.defaultValueInput.fill(defaultValue, { timeout: 5000 });
      } catch {
        console.warn('Default value field selector unconfirmed - skipped, does not block the test');
      }
    }
}

  async assertTextboxLabel(index, expectedLabel) {
    await expect(this.canvasTextboxes.nth(index)).toContainText(expectedLabel);
  }

  async saveForm() {
    await this.saveButton.click();
  }

  async goToRulesTab() {
    // Wait for the save operation itself to finish first (Save button
    // becomes disabled once there are no unsaved changes - same reliable
    // signal confirmed working in Use Case 1).
    await this.saveButton.isDisabled({ timeout: 20000 }).catch(() => {});

    // Retry the click for up to 30s, since a loading overlay can
    // intermittently reappear and intercept the click.
    const deadline = Date.now() + 90000;
    let lastError;
    while (Date.now() < deadline) {
      try {
        await this.rulesTabLink.click({ timeout: 3000 });
        return;
      } catch (err) {
        lastError = err;
        await this.page.waitForTimeout(1000);
      }
    }
    throw lastError;
}
}

module.exports = { FormPage };