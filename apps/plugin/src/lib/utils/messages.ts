import type { UiMsg } from "./shared/messages";

export function sendToMainThread(
  msg: UiMsg,
  payload?: Record<string, any>
): void {
  parent.postMessage({ pluginMessage: { type: msg, data: payload } }, "*");
}
