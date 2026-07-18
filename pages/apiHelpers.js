/**
 * apiHelpers
 *
 * The assignment's general instructions ask for "API response validations
 * and functional correctness" alongside the UI assertions. Since both use
 * cases are specified as UI flows, the practical way to satisfy this is to
 * listen for the underlying network calls the UI triggers (e.g. saving a
 * bot, saving a form/rule) and assert on their response status/body -
 * rather than calling endpoints directly and separately.
 *
 * Usage inside a test:
 *   const { waitForApiResponse } = require('../pages/apiHelpers');
 *   const responsePromise = waitForApiResponse(page, /\/v2\/automations\/bots/, 'POST');
 *   await messageBoxPage.saveBot();
 *   const response = await responsePromise;
 *   expect(response.status()).toBe(200);
 */

/**
 * @param {import('@playwright/test').Page} page
 * @param {RegExp} urlPattern - matched against the request URL
 * @param {string} [method] - optional HTTP method filter, e.g. 'POST'
 */
function waitForApiResponse(page, urlPattern, method) {
  return page.waitForResponse((response) => {
    const matchesUrl = urlPattern.test(response.url());
    const matchesMethod = !method || response.request().method() === method;
    return matchesUrl && matchesMethod;
  });
}

module.exports = { waitForApiResponse };
