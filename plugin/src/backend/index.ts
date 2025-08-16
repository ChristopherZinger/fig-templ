import type { AppNode } from "../types.d.ts";

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

  const sceneNodeToNode = async (sceneNode: SceneNode): Promise<AppNode> => {
    const result: AppNode = {
      name: sceneNode.name,
      type: sceneNode.type,
      children:
        "children" in sceneNode
          ? await Promise.all(sceneNode.children.map(sceneNodeToNode))
          : [],
      style: {
        x: sceneNode.x,
        y: sceneNode.y,
        width: sceneNode.width,
        height: sceneNode.height,
        maxWidth: sceneNode.maxWidth,
        maxHeight: sceneNode.maxHeight,
        css: await sceneNode.getCSSAsync(),
      },
    };

    if (sceneNode.type === "TEXT") {
      console.log("isText");
      result.innerText = sceneNode.characters;
    }

    console.log(result);

    return result;
  };

  figma.ui.postMessage({
    type: "frame_nodes",
    data: {
      node: await sceneNodeToNode(frame),
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
