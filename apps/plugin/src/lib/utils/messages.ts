import { sessionTokenStore } from "../stores/sessionTokenStore";
import { MainThreadMsg, type UiMsg } from "./shared/messages";

export function sendToMainThread(
  msg: UiMsg,
  payload?: Record<string, any>
): void {
  parent.postMessage({ pluginMessage: { type: msg, data: payload } }, "*");
}

export function handleSessionTokenMessages(event: MessageEvent) {
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
