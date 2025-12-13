import { error, json } from "@sveltejs/kit"
import {
  assertAccessToOrg,
  getBucket,
  getFirestore,
  getTemplatesCollectionRef,
  getUsersCollectionRef,
} from "@templetto/firebase"

export async function GET({ locals }) {
  const { firebaseUser } = locals
  if (!firebaseUser) {
    error(401, "Unauthorized, missing firebase user")
  }

  const templates = await getFirestore().runTransaction(async (t) => {
    const userDoc = (
      await t.get(getUsersCollectionRef().doc(firebaseUser.uid))
    ).data()
    if (!userDoc) {
      error(500, "Missing user doc")
    }

    await assertAccessToOrg({
      orgId: userDoc.defaultOrgId,
      uid: firebaseUser.uid,
    })

    const templates = (
      await t.get(getTemplatesCollectionRef({ orgId: userDoc.defaultOrgId }))
    ).docs.map((doc) => doc.data())

    return templates
  })

  const templatesWithDownloadUrls = await Promise.all(
    templates.map(async (template) => {
      const [downloadUrl] = await getBucket()
        .file(template.pathInStorage)
        .getSignedUrl({
          action: "read",
          expires: Date.now() + 1000 * 60 * 30, // 30 minutes
        })

      return { ...template, downloadUrl }
    }),
  )

  return json(templatesWithDownloadUrls)
}
