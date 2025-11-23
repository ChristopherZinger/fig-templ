import { sessionTokenStore } from "../stores/sessionTokenStore";
import { MainThreadMsg, type MsgPayload, type UiMsg } from "./shared/messages";
import type { AppMessageEvent } from "./window-ev-listener-utils";

export function sendToMainThread<T extends UiMsg>(
  msg: T,
  payload: Extract<MsgPayload, { type: T }>["data"]
): void {
  parent.postMessage({ pluginMessage: { type: msg, data: payload } }, "*");
}

export function handleSessionTokenMessages(event: AppMessageEvent) {
  const { type, data } = event.data.pluginMessage;
  switch (type) {
    case MainThreadMsg.PostSessionCookie: {
      if (!data.session || typeof data.session === "string") {
        sessionTokenStore.set(data.session);
        return;
      }
      console.error("unexpected_session_token_type", { data });
      return;
    }
    case MainThreadMsg.Logout: {
      sessionTokenStore.set(null);
      return;
    }
    default: {
      return;
    }
  }
}
