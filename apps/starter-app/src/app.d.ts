import type { DecodedIdToken } from "firebase-admin/auth"

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      firebaseUser: DecodedIdToken | null
      currentOrg: Organization_FsDoc | null
    }
    // interface Error {}
  }
}

export {}
