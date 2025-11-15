import type { PageServerLoad } from "./$types"
import { getUsersTemplate } from "$lib/server/firebase-queries"
import { getUserOrgTemplateDocs } from "@templetto/firebase/repositories/user"
import { error, redirect } from "@sveltejs/kit"
import { log } from "@templetto/logging"
import { getUsersCollectionRef } from "@templetto/firebase"

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
    redirect(307, "/")
  }

  const userDoc = (
    await getUsersCollectionRef().doc(firebaseUser.uid).get()
  ).data()
  if (!userDoc) {
    log.error("missing_user_doc_for_auth_user", { uid: firebaseUser.uid })
    error(500, "Internal server error")
  }

  const userTemplates = await getUsersTemplate(firebaseUser.uid)

  const recentTemplates = await getUserOrgTemplateDocs({
    uid: firebaseUser.uid,
    orgId: userDoc.defaultOrgId,
    limit: 5,
    sortByCreatedAt: "desc",
  })

  return {
    currentOrg: userDoc.defaultOrgId,
    firebaseUser,
    userTemplates,
    recentTemplates,
    session: null,
  }
}
