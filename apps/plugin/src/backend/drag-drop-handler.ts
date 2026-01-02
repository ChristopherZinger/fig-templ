import { makeDynamicImgNode } from "./custom-components";

export function setDragDropHandler(figma: PluginAPI) {
  figma.on("drop", (event: DropEvent) => {
    const { items, dropMetadata } = event;

    if (!items || items.length === 0 || !dropMetadata || !dropMetadata.type) {
      return false;
    }

    switch (dropMetadata.type) {
      case "dynamic-image":
        makeDynamicImgNode({
          position: {
            x: event.x,
            y: event.y,
          },
        });
        return true;
      default:
        console.error("unknown_drop_metadata_type", { dropMetadata });
        return false;
    }
  });
}
