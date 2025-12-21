import type { AppNode } from "../../../types";

export enum UiMsg {
  RequestSessionCookie = "request_session_cookie",
  ShowPreview = "show_preview",
  Logout = "logout",
  RequestSelectableFrames = "request_selectable_frames",
  CreateComponent = "create_component",
}

export enum MainThreadMsg {
  PostSessionCookie = "post_session_cookie",
  Logout = "sessionCookieRemoved",
  PostFrameNodes = "post_frame_nodes",
  FailedToMakeFrames = "failed_to_make_frames",
  PostFrameInfosForSelector = "post_frame_infos_for_selector",
  PostImageInfo = "post_image_info",
  PostHtmlBuildMessage = "post_html_build_message",
}

export type MsgPayload =
  | MsgPayloadBase<
      MainThreadMsg.PostFrameNodes,
      {
        rootNode: AppNode;
        config: { width: number; height: number };
      } | null
    >
  | MsgPayloadBase<MainThreadMsg.PostSessionCookie, { session: string }>
  | MsgPayloadBase<MainThreadMsg.Logout, null>
  | MsgPayloadBase<
      MainThreadMsg.PostImageInfo,
      { hash: string; bytes: BlobPart }
    >
  | MsgPayloadBase<
      MainThreadMsg.PostHtmlBuildMessage,
      { severity: "error" | "warning" | "info"; message: string }
    >
  | MsgPayloadBase<
      MainThreadMsg.PostFrameInfosForSelector,
      { frames: { id: string; name: string }[] }
    >
  | MsgPayloadBase<UiMsg.RequestSelectableFrames, null>
  | MsgPayloadBase<UiMsg.ShowPreview, { frameId: string }>
  | MsgPayloadBase<UiMsg.RequestSessionCookie, null>
  | MsgPayloadBase<UiMsg.Logout, null>
  | MsgPayloadBase<MainThreadMsg.FailedToMakeFrames, { message: string }>
  | MsgPayloadBase<UiMsg.CreateComponent, null>;

export type MsgPayloadBase<
  T extends MainThreadMsg | UiMsg,
  R extends Record<string, unknown> | null,
> = {
  type: T;
  data: R;
};
