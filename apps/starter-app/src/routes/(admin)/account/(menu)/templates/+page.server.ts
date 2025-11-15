import type { PageServerLoad } from "./$types"
import { getUsersCollectionRef } from "@templetto/firebase"
import { getUserOrgTemplateDocs } from "@templetto/firebase/repositories/user"
import { error, redirect } from "@sveltejs/kit"
import { log } from "@templetto/logging"

export const load: PageServerLoad = async ({ locals: { firebaseUser } }) => {
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

  const templates = await getUserOrgTemplateDocs({
    uid: firebaseUser.uid,
    orgId: userDoc.defaultOrgId,
    sortByCreatedAt: "desc",
  })

  return {
    templates,
  }
}
