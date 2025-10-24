import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    auth?:
      | { type: "plugin-session"; uid: string }
      | { type: "api-token"; orgId: string };
  }
}
