import { makeDynamicImgNode } from "./custom-components";

export function setDragDropHandler(figma: PluginAPI) {
  figma.on("drop", (event) => {
    const { items, dropMetadata } = event;

    if (!items || items.length === 0 || !dropMetadata || !dropMetadata.type) {
      return;
    }

    switch (dropMetadata.type) {
      case "dynamic-image":
        makeDynamicImgNode({
          position: {
            x: event.x,
            y: event.y,
          },
        });
        break;
      default:
        console.error("unknown_drop_metadata_type", { dropMetadata });
        break;
    }
  });
}
