import { error, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { removeUserAccount } from "@templetto/firebase"
import { USER_ID_TOKEN_COOKIE_NAME } from "$lib/stores/userStore"

export const actions = {
  default: async ({ locals, cookies }) => {
    if (!locals.firebaseUser) {
      error(401, "Unauthorized")
    }
    await removeUserAccount(locals.firebaseUser.uid)

    cookies.delete(USER_ID_TOKEN_COOKIE_NAME, { path: "/account" })

    redirect(303, "/")
  },
} satisfies Actions
