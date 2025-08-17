import h from "hyperscript";
import type { AppNode } from "./types";

export function getHscriptFromAppNode(node: AppNode): HTMLElement {
  switch (node.type) {
    case "TEXT": {
      return getTextNode(node);
    }
    case "FRAME": {
      return getFrameNode(node);
    }
    default: {
      return getGenericNode(node);
    }
  }
}

function getTextNode<T extends Extract<AppNode, { type: "TEXT" }>>(appNode: T) {
  return h(
    "div",
    ...appNode.children.map(getHscriptFromAppNode),
    appNode.innerText,
    {
      style: getBaseStyle(appNode),
    }
  );
}

function getFrameNode<T extends Extract<AppNode, { type: "FRAME" }>>(
  appNode: T
) {
  return h("div", ...appNode.children.map(getHscriptFromAppNode), {
    style: {
      ...getBaseStyle(appNode),
      // position: "relative",
    },
  });
}

function getGenericNode(appNode: AppNode): HTMLElement {
  return h("div", ...appNode.children.map(getHscriptFromAppNode), {
    style: getBaseStyle(appNode),
  });
}

function getBaseStyle(appNode: AppNode) {
  console.log({ style: appNode.style });

  return appNode.style;
}
