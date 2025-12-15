const isProduction = process.env.NODE_ENV === "production"

const WEBAPP_URL = isProduction
  ? "https://templetto.com"
  : "http://localhost:5173"
const API_URL = isProduction
  ? "https://api.templetto.com"
  : "http://localhost:3000"
const PLUGIN_DOWNLOAD_URL =
  "https://www.figma.com/community/plugin/1570159248956206169/templetto"

const APP_NAME = "Templetto"
const APP_DESCRIPTION =
  "Turn your Figma designs into PDF documents with our powerful API. Template your designs and generate professional PDFs at scale."

export { WEBAPP_URL, PLUGIN_DOWNLOAD_URL, API_URL, APP_NAME, APP_DESCRIPTION }
