import { setMessageRouter } from "./message-router.js";

figma.showUI(__html__, { width: 1000, height: 1000, title: "Figma Template" });

setMessageRouter(figma);
