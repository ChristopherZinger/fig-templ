import { PluginError } from "../lib/utils/PluginError";
import {
  Bbox,
  expectBbox,
  getBboxSpacing,
  LayoutDirection,
} from "./utils/node-position";
import _ from "lodash";

export type PhantomNodeInfo = {
  width: number;
  height: number;
  origin: {
    x: number;
    y: number;
  };
};

export function deductLayoutInformation({
  container,
  children,
}: {
  container: PhantomNodeInfo;
  children: SceneNode[];
}): {
  groupInfos: {
    nodes: SceneNode[];
    styles?: Record<string, unknown>;
  }[];
  magicLayoutStyles: {
    display: "flex";
    "flex-direction": string;
    "justify-content": string;
    "padding-top"?: string;
    "padding-right"?: string;
    "padding-bottom"?: string;
    "padding-left"?: string;
  };
  direction: LayoutDirection;
} {
  const { direction, groupedChildren } = deductFlexDirection(children);

  const flexStyle =
    direction === LayoutDirection.x
      ? { "flex-direction": "row" }
      : { "flex-direction": "column" };

  const { marginsAlongDirection, margins } = getMarginsAlongDirection({
    container,
    groupedChildren,
    direction,
  });

  const justifyContentStyle = getJustifyContentStyle({
    marginsInOrderPx: marginsAlongDirection,
    direction: direction,
  });

  const secondaryMarginStyles =
    direction === LayoutDirection.x
      ? {
          "padding-top": margins.top + "px",
          "padding-bottom": margins.bottom + "px",
        }
      : {
          "padding-left": margins.left + "px",
          "padding-right": margins.right + "px",
        };

  // TODO: refacor internal margins - encapsulate??
  const JUSTIFY_CONTENT_STYLES_THAT_OVERRRIDE_INTERNAL_MARGINS = [
    "space-evenly",
    "space-between",
    "space-around",
  ];
  const justifyContent = justifyContentStyle["justify-content"];
  const shouldOverrideInternalMargins =
    !JUSTIFY_CONTENT_STYLES_THAT_OVERRRIDE_INTERNAL_MARGINS.includes(
      justifyContent
    );
  let internalMargins: number[] | undefined;
  if (shouldOverrideInternalMargins) {
    internalMargins = marginsAlongDirection.slice(1).slice(0, -1);
  }

  const groupInfos = groupedChildren.map((group, i) => {
    return {
      nodes: group,
      styles: internalMargins
        ? direction === LayoutDirection.x
          ? { "margin-right": (internalMargins[i] || 0) + "px" }
          : { "margin-bottom": (internalMargins[i] || 0) + "px" }
        : undefined,
    };
  });

  const magicLayoutStyles = Object.assign(
    { display: "flex" as const },
    flexStyle,
    justifyContentStyle,
    secondaryMarginStyles
  );

  return {
    groupInfos,
    magicLayoutStyles,
    direction,
  };
}

function deductFlexDirection(sceneNodes: SceneNode[]): {
  direction: LayoutDirection;
  groupedChildren: SceneNode[][];
} {
  const directionsInOrder = [LayoutDirection.y, LayoutDirection.x];
  for (const direction of directionsInOrder) {
    const groupedChildren = groupNodesAlongDirection({
      nodes: sceneNodes,
      direction,
    });
    if (groupedChildren.length > 1) {
      return { direction, groupedChildren };
    }
  }

  console.error("grid_layout_not_supported", {
    nodes: sceneNodes.map((n) => n.name.slice(0, 30)),
  });

  throw new PluginError("grid_layout_not_supported", {
    nodes: sceneNodes.map((n) => n.name.slice(0, 30)),
  });
}

function getJustifyContentStyle({
  marginsInOrderPx,
  direction,
}: {
  marginsInOrderPx: number[];
  direction: "x" | "y";
}) {
  // todo consier number of items - 0, 1, 2, N

  const [paddingStart, paddingEnd] =
    direction === "y"
      ? ["padding-top", "padding-bottom"]
      : ["padding-left", "padding-right"];

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
      [paddingStart]: firstMargin + "px",
      [paddingEnd]: lastMargin + "px",
    };
  }

  if ((firstMargin || 0) > (lastMargin || 0)) {
    return {
      "justify-content": "flex-end",
      [paddingEnd]: lastMargin + "px",
    };
  }

  return {
    "justify-content": "flex-start",
    [paddingStart]: firstMargin + "px",
  };
}

function groupNodesAlongDirection({
  nodes,
  direction,
}: {
  nodes: readonly SceneNode[];
  direction: LayoutDirection;
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

function getMarginsAlongDirection({
  container,
  groupedChildren,
  direction,
}: {
  container: PhantomNodeInfo;
  groupedChildren: SceneNode[][];
  direction: LayoutDirection;
}): {
  marginsAlongDirection: number[];
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
} {
  const bbox = expectBbox(_.flatten(groupedChildren));

  const { marginLeft, marginRight, marginTop, marginBottom } = getOuterMargins({
    container,
    bbox,
  });

  const marginsAlongDirection: number[] = [
    direction === LayoutDirection.x ? marginLeft : marginTop,
  ];
  const bboxes = groupedChildren.map((group) => expectBbox(group));
  for (let i = 0; i < bboxes.length - 1; i++) {
    const marginPx = getBboxSpacing(bboxes[i], bboxes[i + 1])[direction];
    marginsAlongDirection.push(marginPx);
  }
  marginsAlongDirection.push(
    direction === LayoutDirection.x ? marginRight : marginBottom
  );

  return {
    marginsAlongDirection,
    margins: {
      top: marginTop,
      right: marginRight,
      bottom: marginBottom,
      left: marginLeft,
    },
  };
}

function getOuterMargins({
  container,
  bbox,
}: {
  container: PhantomNodeInfo;
  bbox: Bbox;
}): {
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
} {
  return {
    marginLeft: bbox.minX - container.origin.x,
    marginRight: container.width + container.origin.x - bbox.maxX,
    marginTop: bbox.minY - container.origin.y,
    marginBottom: container.height + container.origin.y - bbox.maxY,
  };
}

export const testing = {
  getOuterMargins,
};
