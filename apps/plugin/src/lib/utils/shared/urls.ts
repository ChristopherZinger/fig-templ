function getUrls(mode: "development" | "production"): {
  webapp: string;
  server: string;
} {
  if (mode === "production") {
    return {
      webapp: "https://templetto.com",
      server: "https://api.templetto.com",
    };
  } else {
    return {
      webapp: "http://localhost:5173",
      server: "http://localhost:3000",
    };
  }
}

const NODE_ENV = process.env.NODE_ENV as "development" | "production";
// TODO: validate with zod

const URLS = getUrls(NODE_ENV);

export { URLS };
