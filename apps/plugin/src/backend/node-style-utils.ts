import { hasLayoutMode, isTopLevelNode } from "./node-utils";

/**
 * @returns [cssStyles, options]
 */
export function buildNodeStyle(
  node: SceneNode
): [Record<string, string>, { fontNames: string[] }] {
  const [fontStyles, { fontNames }] = getFontStyle(node);

  return [
    Object.assign(
      {},
      getBaseStyles(node),
      getSizeStyles(node),
      getMinMaxSizeStyles(node),
      getFlexStyle(node),
      getPositionStyles(node),
      getAlignItemsStyle(node),
      getBackgroundStyle(node),
      getGapStyle(node),
      getPaddingStyle(node),
      getJustifyContentStyle(node),
      getBorderStyle(node),
      fontStyles
    ),
    { fontNames },
  ];
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
  if (isTopLevelNode(node)) {
    return { position: "absolute" };
  }
  if (node.parent && isTopLevelNode(node.parent)) {
    return { position: "absolute" };
  }
  return { position: "static" };
}

function getAlignItemsStyle(node: BaseNode): { "align-items": string } | null {
  if (!hasLayoutMode(node)) {
    console.warn("layout_align_not_supported", node);
    return null;
  }

  switch (node.counterAxisAlignItems) {
    case "MIN":
      return { "align-items": "start" };

    case "CENTER":
      return { "align-items": "center" };

    case "MAX":
      return { "align-items": "end" };
    case "BASELINE":
      return { "align-items": "baseline" };
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

function getSizeStyles(node: BaseNode): {
  width: string;
  height: string;
  "text-wrap"?: "wrap" | "nowrap";
} | null {
  switch (node.type) {
    case "DOCUMENT":
      return null;
    case "PAGE":
      return null;
    case "TEXT":
      switch (node.textAutoResize) {
        case "NONE":
          return {
            width: node.width + "px",
            height: node.height + "px",
          };
        case "WIDTH_AND_HEIGHT":
          return {
            width: "auto",
            height: node.height + "px",
            "text-wrap": "nowrap",
          };
        case "HEIGHT":
          return {
            height: "auto",
            width: node.width + "px",
            "text-wrap": "wrap",
          };
        case "TRUNCATE":
          // deprecated
          return {
            width: node.width + "px",
            height: node.height + "px",
          };
        default:
          console.error("text_auto_resize_not_supported", node);
          return null;
      }

    default:
      return {
        width: node.width + "px",
        height: node.height + "px",
      };
  }
}

function getMinMaxSizeStyles(node: BaseNode): {
  minWidth: string;
  minHeight: string;
  maxWidth: string;
  maxHeight: string;
} | null {
  switch (node.type) {
    case "DOCUMENT":
      return null;
    case "PAGE":
      return null;
    default:
      return {
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

function getBorderStyle(node: BaseNode): {
  "border-width": string;
  "border-style": string;
  "border-color": string;
} | null {
  if (
    "strokes" in node &&
    Array.isArray(node.strokes) &&
    node.strokes.length > 0
  ) {
    const stroke = node.strokes.find((stroke) => stroke.visible === true);
    return {
      "border-width": stroke.thickness + "px",
      "border-style": "solid",
      "border-color":
        stroke.color.r + " " + stroke.color.g + " " + stroke.color.b,
    };
  }

  return null;
}

type FontCssStyles = {
  "font-family"?: string;
  "font-size"?: string;
  "font-style"?: string;
  "font-weight"?: string;
};
function getFontStyle(
  node: BaseNode
): [FontCssStyles | null, { fontNames: string[] }] {
  const fontNames: string[] = [];
  if (node.type === "TEXT") {
    const result: FontCssStyles = {};
    if (node.fontName !== figma.mixed) {
      fontNames.push(node.fontName.family);
      result["font-family"] = node.fontName.family;
      result["font-style"] = node.fontName.style;
    }
    if (node.fontWeight !== figma.mixed) {
      result["font-weight"] = node.fontWeight + "px";
    }
    if (node.fontSize !== figma.mixed) {
      result["font-size"] = node.fontSize + "px";
    }
    return [result, { fontNames }];
  }
  return [null, { fontNames }];
}
