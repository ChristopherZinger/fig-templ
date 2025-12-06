import type { Template_FsDoc } from "@templetto/firebase"
import z from "zod"

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

const apiTokenParser = z.object({
  token: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  orgId: z.string(),
})
type ApiToken = z.infer<typeof apiTokenParser>
export async function fetchGetApiTokens(): Promise<ApiToken[] | null> {
  const response = await fetch("/account/api/api-token")
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const result = z.array(apiTokenParser).safeParse(data)
  if (!result.success) {
    console.error("failed_to_parse_api_token", { error: result.error })
    return null
  }
  return result.data
}

export async function fetchPutApiToken(): Promise<void> {
  await fetch("/account/api/api-token", { method: "PUT" })
}

export async function fetchDeleteApiToken(tokenId: string): Promise<void> {
  await fetch("/account/api/api-token", {
    method: "DELETE",
    body: JSON.stringify({ tokenId }),
  })
}

export async function fetchPostAuthCookie(token: string | null): Promise<void> {
  await fetch("/account/api/set-auth-cookie", {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })
}
