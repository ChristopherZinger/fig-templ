import type { MainThreadMsg } from "../lib/utils/shared/messages";

export function sendToUiThread(
  msg: MainThreadMsg,
  payload: Record<string, any>
): void {
  figma.ui.postMessage({ pluginMessage: { type: msg, data: payload } });
}
