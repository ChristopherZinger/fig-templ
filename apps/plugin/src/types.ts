export type AppNode =
  | (AppNodeBase & {
      type: AppNodeType.FRAME;
    })
  | (AppNodeBase & {
      type: AppNodeType.IMAGE;
    })
  | (AppNodeBase & {
      type: AppNodeType.OTHER;
    })
  | (AppNodeBase & {
      type: AppNodeType.RECTANGLE;
    })
  | (AppNodeBase & {
      type: AppNodeType.TEXT;
      innerText: string;
    });

type AppNodeBase = {
  name: string;
  style: Record<string, unknown>;
  attributes: Record<string, unknown>;
  children: AppNode[];
};

export enum AppNodeType {
  FRAME = "FRAME",
  IMAGE = "IMAGE",
  OTHER = "OTHER",
  RECTANGLE = "RECTANGLE",
  TEXT = "TEXT",
}
