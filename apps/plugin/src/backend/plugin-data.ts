export enum AppPluginDataKey {
  TEMPLATE_LOOP_NODE = "template_loop_node",
}

export type AppPluginDataInfo = {
  pluginDataType: AppPluginDataKey.TEMPLATE_LOOP_NODE;
  loopDataKey: string;
};

export function setPluginData(node: SceneNode, info: AppPluginDataInfo): null {
  switch (info.pluginDataType) {
    case AppPluginDataKey.TEMPLATE_LOOP_NODE:
      node.setPluginData(info.pluginDataType, JSON.stringify(info));
      return null;
  }
}

export function getPluginData<T extends AppPluginDataKey>(
  node: SceneNode,
  key: T
): Extract<AppPluginDataInfo, { pluginDataType: T }> | null {
  switch (key) {
    case AppPluginDataKey.TEMPLATE_LOOP_NODE:
      const data = node.getPluginData(key);
      if (!data) return null;
      return JSON.parse(data) as Extract<
        AppPluginDataInfo,
        { pluginDataType: T }
      >;
  }
}
