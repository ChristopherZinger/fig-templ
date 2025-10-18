import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getUsersTemplate } from "$lib/server/firebase-queries"

export const actions = {
  // signout: async ({ locals: { supabase, safeGetSession } }) => {
  //   const { session } = await safeGetSession()
  //   if (session) {
  //     await supabase.auth.signOut()
  //     redirect(303, "/")
  //   }
  // },
}

export const load: PageServerLoad = async ({ locals: { firebaseUser } }) => {
  // Session here is from authGuard hook
  if (!firebaseUser) {
    return {
      firebaseUser: null,
      userTemplates: [],
      session: null,
    }
  }
  const userTemplates = await getUsersTemplate(firebaseUser.uid)

  return {
    firebaseUser,
    userTemplates,
    session: null,
  }
}
