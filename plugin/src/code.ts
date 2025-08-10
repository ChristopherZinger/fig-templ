// List all FRAME nodes in the document
figma.showUI(__html__, { width: 320, height: 240, title: "Figma Template" });

function logChildren(nodes: BaseNodeMixin[]) {
  const n = nodes.pop();

  if (!n) {
    return;
  }

  console.log(n.name, { n });

  if (n && "children" in n && Array.isArray(n.children)) {
    n.children.forEach((child) => {
      nodes.push(child);
    });
  }
  logChildren(nodes);
}

function logAllFrames(): void {
  const allFrames: FrameNode[] = [];

  // Search through all pages
  for (const page of figma.root.children) {
    if (page.type !== "PAGE") continue;

    // Find all FRAME nodes on this page
    const framesOnPage = page.findAll(
      (node) => node.type === "FRAME"
    ) as FrameNode[];
    allFrames.push(...framesOnPage);
  }

  logChildren(allFrames);
}

// Run the frame logging when plugin starts
logAllFrames();

figma.ui.onmessage = (msg) => {
  console.log("Plugin received message:", msg);
  console.log("Message type:", typeof msg);
  console.log("Message content:", JSON.stringify(msg));

  if (msg === "close") {
    console.log("Closing plugin!");
    // figma.closePlugin();
    logAllFrames();
  }
};
