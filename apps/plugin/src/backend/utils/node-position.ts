import { PluginError } from "../../lib/utils/PluginError";

export type Bbox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
export function getBbox(nodes: SceneNode[]): Bbox | null {
  if (nodes.length === 0) {
    return null;
  }

  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return { minX, minY, maxX, maxY };
}

export function expectBbox(nodes: SceneNode[]): Bbox {
  const bbox = getBbox(nodes);
  if (!bbox) {
    throw new PluginError("expected_bbox", { numNodes: nodes.length });
  }
  return bbox;
}

export function getBboxSpacing(
  bbox1: Bbox,
  bbox2: Bbox
): { y: number; x: number } {
  const y = Math.max(0, bbox1.minY - bbox2.maxY, bbox2.minY - bbox1.maxY);
  const x = Math.max(0, bbox1.minX - bbox2.maxX, bbox2.minX - bbox1.maxX);
  return { y, x };
}
