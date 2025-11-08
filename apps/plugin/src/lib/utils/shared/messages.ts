export enum UiMsg {
  RequestSessionCookie = "request_session_cookie",
  ShowPreview = "show_preview",
  Logout = "logout",
  RequestSelectableFrames = "request_selectable_frames",
}

export enum MainThreadMsg {
  PostSessionCookie = "post_session_cookie",
  Logout = "sessionCookieRemoved",
  PostFrameNodes = "post_frame_nodes",
  FailedToMakeFrames = "failed_to_make_frames",
  PostFrameInfosForSelector = "post_frame_infos_for_selector",
  PostImageInfo = "post_image_info",
}
