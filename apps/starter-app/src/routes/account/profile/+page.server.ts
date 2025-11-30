import { error, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { removeUserAccount } from "@templetto/firebase"

export const actions = {
  default: async ({ locals }) => {
    if (!locals.firebaseUser) {
      error(401, "Unauthorized")
    }
    await removeUserAccount(locals.firebaseUser.uid)

    redirect(301, "/sign_out")
  },
} satisfies Actions
