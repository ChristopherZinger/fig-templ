import { MainThreadMsg } from "../lib/utils/messages";
import { buildNodeStyle } from "./node-style-utils";
import type { AppNode } from "../types";

export async function makeFrames() {
  const frame = getAllFramesOnPage(figma.currentPage)[0];

  if (!frame) {
    figma.ui.postMessage({
      type: MainThreadMsg.FailedToMakeFrames,
      data: {
        message: "No frame found",
      },
    });
    return;
  }

  const [rootAppNode, { fontNames }] = await buildAppNodeTreeForFrame(frame);

  figma.ui.postMessage({
    type: MainThreadMsg.PostFrameNodes,
    data: { node: [rootAppNode, { fontNames: [...fontNames] }] },
  });
}

function getAllFramesOnPage(page: PageNode): FrameNode[] {
  const allFrames: FrameNode[] = [];

  const framesOnPage = page.findAll(
    (node) => node.type === "FRAME"
  ) as FrameNode[];
  allFrames.push(...framesOnPage);

  return allFrames;
}

async function buildAppNodeTreeForFrame(
  frame: FrameNode
): Promise<[AppNode | null, { fontNames: Set<string> }]> {
  if (frame.type !== "FRAME") {
    console.error("expected_frame_node", frame);
    return [null, { fontNames: new Set() }];
  }

  return await buildAppNodeFromSceneNode(frame, { fontNames: new Set() });
}

async function buildAppNodeFromSceneNode(
  sceneNode: SceneNode,
  { fontNames }: { fontNames: Set<string> }
): Promise<[AppNode, { fontNames: Set<string> }]> {
  const isLayoutMode =
    "layoutMode" in sceneNode && sceneNode.layoutMode !== "NONE";

  if (
    !sceneNode.parent &&
    !isLayoutMode &&
    "children" in sceneNode &&
    sceneNode.children.length > 0
  ) {
    console.error("containers_without_layout_are_unsupported", sceneNode);
    return [null, { fontNames }];
    // throw new Error("containers_without_layout_are_unsupported");
  }

  const css = await sceneNode.getCSSAsync();

  const [style, { fontNames: _fontNames }] = buildNodeStyle(sceneNode);

  fontNames = fontNames || new Set();
  for (const fontName of _fontNames) {
    fontNames.add(fontName);
  }

  const children: AppNode[] = [];
  if ("children" in sceneNode) {
    const childNodes = await Promise.all(
      sceneNode.children.map(
        async (childNode) =>
          await buildAppNodeFromSceneNode(childNode, {
            fontNames,
          })
      )
    );

    for (const [node, { fontNames: childFontNames }] of childNodes) {
      children.push(node);
      for (const fontName of childFontNames) {
        fontNames.add(fontName);
      }
    }
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

  return [result, { fontNames: fontNames || new Set() }];
}
