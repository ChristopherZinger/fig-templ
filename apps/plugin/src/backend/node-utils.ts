export function hasLayoutMode(node: BaseNode) {
  return "layoutMode" in node;
}

export function isRootNode(node: BaseNode) {
  return (
    node.parent &&
    (node.parent.type === "PAGE" || node.parent.type === "DOCUMENT")
  );
}
