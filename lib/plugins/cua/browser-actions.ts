import { chromium, type Browser, type Page } from "playwright-core";

/**
 * Launches a headless browser instance.
 * @returns {Promise<Browser>} A promise that resolves to the browser instance.
 */
export async function launchBrowser(): Promise<Browser> {
  return await chromium.launch({ headless: true });
}

/**
 * Navigates to a specific URL in a new page.
 * @param {Browser} browser - The browser instance to use.
 * @param {string} url - The URL to navigate to.
 * @returns {Promise<Page>} A promise that resolves to the new page instance.
 */
export async function goToUrl(browser: Browser, url: string): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  return page;
}

/**
 * Takes a screenshot of the current page.
 * @param {Page} page - The page to take a screenshot of.
 * @returns {Promise<string>} A promise that resolves to the Base64 encoded screenshot.
 */
export async function takeScreenshot(page: Page): Promise<string> {
  const screenshotBuffer = await page.screenshot({ fullPage: true });
  return screenshotBuffer.toString("base64");
}

/**
 * Clicks an element on the page that matches the given selector.
 * @param {Page} page - The page to perform the click on.
 * @param {string} selector - The CSS selector of the element to click.
 */
export async function clickElement(page: Page, selector: string): Promise<void> {
  await page.click(selector);
}