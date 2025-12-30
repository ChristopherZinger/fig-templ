import { setDragDropHandler } from "./drag-drop-handler.js";
import { setMessageRouter } from "./message-router.js";
import { PLUGIN_WINDOW_OPTIONS } from "./utils/plugin-window.js";

figma.showUI(__html__, PLUGIN_WINDOW_OPTIONS);

setMessageRouter(figma);
setDragDropHandler(figma);
