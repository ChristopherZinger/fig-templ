import { GoogleAuth, type IdTokenClient } from "google-auth-library";
import { TARGET_AUDIENCE } from "./env";

let googleAuthIdTokenClient: Promise<IdTokenClient> | null = null;
export async function getIdTokenClient(): Promise<
  IdTokenClient | { fetch: typeof fetch }
> {
  if (process.env.NODE_ENV !== "production") {
    return { fetch };
  }
  if (googleAuthIdTokenClient) {
    return await googleAuthIdTokenClient;
  }
  const auth = new GoogleAuth();
  googleAuthIdTokenClient = auth.getIdTokenClient(TARGET_AUDIENCE);
  return await googleAuthIdTokenClient;
}
