import { MainThreadMsg, UiMsg } from "../lib/utils/shared/messages";
import { sendToUiThread } from "./message-utils";
import { makeFrames } from "./node-builder";
import { PLUGIN_WINDOW_OPTIONS } from "./utils/plugin-window";

const SESSION_TOKEN_KEY = "session_token";

export function setMessageRouter(figma: PluginAPI) {
  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case UiMsg.RequestSessionCookie:
        postSessionCookieMessage();
        break;
      case UiMsg.ShowPreview:
        const frameId = msg.data.frameId || null;
        makeFrames(frameId);
        break;
      case UiMsg.Logout:
        logoutMessage();
        break;
      // message from webapp; UiMsg is local type not shared with webapp repo
      case "post_session_cookie_to_ui_thread":
        figma.showUI(__html__, PLUGIN_WINDOW_OPTIONS);
        saveSessionTokenMessage(msg.data.sessionToken);
        break;
      case UiMsg.RequestSelectableFrames:
        const frames = getSelectableFrames();
        sendToUiThread(MainThreadMsg.PostFrameInfosForSelector, { frames });
        break;
      default:
        console.log("got_unknown_message_in_main_thread", msg);
        break;
    }
  };
}

function getSelectableFrames(): { id: string; name: string }[] {
  const currentPage = figma.currentPage;
  if (!currentPage) {
    console.error("expected_current_page", { currentPage: figma.currentPage });
    return [];
  }

  const topLevelNodes = currentPage.findAll((node) => {
    return !!node.parent && node.parent.id === currentPage.id;
  }) as SceneNode[];

  return topLevelNodes.map((node) => {
    return {
      id: node.id,
      name: node.name,
    };
  });
}

async function postSessionCookieMessage() {
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
  await figma.clientStorage.deleteAsync(SESSION_TOKEN_KEY);
  sendToUiThread(MainThreadMsg.Logout, {});
}
