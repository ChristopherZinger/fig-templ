import { PluginError } from "../../lib/utils/PluginError";

export enum LayoutDirection {
  x = "x",
  y = "y",
}

export type Bbox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
export function getBbox(
  nodes: { x: number; y: number; width: number; height: number }[]
): Bbox | null {
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

export function expectBbox(
  nodes: { x: number; y: number; width: number; height: number }[]
): Bbox {
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

export function getBboxDimensions(bbox: Bbox): {
  width: number;
  height: number;
} {
  return {
    width: bbox.maxX - bbox.minX,
    height: bbox.maxY - bbox.minY,
  };
}

export function getBboxOrigin(bbox: Bbox): { x: number; y: number } {
  return {
    x: bbox.minX,
    y: bbox.minY,
  };
}

export function getBboxShrinkedToHugContents({
  bbox,
  contents,
  direction,
}: {
  bbox: Bbox;
  contents: { x: number; y: number; width: number; height: number }[];
  direction: LayoutDirection;
}) {
  const innerBbox = expectBbox(contents);
  return direction === LayoutDirection.x
    ? {
        minX: innerBbox.minX,
        maxX: innerBbox.maxX,
        minY: bbox.minY,
        maxY: bbox.maxY,
      }
    : {
        minX: bbox.minX,
        maxX: bbox.maxX,
        minY: innerBbox.minY,
        maxY: innerBbox.maxY,
      };
}
