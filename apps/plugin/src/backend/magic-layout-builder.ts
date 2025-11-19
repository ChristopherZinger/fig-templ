import { AppNode } from "../types";
import { buildNodeStyle } from "./node-style-utils";
import { getBbox, getBboxSpacing } from "./utils/node-position";
import _ from "lodash";

export async function createFlexColumnNode({
  parent,
  childrenGroupedHorizontallyInYorder,
}: {
  parent: SceneNode;
  childrenGroupedHorizontallyInYorder: SceneNode[][];
}): Promise<AppNode | null> {
  const bboxes = _.compact(
    childrenGroupedHorizontallyInYorder.map((group) => getBbox(group))
  );

  const bbox = getBbox(childrenGroupedHorizontallyInYorder.flat());
  if (!bbox) {
    console.error("failed to get bbox for children");
    return null;
  }

  const marginLeft = bbox.minX;
  const marginRight = parent.width - bbox.maxX;
  const marginTop = bbox.minY;
  const marginBottom = parent.height - bbox.maxY;

  const horizontalMarginsInOrder: number[] = [marginTop];
  for (let i = 0; i < bboxes.length - 1; i++) {
    const marginPx = getBboxSpacing(bboxes[i], bboxes[i + 1]).y;
    horizontalMarginsInOrder.push(marginPx);
  }
  horizontalMarginsInOrder.push(marginBottom);

  const children: AppNode[] = _.compact(
    childrenGroupedHorizontallyInYorder.map((group, i) => {
      const bbox = getBbox(group);
      if (!bbox) {
        return null;
      }

      const [, ...margins] = horizontalMarginsInOrder;
      margins.pop();
      const marginBottom = margins[i];

      const { minX, minY, maxX, maxY } = bbox;
      const w = maxX - minX;
      const h = maxY - minY;

      const node: AppNode = {
        parent: null,
        children: [],
        attributes: {},
        style: Object.assign(
          {
            width: w + "px",
            height: h + "px",
            "margin-bottom": marginBottom + "px",
            "background-color": "coral",
          },
          marginBottom ? { "margin-bottom": marginBottom + "px" } : {}
        ),
        type: "RECTANGLE",
        css: {},
        name: "tmpl_node",
      };
      return node;
    })
  );

  const baseStyle = await buildNodeStyle(parent);
  const justifyContentStyle = getJustifyContentStyle(horizontalMarginsInOrder);
  return {
    name: parent.name,
    type: "RECTANGLE",
    children,
    css: {},
    style: Object.assign(
      baseStyle,
      {
        display: "flex",
        "flex-direction": "column",
        width: parent.width + "px",
        height: parent.height + "px",
        "padding-left": marginLeft + "px",
        "padding-right": marginRight + "px",
      },
      justifyContentStyle
    ),
    attributes: {},
    parent: null,
  };
}

function getJustifyContentStyle(marginsInOrderPx: number[]) {
  // todo consier number of items - 0, 1, 2, N

  const internalMargins = [...marginsInOrderPx];
  const lastMargin = internalMargins.pop();
  const firstMargin = internalMargins.shift();

  const areAllMarginsEqual = new Set(marginsInOrderPx).size === 1;
  const areExternalMarginsEqual = firstMargin === lastMargin;
  const areInternalMarginsEqual = new Set(internalMargins).size === 1;

  if (areAllMarginsEqual) {
    return { "justify-content": "space-evenly" };
  }

  if (areExternalMarginsEqual) {
    if (areInternalMarginsEqual && internalMargins[0] / 2 === firstMargin) {
      return { "justify-content": "space-around" };
    }
    return {
      "justify-content": "space-between",
      "padding-top": firstMargin + "px",
      "padding-bottom": lastMargin + "px",
    };
  }

  if ((firstMargin || 0) > (lastMargin || 0)) {
    return {
      "justify-content": "flex-end",
      "padding-bottom": lastMargin + "px",
    };
  }

  return {
    "justify-content": "flex-start",
    "padding-top": firstMargin + "px",
  };
}

export function getNodesGroupedByPosition({
  nodes,
  direction,
}: {
  nodes: readonly SceneNode[];
  direction: "x" | "y";
}): SceneNode[][] {
  let nodesGroupedByPosition: SceneNode[][] = [];
  for (const group of groupNodesByPositionGenerator({
    nodes,
    direction,
  })) {
    nodesGroupedByPosition.push(group);
  }
  return nodesGroupedByPosition;
}

function* groupNodesByPositionGenerator({
  nodes,
  direction: d,
}: {
  nodes: readonly SceneNode[];
  direction: "x" | "y";
}) {
  const getSpanStart = (n: SceneNode) => (d === "x" ? n.x : n.y);
  const getSpanEnd = (n: SceneNode) =>
    getSpanStart(n) + (d === "x" ? n.width : n.height);

  const sortedChildren = _.sortBy(nodes, (c) => (d === "x" ? c.x : c.y));

  let currentGroup: SceneNode[] = [];
  let threshold = 0;
  for (const node of sortedChildren) {
    if (getSpanStart(node) >= threshold && currentGroup.length > 0) {
      yield currentGroup;
      currentGroup = [];
    }
    currentGroup.push(node);
    threshold = Math.max(threshold, getSpanEnd(node));
  }
  if (currentGroup.length > 0) {
    yield currentGroup;
  }
}
