import z from "zod"

const apiTokenParser = z.object({
  token: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  orgId: z.string(),
})
type ApiToken = z.infer<typeof apiTokenParser>
export async function fetchGetApiTokens(): Promise<ApiToken[] | null> {
  const response = await fetch("/api/api-token")
  const result = z.array(apiTokenParser).safeParse(await response.json())
  if (!result.success) {
    console.error("failed_to_parse_api_token", { error: result.error })
    return null
  }
  return result.data
}

export async function fetchPutApiToken(): Promise<void> {
  await fetch("/api/api-token", { method: "PUT" })
}

export async function fetchDeleteApiToken(tokenId: string): Promise<void> {
  await fetch("/api/api-token", {
    method: "DELETE",
    body: JSON.stringify({ tokenId }),
  })
}
