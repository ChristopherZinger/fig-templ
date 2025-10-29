export function hasLayoutMode(node: BaseNode) {
  return "layoutMode" in node;
}

export function isTopLevelNode(node: BaseNode) {
  return !node.parent || ["PAGE", "DOCUMENT"].includes(node.parent.type);
}
