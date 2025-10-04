import h from "hyperscript";
import type { AppNode } from "./types";

export function getHtmlDocumentFromAppNode(
  node: AppNode,
  fontNames: Set<string>
): HTMLElement {
  const hsScript = getHscriptFromAppNode(node);

  const fontLinks = [...fontNames].map(
    (fontName) =>
      `https://fonts.googleapis.com/css2?family=${fontName
        .split(" ")
        .join("+")}&display=swap`
  );

  const preConnect = [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
  ];

  const html = h("html", [
    h("head", [
      h("meta", { charset: "UTF-8" }),
      ...preConnect.map((options) => h("link", options)),
      ...fontLinks.map((href) => h("link", { rel: "stylesheet", href })),
      h("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      }),
      h("title", "Templetto"),
    ]),
    h("body", [hsScript]),
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
    },
  });
}

function getGenericNode(appNode: AppNode): HTMLElement {
  return h("div", ...appNode.children.map(getHscriptFromAppNode), {
    style: getBaseStyle(appNode),
  });
}

function getBaseStyle(appNode: AppNode) {
  return appNode.style;
}
