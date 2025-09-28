import { z } from "zod";
import type { Plugin } from "../types";
import { launchBrowser, goToUrl, takeScreenshot } from "./browser-actions";

const browserInputSchema = z.object({
  url: z.string().url("A valid URL is required."),
});

export const browserCUAPlugin: Plugin<typeof browserInputSchema> = () => ({
  name: "browseAndCapture",
  description:
    "Launches a headless browser, navigates to a URL, and takes a screenshot. Use this to see what a webpage looks like.",
  inputSchema: browserInputSchema,
  execute: async ({ url }) => {
    let browser;
    try {
      browser = await launchBrowser();
      const page = await goToUrl(browser, url);
      const screenshot = await takeScreenshot(page);

      return {
        success: true,
        message: `Screenshot of ${url} captured successfully.`,
        data: {
          screenshot: screenshot,
          format: "base64",
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error in browserCUAPlugin for URL ${url}:`, errorMessage);
      return {
        success: false,
        error: `Failed to capture screenshot of ${url}. Reason: ${errorMessage}`,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
});