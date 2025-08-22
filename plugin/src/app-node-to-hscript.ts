import h from "hyperscript";
import type { AppNode } from "./types";

export function getHtmlDocumentFromAppNode(
  node: AppNode,
  fontNames: Set<string>
): HTMLElement {
  const html = h("html", [
    h("head", [
      h("meta", { charset: "UTF-8" }),
      h("link", { rel: "icon", type: "image/svg+xml", href: "/vite.svg" }),
      h("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      h("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      }),
      ...[...fontNames].map((fontName) =>
        h("link", {
          rel: "stylesheet",
          href: `https://fonts.googleapis.com/css2?family=${fontName}`,
        })
      ),
      h("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      }),
      h("title", "Templetto"),
      h(
        "style",
        `
          * {
            font-family: "Inria Sans", sans-serif;
            font-weight: 300;
            font-style: normal;
          }
        `
      ),
    ]),
    h("body", [getHscriptFromAppNode(node)]),
  ]);
  return html;
}

function getHscriptFromAppNode(node: AppNode): HTMLElement {
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
    ...(appNode.children || []).map(getHscriptFromAppNode),
    appNode.innerText,
    {
      style: getBaseStyle(appNode),
    }
  );
}

function getFrameNode<T extends Extract<AppNode, { type: "FRAME" }>>(
  appNode: T
) {
  return h("div", ...(appNode.children || []).map(getHscriptFromAppNode), {
    style: {
      ...getBaseStyle(appNode),
      // position: "relative",
    },
  });
}

function getGenericNode(appNode: AppNode): HTMLElement {
  return h("div", ...(appNode.children || []).map(getHscriptFromAppNode), {
    style: getBaseStyle(appNode),
  });
}

function getBaseStyle(appNode: AppNode) {
  return appNode.style;
}
