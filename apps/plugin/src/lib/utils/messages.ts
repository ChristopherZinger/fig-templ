export enum UiMsg {
  RequestSessionCookie = "request_session_cookie",
  ShowPreview = "show_preview",
}

export enum MainThreadMsg {
  PostSessionCookie = "post_session_cookie",
  PostFrameNodes = "post_frame_nodes",
  FailedToMakeFrames = "failed_to_make_frames",
}
