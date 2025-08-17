import type { AppNode } from "../types.d.ts";
import { buildNodeStyle } from "./node-style-utils.js";

figma.showUI(__html__, { width: 320, height: 240, title: "Figma Template" });

figma.ui.onmessage = async (msg) => {
  const frame = getAllFramesOnPage(figma.currentPage)[0];

  if (!frame) {
    figma.ui.postMessage({
      type: "error",
      data: {
        message: "No frame found",
      },
    });
    return;
  }

  figma.ui.postMessage({
    type: "frame_nodes",
    data: {
      node: await buildAppNodeTreeForFrame(frame),
    },
  });
};

function getAllFramesOnPage(page: PageNode): FrameNode[] {
  const allFrames: FrameNode[] = [];

  const framesOnPage = page.findAll(
    (node) => node.type === "FRAME"
  ) as FrameNode[];
  allFrames.push(...framesOnPage);

  return allFrames;
}

function buildAppNodeTreeForFrame(frame: FrameNode): AppNode {
  if (frame.type !== "FRAME") {
    console.error("expected_frame_node", frame);
    return;
  }

  return buildAppNodeFromSceneNode(frame, { recursively: true });
}

async function buildAppNodeFromSceneNode(
  sceneNode: SceneNode,
  { recursively = true }: { recursively: boolean } = { recursively: true }
): Promise<AppNode> {
  const isLayoutMode =
    "layoutMode" in sceneNode && sceneNode.layoutMode !== "NONE";

  if (
    !sceneNode.parent &&
    !isLayoutMode &&
    "children" in sceneNode &&
    sceneNode.children.length > 0
  ) {
    console.error("containers_without_layout_are_unsupported", sceneNode);
    return {};
    // throw new Error("containers_without_layout_are_unsupported");
  }

  const css = await sceneNode.getCSSAsync();

  const result: AppNode = {
    name: sceneNode.name,
    type: sceneNode.type,
    children:
      "children" in sceneNode
        ? await Promise.all(
            sceneNode.children.map((childNode) =>
              buildAppNodeFromSceneNode(childNode)
            )
          )
        : [],
    css,
    style: buildNodeStyle(sceneNode),
  };

  if (sceneNode.type === "TEXT") {
    result.innerText = sceneNode.characters;
  }

  return result;
}
