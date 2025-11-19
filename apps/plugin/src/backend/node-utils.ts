export function hasLayoutMode(node: BaseNode) {
  return "layoutMode" in node;
}

export function isTopLevelNode(node: BaseNode) {
  return !node.parent || ["PAGE", "DOCUMENT"].includes(node.parent.type);
}

export function hasChildren(node: SceneNode): boolean {
  return "children" in node && node.children.length > 0;
}

export function getImmediateChildren(node: SceneNode): readonly SceneNode[] {
  if (!("children" in node)) {
    return [];
  }
  const directChildren = node.children.filter((child) => {
    return child.parent && child.parent.id === node.id;
  });

  return directChildren;
}
