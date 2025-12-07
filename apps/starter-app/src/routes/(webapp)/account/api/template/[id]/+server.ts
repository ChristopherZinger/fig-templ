import { error } from "@sveltejs/kit"
import {
  assertAccessToOrg,
  getFirestore,
  getTemplatesCollectionRef,
  getUsersCollectionRef,
} from "@templetto/firebase"

export async function DELETE({ locals, params }) {
  const { id: templateId } = params

  if (!templateId) {
    error(404, "Template not found")
  }

  const { firebaseUser } = locals

  if (!firebaseUser) {
    error(401, "Unauthorized, missing firebase user")
  }

  await getFirestore().runTransaction(async (t) => {
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

    t.delete(
      getTemplatesCollectionRef({ orgId: userDoc.defaultOrgId }).doc(
        templateId,
      ),
    )
  })
  return new Response(null, { status: 204 })
}
