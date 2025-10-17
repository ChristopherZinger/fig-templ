import { MainThreadMsg, UiMsg } from "../lib/utils/messages";
import { makeFrames } from "./node-builder";

const SESSION_TOKEN_KEY = "session_token";

export function setMessageRouter(figma: PluginAPI) {
  figma.ui.onmessage = async (msg) => {
    console.log("got_message_main_t", msg);
    switch (msg.type) {
      case UiMsg.RequestSessionCookie:
        postSessionCookieMessage();
        break;
      case UiMsg.ShowPreview:
        makeFrames();
        break;
      default:
        console.log("got_unknown_message_in_main_thread", msg);
        break;
    }
  };
}

async function postSessionCookieMessage() {
  console.log("postSessionCookieMessage");
  try {
    const session =
      (await figma.clientStorage.getAsync(SESSION_TOKEN_KEY)) || null;
    figma.ui.postMessage({
      type: MainThreadMsg.PostSessionCookie,
      data: { session },
    });
  } catch (error) {
    console.error("error_posting_session_cookie_message", error);
  }
}
