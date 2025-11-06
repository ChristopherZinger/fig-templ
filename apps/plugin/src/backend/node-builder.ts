import { MainThreadMsg } from "../lib/utils/shared/messages";
import { buildNodeStyle } from "./node-style-utils";
import type { AppNode } from "../types";
import { sendToUiThread } from "./message-utils";

export async function makeFrames(frameId: string | null) {
  if (!frameId) {
    console.error("expected_frame_id");
    sendToUiThread(MainThreadMsg.FailedToMakeFrames, {
      message: "No frame id provided",
    });
    return;
  }

  const frame = figma.currentPage.findOne((node) => {
    return node.id === frameId;
  });

  if (!frame) {
    console.error("missing_frame_for_id", { frameId });
    sendToUiThread(MainThreadMsg.FailedToMakeFrames, {
      message: "No frame found",
    });
    return;
  }

  const rootAppNode = await buildAppNodeFromSceneNode(frame, { isRoot: true });
  sendToUiThread(MainThreadMsg.PostFrameNodes, { node: rootAppNode });
}

async function buildAppNodeFromSceneNode(
  sceneNode: SceneNode,
  options: { isRoot: boolean } = { isRoot: false }
): Promise<AppNode | null> {
  const isLayoutMode =
    "layoutMode" in sceneNode && sceneNode.layoutMode !== "NONE";

  if (
    !sceneNode.parent &&
    !isLayoutMode &&
    "children" in sceneNode &&
    sceneNode.children.length > 0
  ) {
    console.error("containers_without_layout_are_unsupported", sceneNode);
    return null;
  }

  const css = await sceneNode.getCSSAsync();

  const style = await buildNodeStyle(sceneNode, {
    isRoot: options.isRoot,
  });
  if (!style) {
    return null;
  }

  const children: AppNode[] = [];
  if ("children" in sceneNode) {
    await Promise.all(
      sceneNode.children.map(async (childNode) => {
        children.push(await buildAppNodeFromSceneNode(childNode));
      })
    );
  }

  const result: AppNode = {
    name: sceneNode.name,
    type: sceneNode.type,
    children,
    css,
    style,
  };

  if (sceneNode.type === "TEXT") {
    result.innerText = sceneNode.characters;
  }

  return result;
}
