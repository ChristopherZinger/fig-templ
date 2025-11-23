import type { MainThreadMsg, MsgPayload } from "../lib/utils/shared/messages";

export function sendToUiThread<T extends MainThreadMsg>(
  msg: T,
  payload: Extract<MsgPayload, { type: T }>["data"]
): void {
  figma.ui.postMessage({ type: msg, data: payload });
}
