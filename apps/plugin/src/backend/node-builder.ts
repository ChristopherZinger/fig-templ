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
  hasSingleChild,
  isTopLevelNode,
} from "./node-utils";
import {
  deductLayoutInformation,
  PhantomNodeInfo,
} from "./magic-layout-builder";
import {
  Bbox,
  expectBbox,
  LayoutDirection,
  getBboxDimensions,
  getBboxOrigin,
  getBboxShrinkedToHugContents,
} from "./utils/node-position";
import slugify from "slugify";
import { DYNAMIC_IMG_INSTANCE_NAME } from "./custom-components";
import {
  getPluginData,
  AppPluginDataKey,
  AppPluginDataInfo,
} from "./plugin-data";

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

  const loopInfo = getPluginData(
    sceneNode,
    AppPluginDataKey.TEMPLATE_LOOP_NODE
  );
  if (loopInfo) {
    return await buildForEachLoopNode(sceneNode, loopInfo);
  }

  if (!hasChildren(sceneNode) || hasAutoLayoutMode(sceneNode)) {
    return await buildAppNodeWithAutoLayout(sceneNode);
  }

  if (sceneNode.type === "INSTANCE") {
    const mainComponent = await sceneNode.getMainComponentAsync();
    if (mainComponent && mainComponent.name === DYNAMIC_IMG_INSTANCE_NAME) {
      return await buildAppNodeWithDynamicImg(sceneNode);
    }
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

async function buildForEachLoopNode(
  sceneNode: SceneNode,
  loopInfo: AppPluginDataInfo
): Promise<AppNode | null> {
  const firstChild = getDirectChildren(sceneNode)[0];
  if (!firstChild) {
    console.error("no first child for loop node", sceneNode.name);
    return null;
  }
  const [baseStyles, onlyChild] = await Promise.all([
    buildNodeStyle(sceneNode),
    buildAppNodeFromSceneNode(firstChild),
  ]);

  return makeAppNode({
    sceneNode,
    children: _.compact([onlyChild]),
    style: baseStyles,
    attributes: { "data-loop-data-key": loopInfo.loopDataKey },
  });
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

  if (hasSingleChild(sceneNode)) {
    const children = getDirectChildren(sceneNode);
    if (children.length !== 1) {
      console.error("unexpected_number_of_children " + children.length);
    }
    const isRoot = isTopLevelNode(sceneNode);
    return await buildAppNodeWithFramedPictureLayout({
      containerInfo: {
        width: sceneNode.width,
        height: sceneNode.height,
        origin: isRoot ? { x: 0, y: 0 } : sceneNode,
        type: sceneNode.type,
        name: sceneNode.name,
        id: sceneNode.id,
      },
      childSceneNode: children[0],
      getBaseStyles: () => buildNodeStyle(sceneNode),
    });
  }

  return await buildAppNodeWithFlexBox({
    childrenSceneNodes: getDirectChildren(sceneNode),
    container: {
      width: sceneNode.width,
      height: sceneNode.height,
      origin: { x: 0, y: 0 },
    },
    getBaseStyles: () => buildNodeStyle(sceneNode),
  });
}

async function buildAppNodeWithFramedPictureLayout({
  containerInfo: containerSceneNode,
  childSceneNode,
  getBaseStyles,
  overrideStyles,
}: {
  containerInfo: PhantomNodeInfo & {
    type: SceneNode["type"];
    name: string;
    id: string;
  };
  childSceneNode: SceneNode;
  getBaseStyles: () => Promise<Record<string, unknown>>;
  overrideStyles?: Record<string, unknown>;
}) {
  const [baseStyles, child] = await Promise.all([
    getBaseStyles(),
    buildAppNodeFromSceneNode(childSceneNode),
  ]);

  const top = childSceneNode.y - containerSceneNode.origin.y;
  const bottom =
    containerSceneNode.origin.y +
    containerSceneNode.height -
    (childSceneNode.y + childSceneNode.height);
  const right =
    containerSceneNode.origin.x +
    containerSceneNode.width -
    (childSceneNode.x + childSceneNode.width);
  const left = childSceneNode.x - containerSceneNode.origin.x;

  const paddingStyles = {
    "padding-top": top + "px",
    "padding-right": right + "px",
    "padding-bottom": bottom + "px",
    "padding-left": left + "px",
  };

  const appNode = makeAppNode({
    sceneNode: containerSceneNode,
    children: _.compact([child]),
    style: Object.assign(
      baseStyles,
      overrideStyles,
      { width: "auto", height: "auto" },
      paddingStyles
    ),
    attributes: {},
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

  if (sceneNodes.length === 1) {
    return await buildAppNodeWithFramedPictureLayout({
      containerInfo: Object.assign(phantomNodeInfo, {
        type: "RECTANGLE" as const,
        id: "templetto_" + Math.random().toString(36).substring(2, 15),
        name: "templetto",
      }),
      childSceneNode: sceneNodes[0],
      overrideStyles: overrideStyles,
      getBaseStyles: () => Promise.resolve({}),
    });
  }

  return await buildAppNodeWithFlexBox({
    childrenSceneNodes: sceneNodes,
    container: phantomNodeInfo,
    overrideStyles,
  });
}

async function buildAppNodeWithFlexBox({
  childrenSceneNodes,
  container,
  overrideStyles,
  getBaseStyles,
}: {
  childrenSceneNodes: SceneNode[];
  container: PhantomNodeInfo;
  overrideStyles?: Record<string, unknown>;
  getBaseStyles?: () => Promise<Record<string, unknown>>;
}) {
  const { groupInfos, direction, magicLayoutStyles } = deductLayoutInformation({
    children: childrenSceneNodes,
    container,
  });

  const containerBbox = expectBbox(childrenSceneNodes);
  const childrenPromises = groupInfos.map(async ({ nodes, styles }) => {
    const result = await buildAppNodeWithMagicLayout({
      sceneNodes: nodes,
      phantomNodeInfo: getPhantomNodeInfo({ nodes, direction, containerBbox }),
      overrideStyles: styles,
    });
    return result;
  });
  const [baseStyles, ...children] = await Promise.all([
    getBaseStyles ? getBaseStyles() : Promise.resolve({}),
    ...childrenPromises,
  ]);

  const appNode = makeAppNode({
    sceneNode: {
      id: "templetto_" + Math.random().toString(36).substring(2, 15),
      name: "templetto",
      type: "RECTANGLE",
    },
    children: _.compact(children),
    style: Object.assign(
      baseStyles,
      {
        width: direction === "x" ? "100%" : container.width + "px",
        height: direction === "x" ? container.height + "px" : "100%",
      },
      magicLayoutStyles,
      overrideStyles
    ),
    attributes: {},
  });

  return appNode;
}

async function buildAppNodeWithDynamicImg(
  sceneNode: SceneNode
): Promise<AppNode> {
  const [baseStyles, children] = await Promise.all([
    buildNodeStyle(sceneNode),
    await Promise.all(
      getAllChildren(sceneNode).map(async (childNode) => {
        return await buildAppNodeFromSceneNode(childNode);
      })
    ),
  ]);
  return makeAppNode({
    sceneNode,
    children: _.compact(children),
    style: baseStyles,
    attributes: {
      "data-image-src-name": slugify(sceneNode.name, {
        replacement: "_",
        lower: true,
        strict: true,
      }),
    },
  });
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

  const result = makeAppNode({
    sceneNode: sceneNode,
    children: [],
    style: {
      "background-size": "cover",
      "background-position": "center",
      "background-repeat": "no-repeat",
      width: `${sceneNode.width}px`,
      height: `${sceneNode.height}px`,
    },
    attributes: { "data-image-hash": image.hash, id: sceneNode.name },
  });

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

function makeAppNode<Type extends SceneNode["type"]>({
  sceneNode,
  children,
  style,
  attributes,
}: {
  sceneNode: {
    name: string;
    id: string;
    type: Type;
    characters?: Type extends "TEXT" | "TEXT_PATH" ? string : never;
  };
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
      "data-name": slugify(sceneNode.name.slice(0, 20), {
        lower: false,
        replacement: " ",
        strict: true,
      }),
    }),
  } satisfies Partial<AppNode>;

  if (type === AppNodeType.TEXT) {
    return Object.assign(baseNode, {
      type,
      innerText: ("characters" in sceneNode ? sceneNode.characters : "") || "",
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
