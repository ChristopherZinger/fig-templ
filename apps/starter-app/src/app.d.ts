import { Session, SupabaseClient, type AMREntry } from "@supabase/supabase-js"
import { Database } from "./DatabaseDefinitions"
import type { DecodedIdToken } from "firebase-admin/auth"

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      firebaseUser: DecodedIdToken | null
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}
