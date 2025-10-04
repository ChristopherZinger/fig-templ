import express from "express";
import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import type { Request } from "express";
import z from "zod";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const withBrowser = async (fn: (browser: Browser) => Promise<void>) => {
  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
  };
  const browser = await puppeteer.launch({
    args: puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
    defaultViewport: viewport,
    executablePath: await chromium.executablePath(),
    headless: "shell",
  });
  await fn(browser).finally(() => browser.close());
};

function parseRequestBody(req: Request): URL | null {
  try {
    const schema = z.object({
      url: z.string().url(),
    });

    const { url } = schema.parse(req.body);
    return new URL(url);
  } catch (error) {
    console.error(error);
    return null;
  }
}

app.post("/", async (req, res) => {
  fs.mkdirSync("tmp/templetto", { recursive: true });

  const url = parseRequestBody(req);
  if (!url) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  withBrowser(async (browser) => {
    console.log("create a new page");
    const page = await browser.newPage();

    console.log("navigate to:", url.toString());
    await page.goto(url.toString());

    console.log("take a screenshot");
    const filePath = "tmp/templetto/out.png";
    const screenshotBuffer = await page.screenshot({
      path: filePath,
      encoding: "binary",
    });

    res.set({
      "Content-Type": "image/png",
      "Content-Length": screenshotBuffer.length,
      "Cache-Control": "no-cache",
    });

    // Send the image buffer directly
    res.send(screenshotBuffer);
  });
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
