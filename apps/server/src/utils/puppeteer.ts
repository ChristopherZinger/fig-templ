import puppeteer, { Page } from "puppeteer-core";
import { config } from "dotenv";

const ENV = process.env.NODE_ENV;
if (ENV !== "production") {
  config({ path: ".env" });
}
const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;

export async function withBrowserPage(
  fn: (browser: Page) => Promise<void>
): Promise<void> {
  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
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
    console.error("failed_to_execute_function_with_browser", error);
    throw error;
  } finally {
    try {
      console.log("closing_browser");
      await page.close();
      await context.close();
      await browser.close();
    } catch (closeError) {
      console.error("error_closing_browser", closeError);
    }
  }
}
