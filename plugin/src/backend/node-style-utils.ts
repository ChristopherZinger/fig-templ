import { hasLayoutMode, isRootNode } from "./node-utils";

export function buildNodeStyle(node: BaseNode) {
  const x = "layoutMode" in node && node.layoutMode !== "NONE";

  return Object.assign(
    {},
    getBaseStyles(node),
    getSizeStyles(node),
    getFlexStyle(node),
    getPositionStyles(node),
    getLayoutAlignSelfStyles(node),
    getBackgroundStyle(node),
    getGapStyle(node),
    getPaddingStyle(node),
    getJustifyContentStyle(node)
  );
}

function getFlexStyle(node: BaseNode):
  | {
      display: "flex";
      "flex-direction": "row" | "column";
    }
  | {
      display: "grid";
    }
  | null {
  if (!hasLayoutMode(node) || node.layoutMode === "NONE") {
    console.warn("layout_mode_not_supported", node);
    return null;
  }

  switch (node.layoutMode) {
    case "HORIZONTAL": {
      return {
        display: "flex",
        "flex-direction": "row",
      };
    }
    case "VERTICAL":
      return {
        display: "flex",
        "flex-direction": "column",
      };
    case "GRID":
      return {
        display: "grid",
      };
  }
}

function getPositionStyles(node: BaseNode) {
  if (isRootNode(node)) {
    return { position: "absolute" };
  }
  if (node.parent && isRootNode(node.parent)) {
    return { position: "absolute" };
  }
  return { position: "static" };
}

function getLayoutAlignSelfStyles(
  node: BaseNode
):
  | { "align-self": string; width: string }
  | { "align-self": string; height: string }
  | { "align-self": string }
  | null {
  if (!hasLayoutMode(node)) {
    console.warn("layout_align_not_supported", node);
    return null;
  }

  const parentLayoutMode =
    node.parent && hasLayoutMode(node.parent)
      ? node.parent.layoutMode
      : undefined;

  const layoutAlign = node.layoutAlign;

  switch (layoutAlign) {
    case "STRETCH":
      if (node.parent && !hasLayoutMode(node.parent)) {
        console.warn("layout_align_not_supported", node);
        return null;
      }
      switch (parentLayoutMode) {
        case "HORIZONTAL":
          return {
            "align-self": "stretch",
            height: "100%",
          };
        case "VERTICAL":
          return {
            "align-self": "stretch",
            width: "100%",
          };
      }

    case "MIN":
      return { "align-self": "flex-start" };

    case "CENTER":
      return { "align-self": "center" };

    case "MAX":
      return { "align-self": "flex-end" };

    case "INHERIT":
      return { "align-self": "auto" };
  }
}

function getBaseStyles(node: BaseNode) {
  switch (node.type) {
    case "DOCUMENT":
      return {};
    case "PAGE":
      return {};
    default:
      return {
        left: node.x + "px",
        top: node.y + "px",
      };
  }
}

function getSizeStyles(node: BaseNode) {
  // TODO this should react to layout properties e.g stretch, hug, shrink etc
  switch (node.type) {
    case "DOCUMENT":
      return {};
    case "PAGE":
      return {};
    default:
      return {
        width: node.width + "px",
        height: node.height + "px",
        minWidth: node.minWidth + "px",
        minHeight: node.minHeight + "px",
        maxWidth: node.maxWidth + "px",
        maxHeight: node.maxHeight + "px",
      };
  }
}

function getBackgroundStyle(node: BaseNode): Record<string, string> {
  if (node.type === "TEXT") {
    return {};
  }

  // Check if node has fills property
  if (!("fills" in node) || !node.fills || !Array.isArray(node.fills)) {
    return {};
  }

  // Get all visible fills
  const fill = node.fills.find((fill) => fill.visible === true);

  if (!fill) {
    return {};
  }

  switch (fill.type) {
    case "SOLID": {
      const solidFill = fill as SolidPaint;
      const { r, g, b } = solidFill.color;
      const alpha = solidFill.opacity !== undefined ? solidFill.opacity : 1;

      // Convert from 0-1 range to 0-255 range
      const red = Math.round(r * 255);
      const green = Math.round(g * 255);
      const blue = Math.round(b * 255);

      if (alpha < 1) {
        return {
          background: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
        };
      } else {
        return {
          background: `rgb(${red}, ${green}, ${blue})`,
        };
      }
    }

    case "GRADIENT_LINEAR":
    case "GRADIENT_RADIAL":
    case "GRADIENT_ANGULAR":
    case "GRADIENT_DIAMOND": {
      // For gradients, you could generate CSS gradients
      // For now, just use the first gradient stop color
      const gradientFill = fill as GradientPaint;
      if (gradientFill.gradientStops && gradientFill.gradientStops.length > 0) {
        const firstStop = gradientFill.gradientStops[0];
        const { r, g, b } = firstStop.color;
        const alpha = firstStop.color.a || 1;

        const red = Math.round(r * 255);
        const green = Math.round(g * 255);
        const blue = Math.round(b * 255);

        return {
          background: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
        };
      }
      return {};
    }

    case "IMAGE": {
      // For images, you might want to handle differently
      // Could return a placeholder color or try to extract dominant color
      return {
        background: "#f0f0f0", // Placeholder
        backgroundImage: "/* Image fill detected */",
      };
    }

    default:
      return {};
  }
}

function getGapStyle(node: BaseNode): { gap: string } | null {
  if (node.type === "TEXT") {
    return null;
  }

  if (!hasLayoutMode(node) || node.layoutMode === "NONE") {
    return null;
  }

  if (node.primaryAxisAlignItems === "SPACE_BETWEEN") {
    return null;
  }

  return {
    gap: node.itemSpacing + "px",
  };
}

function getPaddingStyle(node: BaseNode): {
  "padding-top": string;
  "padding-right": string;
  "padding-bottom": string;
  "padding-left": string;
} | null {
  if (!hasLayoutMode(node)) {
    return null;
  }

  return {
    "padding-top": node.paddingTop + "px",
    "padding-right": node.paddingRight + "px",
    "padding-bottom": node.paddingBottom + "px",
    "padding-left": node.paddingLeft + "px",
  };
}

function getJustifyContentStyle(
  node: BaseNode
): { "justify-content": string } | null {
  if (!hasLayoutMode(node)) {
    return null;
  }

  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return {
        "justify-content": "flex-start",
      };
    case "MAX":
      return {
        "justify-content": "flex-end",
      };
    case "CENTER":
      return {
        "justify-content": "center",
      };
    case "SPACE_BETWEEN":
      return {
        "justify-content": "space-between",
      };
  }
}
