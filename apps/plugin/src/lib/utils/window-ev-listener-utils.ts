import type { MsgPayload } from "./shared/messages";

export type AppMessageEvent = MessageEvent<{ pluginMessage: MsgPayload }>;

export function getMessageEventListener(cb: (event: AppMessageEvent) => void) {
  window.addEventListener("message", (ev) => {
    cb(ev as AppMessageEvent);
  });
  return () => window.removeEventListener("message", cb);
}
