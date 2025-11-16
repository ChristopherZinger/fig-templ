import { error, redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getTemplateContents, userHasAccessToOrg } from "@templetto/firebase"
import { log } from "@templetto/logging"

export const GET: RequestHandler = async ({
  params,
  locals: { firebaseUser },
}) => {
  if (!firebaseUser) {
    redirect(303, "/login")
  }

  const { orgId, templateId } = params

  const hasAccess = await userHasAccessToOrg({
    uid: firebaseUser.uid,
    orgId,
  })

  if (!hasAccess) {
    log.warn("user_attempted_to_access_template_without_permission", {
      uid: firebaseUser.uid,
      orgId,
      templateId,
    })
    error(403, "You do not have access to this organization")
  }

  let templateHtml: string
  try {
    templateHtml = await getTemplateContents({
      orgId,
      templateId,
    })
  } catch (err: any) {
    if (
      err.code === "template_not_found_in_storage" ||
      err.code === "expected_doc_not_found"
    ) {
      error(404, "Template not found")
    }
    log.error("failed_to_get_template_contents", { error: err, templateId })
    error(500, "Failed to retrieve template")
  }

  return new Response(templateHtml, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="template-${templateId}.html"`,
    },
  })
}
