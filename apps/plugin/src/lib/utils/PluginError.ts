export class PluginError extends Error {
  info: Record<string, unknown>;
  constructor(message: string, info: Record<string, unknown> = {}) {
    super(message);
    this.name = "PluginError";
    this.info = info;
  }
}
