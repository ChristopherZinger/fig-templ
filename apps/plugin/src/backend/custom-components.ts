export const DYNAMIC_IMG_INSTANCE_NAME = "templetto_dynamic_image";

export async function makeDynamicImgNode() {
  let component = figma.currentPage.findOne((node) => {
    return node.type === "COMPONENT" && node.name === DYNAMIC_IMG_INSTANCE_NAME;
  }) as ComponentNode | undefined;

  if (!component) {
    component = makeDynamicImgComponent();
  }

  const img = component.createInstance();
  // TODO: check if it collides with other stuff
  img.x = 110;
  img.y = 0;
  img.name = "img_" + Math.random().toString(36).substring(2, 5);

  figma.currentPage.appendChild(img);
}

function makeDynamicImgComponent(): ComponentNode {
  const rectNode = makeRectangle();
  const component = figma.createComponentFromNode(rectNode);
  component.name = DYNAMIC_IMG_INSTANCE_NAME;
  return component;
}

function makeRectangle(): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = "templetto_dynamic_image_rectangle";
  rect.x = 0;
  rect.y = 0;
  rect.visible = true;
  // TODO: set size as dynamic ?
  rect.resize(100, 100);
  // TODO add nice image fill
  rect.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];

  return rect;
}
