import { setMessageRouter } from "./message-router.js";

figma.showUI(__html__, { width: 600, height: 600, title: "Figma Template" });

setMessageRouter(figma);
