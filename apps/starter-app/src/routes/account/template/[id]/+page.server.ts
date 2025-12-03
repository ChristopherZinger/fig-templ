import { error, json } from "@sveltejs/kit"
import { getTemplateContents, getUsersCollectionRef } from "@templetto/firebase"
import { log } from "@templetto/logging"

export async function load({
  params: { id: templateId },
  locals: { firebaseUser },
}) {
  if (!firebaseUser) {
    error(400, "Unauthorized")
  }

  const userDoc = (
    await getUsersCollectionRef().doc(firebaseUser.uid).get()
  ).data()
  if (!userDoc) {
    log.error("missing_user_doc_for_auth_user", { uid: firebaseUser.uid })
    error(500, "Internal server error")
  }

  const htmlString = await getTemplateContents({
    orgId: userDoc.defaultOrgId,
    userId: userDoc.uid,
    templateId,
  })

  if (!htmlString) {
    error(404, "Template not found")
  }

  return { htmlString }
}
