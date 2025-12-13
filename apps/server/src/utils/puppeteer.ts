import puppeteer, { Page } from "puppeteer-core";
import { config } from "dotenv";
import { log } from "@templetto/logging";

const ENV = process.env.NODE_ENV;
if (ENV !== "production") {
  config({ path: ".env" });
}
const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;

export async function withBrowserPage(
  dimensions: { widthPx: number; heightPx: number },
  fn: (browser: Page) => Promise<void>
): Promise<void> {
  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: dimensions.heightPx,
    width: dimensions.widthPx,
    isLandscape: false,
    isMobile: false,
  };

  const browser = await puppeteer.launch({
    executablePath: PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    defaultViewport: viewport,
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  page.setDefaultTimeout(1000 * 60);
  page.setDefaultNavigationTimeout(1000 * 60);

  try {
    await fn(page);
  } catch (error) {
    log.error("failed_to_execute_function_with_browser", error);
    throw error;
  } finally {
    try {
      log.debug("closing_browser");
      await page.close();
      await context.close();
      await browser.close();
    } catch (closeError) {
      log.error("error_closing_browser", closeError);
    }
  }
}
