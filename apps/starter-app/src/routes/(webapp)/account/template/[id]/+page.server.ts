import { error } from "@sveltejs/kit"
import {
  getFirestore,
  getTemplateContents,
  getUsersCollectionRef,
  getUserTemplateDoc,
} from "@templetto/firebase"
import { getArtifactsByTemplateId } from "@templetto/firebase/repositories/artifact"
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

  const { defaultOrgId: orgId, uid: userId } = userDoc

  const { templateDoc, htmlString, artifacts } =
    await getFirestore().runTransaction(async (t) => {
      const [templateDoc, htmlString, artifacts] = await Promise.all([
        getUserTemplateDoc({ orgId, userId, templateId }, t),
        getTemplateContents({ orgId, userId, templateId }, t),
        getArtifactsByTemplateId({ orgId, templateId, userId }, t),
      ])

      return {
        templateDoc,
        htmlString,
        artifacts,
      }
    })

  if (!htmlString) {
    error(404, "Template not found")
  }

  return { htmlString, templateDoc, artifacts }
}
