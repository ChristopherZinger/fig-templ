import type { Template_FsDoc } from "@templetto/firebase"

export async function fetchDeleteTemplate(
  templateId: string,
): Promise<Response> {
  return await fetch(`account/api/template/${templateId}`, {
    method: "DELETE",
  })
}

export async function fetchGetTemplates(): Promise<
  (Template_FsDoc & { downloadUrl: string })[]
> {
  const response = await fetch("/account/api/template")
  return await response.json()
}
