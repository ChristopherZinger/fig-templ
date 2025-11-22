import { MainThreadMsg } from "../lib/utils/shared/messages";
import { buildNodeStyle } from "./node-style-utils";
import type { AppNode } from "../types";
import { sendToUiThread } from "./message-utils";
import _ from "lodash";
import { getImmediateChildren, hasChildren } from "./node-utils";
import {
  createFlexColumnNode,
  getNodesGroupedByPosition,
} from "./magic-layout-builder";

const ENABLE_MAGIC_LAYOUT = false;

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

  const rootAppNode = await buildAppNodeFromSceneNode(frame);

  if (!rootAppNode) {
    sendToUiThread(MainThreadMsg.PostHtmlBuildMessage, {
      severity: "error",
      message:
        "Failed to build HTML from frame. Frame is not selected or hidden. Please select a visible frame and try again.",
    });
  }

  sendToUiThread(MainThreadMsg.PostFrameNodes, { node: rootAppNode });
}

async function buildAppNodeFromSceneNode(
  sceneNode: SceneNode
): Promise<AppNode | null> {
  const isLayoutMode =
    "layoutMode" in sceneNode && sceneNode.layoutMode !== "NONE";

  if (sceneNode.visible === false) {
    return null;
  }

  if (!isLayoutMode && hasChildren(sceneNode) && ENABLE_MAGIC_LAYOUT) {
    console.warn(
      "containers_without_layout_are_unsupported__create_magic_layout",
      sceneNode.name,
      sceneNode.id
    );
    const magicLayoutNode = await createMagicLayoutAppNode(sceneNode);
    return magicLayoutNode;
  }

  if (!isLayoutMode && sceneNode.type !== "TEXT") {
    console.warn(
      "containers_without_layout_are_unsupported__exporting_as_picture",
      sceneNode.name,
      sceneNode.id
    );

    return await createRasterizedAppNode(sceneNode);
  }

  const [style, attributes] = await Promise.all([
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
    style,
    attributes,
  };

  if (sceneNode.type === "TEXT") {
    result.innerText = sceneNode.characters;
  }

  return result;
}

export async function createMagicLayoutAppNode(
  node: SceneNode
): Promise<AppNode | null> {
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    console.error("node_with_auto-layout_selected_for_magic_layout", node.name);
    return buildAppNodeFromSceneNode(node);
  }

  const children = getImmediateChildren(node);
  const childrenGroupedHorizontally = getNodesGroupedByPosition({
    nodes: children,
    direction: "y",
  });

  if (childrenGroupedHorizontally.length > 1) {
    const appNode = await createFlexColumnNode({
      parent: node,
      childrenGroupedHorizontallyInYorder: childrenGroupedHorizontally,
    });
    return appNode;
  }

  console.error(
    "unsupported magic layout, returning rasterized node",
    node.name
  );
  return await createRasterizedAppNode(node);

  // TODO: implement horizontal layout
}

async function createRasterizedAppNode(sceneNode: SceneNode): Promise<AppNode> {
  const MAX_IMG_SIZE = 4096;
  const scaleX = Math.min(MAX_IMG_SIZE, sceneNode.width) / sceneNode.width;
  const scaleY = Math.min(MAX_IMG_SIZE, sceneNode.height) / sceneNode.height;
  const type = scaleX < scaleY ? "WIDTH" : "HEIGHT";
  const bytes = await sceneNode.exportAsync({
    format: "PNG",
    constraint: {
      type,
      value: Math.floor(
        type === "WIDTH" ? sceneNode.width * scaleX : sceneNode.height * scaleY
      ),
    },
    useAbsoluteBounds: true,
  });
  const image = figma.createImage(bytes);

  sendToUiThread(MainThreadMsg.PostImageInfo, { hash: image.hash, bytes });

  const result: AppNode = {
    name: sceneNode.name,
    type: sceneNode.type,
    children: [],
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
