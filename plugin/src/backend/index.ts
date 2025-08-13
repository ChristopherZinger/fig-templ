figma.showUI(__html__, { width: 320, height: 240, title: "Figma Template" });

figma.ui.onmessage = (msg) => {
  console.log({ msg });
  figma.ui.postMessage({ type: "hello", data: { data: "data" } });
};
