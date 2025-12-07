import { MAX_TOKENS_PER_ORG } from "@templetto/firebase/config"

export const load = () => {
  return { maxNumTokens: MAX_TOKENS_PER_ORG }
}
