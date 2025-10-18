import { MainThreadMsg, UiMsg } from "../lib/utils/shared/messages";
import { sendToUiThread } from "./message-utils";
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
      case UiMsg.Logout:
        logoutMessage();
        break;
      // message from webapp; UiMsg is local type not shared with webapp repo
      case "post_session_cookie_to_ui_thread":
        figma.showUI(__html__, {
          width: 600,
          height: 600,
          title: "Figma Template",
        });
        saveSessionTokenMessage(msg.data.sessionToken);
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
    sendToUiThread(MainThreadMsg.PostSessionCookie, { session });
  } catch (error) {
    console.error("error_posting_session_cookie_message", error);
  }
}

async function saveSessionTokenMessage(sessionToken: string) {
  if (!sessionToken) {
    console.error("expected_session_token", { sessionToken });
    return;
  }

  try {
    await figma.clientStorage.setAsync(SESSION_TOKEN_KEY, sessionToken);
    sendToUiThread(MainThreadMsg.PostSessionCookie, { session: sessionToken });
  } catch (error) {
    console.error("error_saving_session_cookie_message", error);
  }
}

async function logoutMessage() {
  console.log("logoutMessage");
  try {
    const sessionToken = await figma.clientStorage.getAsync(SESSION_TOKEN_KEY);
    if (!sessionToken) {
      console.error("expected_session_token");
      return;
    }

    await figma.clientStorage.deleteAsync(SESSION_TOKEN_KEY);

    // return message to UI
  } catch (error) {
    console.error("error_logging_out", error);
  }
}
