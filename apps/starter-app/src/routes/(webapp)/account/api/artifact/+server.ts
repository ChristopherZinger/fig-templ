import { error, json } from "@sveltejs/kit"
import {
  expectUserById,
  getFirestore,
  type User_FsDoc,
} from "@templetto/firebase"
import { getArtifactsByTemplateId } from "@templetto/firebase/repositories/artifact"
import { log } from "@templetto/logging"
import z from "zod"

export async function GET({ locals, url }) {
  const { firebaseUser } = locals

  if (!firebaseUser) {
    error(401, "Unauthorized")
  }

  const templateId = z.string().min(1).parse(url.searchParams.get("templateId"))

  const artifacts = await getFirestore().runTransaction(async (t) => {
    let user: User_FsDoc | null
    try {
      user = await expectUserById(firebaseUser.uid, t)
    } catch (err) {
      log.error("error_expecting_user_by_id", { error: err })
      error(500, "Internal server error")
    }

    const { defaultOrgId: orgId, uid: userId } = user
    const artifacts = await getArtifactsByTemplateId(
      { orgId, templateId, userId },
      t,
    )
    return artifacts
  })

  return json({ artifacts })
}
