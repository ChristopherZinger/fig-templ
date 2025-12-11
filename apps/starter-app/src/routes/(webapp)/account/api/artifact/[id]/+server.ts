import { error } from "@sveltejs/kit"
import { getFirestore, getUsersCollectionRef } from "@templetto/firebase"
import { deleteArtifact } from "@templetto/firebase/repositories/artifact"

export async function DELETE({ locals, params }) {
  const { firebaseUser } = locals

  if (!firebaseUser) {
    error(401, "Unauthorized")
  }

  getFirestore().runTransaction(async (t) => {
    const user = (
      await t.get(getUsersCollectionRef().doc(firebaseUser.uid))
    ).data()
    if (!user) {
      error(500, "Missing user doc")
    }
    await deleteArtifact(
      { orgId: user.defaultOrgId, artifactId: params.id, userId: user.uid },
      t,
    )
  })
  return new Response(null, { status: 204 })
}
