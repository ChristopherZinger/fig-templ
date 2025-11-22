export type AppNode =
  | (AppNodeBase & {
      type: string;
    })
  | (AppNodeBase & {
      type: "TEXT";
      innerText: string;
    });

type AppNodeBase = {
  name: string;
  style: Record<string, unknown>;
  attributes: Record<string, unknown>;
  children: AppNode[];
};
