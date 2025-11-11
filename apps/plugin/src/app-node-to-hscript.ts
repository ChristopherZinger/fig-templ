import h from "hyperscript";
import type { AppNode } from "./types";

export function getHtmlDocumentFromAppNode(node: AppNode): HTMLElement {
  const hsScript = getHscriptFromAppNode(node);
  const fontNames = getFontFamilies(node);

  const fontLinks = [...fontNames].map(
    (fontName) =>
      `https://fonts.googleapis.com/css2?family=${fontName
        .split(" ")
        .join("+")}:ital,wght@0,100..900;1,100..900&display=swap`
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
      h(
        "style",
        `body {
          padding: 0;
          margin: 0;
          border: none;
          outline: none;
        }`
      ),
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
      ...appNode.attributes,
    }
  );
}

function getFrameNode<T extends Extract<AppNode, { type: "FRAME" }>>(
  appNode: T
) {
  return h("div", ...appNode.children.map(getHscriptFromAppNode), {
    style: getBaseStyle(appNode),
    ...appNode.attributes,
  });
}

function getGenericNode(appNode: AppNode): HTMLElement {
  return h("div", ...appNode.children.map(getHscriptFromAppNode), {
    style: getBaseStyle(appNode),
    ...appNode.attributes,
  });
}

function getBaseStyle(appNode: AppNode) {
  return appNode.style;
}

function getFontFamilies(node: AppNode): Set<string> {
  if (!node.children.length) {
    const result = new Set<string>();
    const font = node.style["font-family"];
    if (font) {
      result.add(font);
    }
    return result;
  }

  let fonts: Set<string> = new Set();
  node.children.forEach((child: AppNode) => {
    getFontFamilies(child).forEach((font) => {
      fonts.add(font);
    });
  });

  return fonts;
}
