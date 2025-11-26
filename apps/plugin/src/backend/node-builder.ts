import { MainThreadMsg } from "../lib/utils/shared/messages";
import { buildNodeStyle } from "./node-style-utils";
import { AppNodeType, type AppNode } from "../types";
import { sendToUiThread } from "./message-utils";
import _ from "lodash";
import {
  getAllChildren,
  getDirectChildren,
  hasAutoLayoutMode,
  hasChildren,
} from "./node-utils";
import {
  deductLayoutInformation,
  LayoutDirection,
  PhantomNodeInfo,
} from "./magic-layout-builder";
import {
  Bbox,
  expectBbox,
  getBboxDimensions,
  getBboxOrigin,
  getBboxShrinkedToHugContents,
} from "./utils/node-position";

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

  sendToUiThread(
    MainThreadMsg.PostFrameNodes,
    rootAppNode
      ? {
          rootNode: rootAppNode,
          config: { width: frame.width, height: frame.height },
        }
      : null
  );
}

async function buildAppNodeFromSceneNode(
  sceneNode: SceneNode
): Promise<AppNode | null> {
  if (sceneNode.visible === false) {
    return null;
  }

  if (!hasChildren(sceneNode) || hasAutoLayoutMode(sceneNode)) {
    return await buildAppNodeWithAutoLayout(sceneNode);
  }

  if (!ENABLE_MAGIC_LAYOUT) {
    return await createRasterizedAppNode(sceneNode);
  }

  sendToUiThread(MainThreadMsg.PostHtmlBuildMessage, {
    severity: "warning",
    message: [
      "applying magic layout to node: ",
      sceneNode.name.slice(0, 20),
      sceneNode.id,
    ].join(" "),
  });

  const magicLayoutNode = await buildAppNodeWithMagicLayout({ sceneNode });

  if (magicLayoutNode) {
    sendToUiThread(MainThreadMsg.PostHtmlBuildMessage, {
      severity: "warning",
      message: [
        "failed to apply magic layout to node: ",
        sceneNode.name.slice(0, 20),
        sceneNode.id,
      ].join(" "),
    });
    return magicLayoutNode;
  }
  return await createRasterizedAppNode(sceneNode);
}

async function buildAppNodeWithAutoLayout(
  sceneNode: SceneNode,
  overrideStyles?: Record<string, unknown>
): Promise<AppNode> {
  const [baseStyles, attributes, ...children] = await Promise.all([
    buildNodeStyle(sceneNode),
    getAttributes(sceneNode),
    ...getAllChildren(sceneNode).map(async (childNode) => {
      return await buildAppNodeFromSceneNode(childNode);
    }),
  ]);

  const style = Object.assign(baseStyles, overrideStyles);

  const result = makeAppNode({
    sceneNode,
    children: _.compact(children),
    style,
    attributes,
  });

  return result;
}

async function buildAppNodeWithMagicLayout(
  info:
    | { sceneNode: SceneNode }
    | {
        sceneNodes: SceneNode[];
        phantomNodeInfo: PhantomNodeInfo;
        overrideStyles?: Record<string, unknown>;
      }
): Promise<AppNode | null> {
  if ("sceneNode" in info) {
    return await buildAppNodeWithMagicLayoutFromSceneNode(info.sceneNode);
  }
  return await buildAppNodeWitMagicLayoutFromSceneNodeGrouop(info);
}

async function buildAppNodeWithMagicLayoutFromSceneNode(
  sceneNode: SceneNode
): Promise<AppNode | null> {
  if (hasAutoLayoutMode(sceneNode)) {
    console.error(
      "requested_magic_layout_for_node_with_auto_layout " +
        sceneNode.name.slice(0, 20)
    );
    return await buildAppNodeWithAutoLayout(sceneNode);
  }

  if (!hasChildren(sceneNode)) {
    return await buildAppNodeWithAutoLayout(sceneNode);
  }

  const directSceneNodeChildren = getDirectChildren(sceneNode);
  const containerBbox = expectBbox(directSceneNodeChildren);
  const { groupInfos, magicLayoutStyles, direction } = deductLayoutInformation({
    children: directSceneNodeChildren,
    container: {
      width: sceneNode.width,
      height: sceneNode.height,
      origin: { x: 0, y: 0 },
    },
  });

  const childrenPromises = groupInfos.map(async ({ nodes, styles }) => {
    const result = await buildAppNodeWithMagicLayout({
      sceneNodes: nodes,
      phantomNodeInfo: getPhantomNodeInfo({ nodes, direction, containerBbox }),
      overrideStyles: styles,
    });
    return result;
  });
  const [baseStyle, ...children] = await Promise.all([
    buildNodeStyle(sceneNode),
    ...childrenPromises,
  ]);

  const style = Object.assign(baseStyle, magicLayoutStyles, {
    width: direction === "x" ? "100%" : sceneNode.width + "px",
    height: direction === "x" ? sceneNode.height + "px" : "100%",
  });

  const appNode: AppNode = makeAppNode({
    sceneNode,
    children: _.compact(children),
    style,
    attributes: {
      id: sceneNode.id,
      name: sceneNode.name.slice(0, 20),
    },
  });

  return appNode;
}

export async function buildAppNodeWitMagicLayoutFromSceneNodeGrouop({
  sceneNodes,
  phantomNodeInfo,
  overrideStyles,
}: {
  sceneNodes: SceneNode[];
  phantomNodeInfo: PhantomNodeInfo;
  overrideStyles?: Record<string, unknown>;
}): Promise<AppNode> {
  if (sceneNodes.length === 1) {
    console.warn(
      "requested_magic_layout_for_single_node " + sceneNodes[0].name
    );
    return await buildAppNodeWithAutoLayout(sceneNodes[0], overrideStyles);
  }

  const { groupInfos, magicLayoutStyles, direction } = deductLayoutInformation({
    children: sceneNodes,
    container: phantomNodeInfo,
  });
  const containerBbox = expectBbox(sceneNodes);
  const childrenPromises = groupInfos.map(async ({ nodes, styles }) => {
    const result = await buildAppNodeWithMagicLayout({
      sceneNodes: nodes,
      phantomNodeInfo: getPhantomNodeInfo({ nodes, direction, containerBbox }),
      overrideStyles: styles,
    });
    return result;
  });
  const children = await Promise.all(childrenPromises);

  const appNode: AppNode = {
    name: "templetto_magic_layout_container",
    type: AppNodeType.RECTANGLE,
    children: _.compact(children),
    style: Object.assign(
      {
        width: direction === "x" ? "100%" : phantomNodeInfo.width + "px",
        height: direction === "x" ? phantomNodeInfo.height + "px" : "100%",
      },
      magicLayoutStyles,
      overrideStyles
    ),
    attributes: {
      id: "templetto_phantom_" + Math.random().toString(36).substring(2, 15),
      name: "templetto_phantom",
    },
  };

  return appNode;
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
    type: getAppNodeType(sceneNode),
    children: [],
    style: {
      "background-size": "cover",
      "background-position": "center",
      "background-repeat": "no-repeat",
      width: `${sceneNode.width}px`,
      height: `${sceneNode.height}px`,
    },
    attributes: { "data-image-hash": image.hash, id: sceneNode.name },
    innerText: "",
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

function getPhantomNodeInfo({
  nodes,
  direction,
  containerBbox,
}: {
  nodes: SceneNode[];
  direction: LayoutDirection;
  containerBbox: Bbox;
}): PhantomNodeInfo {
  const nodesBbox = getBboxShrinkedToHugContents({
    bbox: containerBbox,
    contents: nodes,
    direction,
  });

  return Object.assign(getBboxDimensions(containerBbox), {
    origin: getBboxOrigin(nodesBbox),
  });
}

function makeAppNode({
  sceneNode,
  children,
  style,
  attributes,
}: {
  sceneNode: SceneNode;
  children: AppNode[];
  style: Record<string, unknown>;
  attributes: Record<string, unknown>;
}): AppNode {
  const type = getAppNodeType(sceneNode.type);
  const baseNode = {
    name: sceneNode.name,
    children,
    style,
    attributes: Object.assign(attributes, {
      id: sceneNode.id,
      "data-name": sceneNode.name.slice(0, 20),
    }),
  } satisfies Partial<AppNode>;

  if (type === AppNodeType.TEXT) {
    return Object.assign(baseNode, {
      type,
      innerText: "characters" in sceneNode ? sceneNode.characters : "",
    });
  }

  return Object.assign(baseNode, {
    type, // without this lint fails to narrow app node type
  });
}

function getAppNodeType(sceneNodeType: SceneNode["type"]): AppNodeType {
  switch (sceneNodeType) {
    case "TEXT":
      return AppNodeType.TEXT;
    case "FRAME":
      return AppNodeType.FRAME;
    case "RECTANGLE":
      return AppNodeType.RECTANGLE;
    default:
      return AppNodeType.OTHER;
  }
}
