export const DYNAMIC_IMG_INSTANCE_NAME = "templetto_dynamic_image";
export const TEMPLATE_LOOP_INSTANCE_NAME = "templetto_template_loop";

export async function makeDynamicImgNode({
  position,
}: {
  position: { x: number; y: number };
}) {
  let component = findComponent(DYNAMIC_IMG_INSTANCE_NAME);
  if (!component) {
    component = makeDynamicImgComponent();
  }

  const img = component.createInstance();
  // TODO: check if it collides with other stuff
  img.x = position.x;
  img.y = position.y;
  img.name = "img_" + Math.random().toString(36).substring(2, 5);

  figma.currentPage.appendChild(img);
}

function findComponent(name: string): ComponentNode | null {
  let component = figma.currentPage.findOne((node) => {
    return node.type === "COMPONENT" && node.name === name;
  }) as ComponentNode | undefined;

  return component || null;
}

function makeDynamicImgComponent(): ComponentNode {
  const rectNode = makeDynamicImagePlaceholderRectangle();
  const component = figma.createComponentFromNode(rectNode);
  component.name = DYNAMIC_IMG_INSTANCE_NAME;
  return component;
}

function makeDynamicImagePlaceholderRectangle(): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = "templetto_dynamic_image_rectangle";
  rect.x = 0;
  rect.y = 0;
  rect.visible = true;
  // TODO: set size as dynamic ?
  rect.resize(100, 100);
  // TODO add nice image fill

  const imgBase64 =
    "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";
  const img = figma.createImage(figma.base64Decode(imgBase64));
  rect.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];

  return rect;
}

export async function makeTemplateLoopComponentInstance({
  position,
}: {
  position: { x: number; y: number };
}) {
  const loopFrame = makeTemplateLoopComponent();
  loopFrame.x = position.x;
  loopFrame.y = position.y;
  loopFrame.name = "array_" + Math.random().toString(36).substring(2, 5);
}

function makeTemplateLoopComponent(): FrameNode {
  const loopFrame = figma.createFrame();
  loopFrame.layoutMode = "VERTICAL";
  loopFrame.itemSpacing = 10;
  loopFrame.name = "templetto_template_loop_frame";
  loopFrame.resize(400, 200);

  const rect = figma.createRectangle();
  rect.resize(100, 200);
  rect.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.7, b: 0.2 } }];
  loopFrame.appendChild(rect);

  loopFrame.setPluginData("custom_component_loop", "true");

  const v = loopFrame.getPluginData("custom_component_loop");
  console.log(v);

  return loopFrame;
}

//**
//
// <div>
//   <div>example item {{ value }}</div>
// </div>
//
// <div>
// {{#each div_name}}
//   <div>example item {{ value }}</div>
// {{/each }}
// </div>
//
//  */
