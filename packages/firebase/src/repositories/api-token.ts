import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getHashedToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
