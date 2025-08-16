export type AppNode =
  | AppNodeBase<{
      type: string;
    }>
  | AppNodeBase<{
      type: "TEXT";
      innerText: string;
    }>;

type AppNodeBase<T extends { type: string } & Record<string, unknown>> = T & {
  name: string;
  style: Record<string, unknown>;
  children: AppNode[];
};
