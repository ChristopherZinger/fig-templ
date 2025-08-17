export type AppNode =
  | AppNodeBase<{
      type: string;
    }>
  | AppNodeBase<{
      type: "TEXT";
      innerText: string;
    }>;

type AppNodeBase<T extends { type: string }> = T & {
  name: string;
  style: Record<string, unknown>;
  css: Record<string, unknown>;
  children: AppNode[];
  parent: AppNode | null;
};
