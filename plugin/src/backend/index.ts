figma.showUI(__html__, { width: 320, height: 240, title: "Figma Template" });

figma.ui.onmessage = (msg) => {
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
      nodes: frame.children.map((child) => ({
        name: child.name,
        type: child.type,
        x: child.x,
        y: child.y,
        maxHeight: child.maxHeight,
        maxWidth: child.maxWidth,
        width: child.width,
        height: child.height,
        css: child.getCSSAsync(),
      })),
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
