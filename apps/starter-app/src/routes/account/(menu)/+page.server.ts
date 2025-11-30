import type { PageServerLoad } from "./$types"
import { getUserOrgTemplateDocs } from "@templetto/firebase/repositories/user"
import { error, redirect } from "@sveltejs/kit"
import { log } from "@templetto/logging"
import {
  getArtifactsCollectionRef,
  getBucket,
  getUsersCollectionRef,
} from "@templetto/firebase"
import { getBillableApiCallCountForMonth } from "@templetto/firebase/repositories/billable-api-call-logs"

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

  const [billableApiCallCount, numPdfsGenerated, templates] = await Promise.all(
    [
      getBillableApiCallCountForMonth({
        orgId: userDoc.defaultOrgId,
        date: new Date(),
      }),
      (
        await getArtifactsCollectionRef({ orgId: userDoc.defaultOrgId })
          .count()
          .get()
      ).data().count,
      getUserOrgTemplateDocs({
        uid: firebaseUser.uid,
        orgId: userDoc.defaultOrgId,
        limit: 5,
        sortByCreatedAt: "desc",
      }),
    ],
  )

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

  return {
    templates: templatesWithDownloadUrls,
    billableApiCallCount,
    numPdfsGenerated,
  }
}
