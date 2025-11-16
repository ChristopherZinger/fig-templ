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

  if (sceneNode.visible === false && !options.isRoot) {
    return null;
  }

  if (!isLayoutMode && sceneNode.type !== "TEXT") {
    console.warn(
      "containers_without_layout_are_unsupported__exporting_as_picture",
      sceneNode.name,
      sceneNode.id
    );

    return await createRasterizedAppNode(sceneNode);
  }

  const [css, style, attributes] = await Promise.all([
    sceneNode.getCSSAsync(),
    buildNodeStyle(sceneNode),
    getAttributes(sceneNode),
  ]);
  const children: AppNode[] = [];
  if ("children" in sceneNode) {
    (
      await Promise.all(
        sceneNode.children.map(async (childNode) => {
          return await buildAppNodeFromSceneNode(childNode);
        })
      )
    )
      .filter((val: AppNode | null) => !!val)
      .forEach((val: AppNode) => {
        children.push(val);
      });
  }

  const result: AppNode = {
    name: sceneNode.name,
    type: sceneNode.type,
    children,
    css,
    style,
    attributes,
  };

  if (sceneNode.type === "TEXT") {
    result.innerText = sceneNode.characters;
  }

  return result;
}

async function createRasterizedAppNode(sceneNode: SceneNode): Promise<AppNode> {
  const bytes = await sceneNode.exportAsync({
    format: "PNG",
    constraint: { type: "SCALE", value: 2 },
  });
  const image = figma.createImage(bytes);

  sendToUiThread(MainThreadMsg.PostImageInfo, { hash: image.hash, bytes });

  const result: AppNode = {
    name: sceneNode.name,
    type: sceneNode.type,
    children: [],
    css: {},
    style: {
      "background-size": "cover",
      "background-position": "center",
      "background-repeat": "no-repeat",
      width: `${sceneNode.width}px`,
      height: `${sceneNode.height}px`,
    },
    attributes: { "data-image-hash": image.hash, id: sceneNode.name },
  };

  return result;
}

async function getAttributes(node: SceneNode): Promise<Record<string, string>> {
  if (!("fills" in node) || !node.fills || !Array.isArray(node.fills)) {
    return {};
  }

  const fill = node.fills.find((fill) => fill.visible === true);
  if (!fill || fill.type !== "IMAGE") {
    return {};
  }

  const img = figma.getImageByHash(fill.imageHash);
  if (!img) {
    return {};
  }

  // TODO: this side effect should happen somewhere else
  const bytes = await img.getBytesAsync();
  sendToUiThread(MainThreadMsg.PostImageInfo, { hash: img.hash, bytes });

  return { "data-image-hash": img.hash, id: node.name };
}
