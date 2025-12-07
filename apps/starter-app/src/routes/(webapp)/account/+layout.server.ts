import { getUsersTemplate } from "$lib/server/firebase-queries"
import type { LayoutServerLoad } from "./$types"
import { getUsersCollectionRef } from "@templetto/firebase"
import { log } from "@templetto/logging"
import { error, redirect } from "@sveltejs/kit"

export const load: LayoutServerLoad = async ({ locals: { firebaseUser } }) => {
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

  return {
    currentOrg: userDoc.defaultOrgId,
    firebaseUser,
    userTemplates,
  }
}
