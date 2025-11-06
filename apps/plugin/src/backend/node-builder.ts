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

  const [rootAppNode, { fontNames }] = await buildAppNodeFromSceneNode(
    frame,
    { fontNames: new Set() },
    { isRoot: true }
  );

  sendToUiThread(MainThreadMsg.PostFrameNodes, {
    node: [rootAppNode, { fontNames: [...fontNames] }],
  });
}

async function buildAppNodeFromSceneNode(
  sceneNode: SceneNode,
  { fontNames }: { fontNames: Set<string> },
  options: { isRoot: boolean } = { isRoot: false }
): Promise<[AppNode | null, { fontNames: Set<string> }]> {
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
  }

  const css = await sceneNode.getCSSAsync();

  const styleResult = await buildNodeStyle(sceneNode, {
    isRoot: options.isRoot,
  });
  if (!styleResult) {
    return [null, { fontNames }];
  }
  const [style, { fontNames: _fontNames }] = styleResult;

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
      if (!node) {
        continue;
      }
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
