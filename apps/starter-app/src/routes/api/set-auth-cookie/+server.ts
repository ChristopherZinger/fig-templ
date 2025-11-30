import { USER_ID_TOKEN_COOKIE_NAME } from "$lib/stores/userStore"
import { error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"

export async function POST(event) {
  const tokenHeader = event.request.headers.get("Authorization")

  if (!tokenHeader) {
    resetFbAuthTokenCookie(event)
    error(400, "Bad Request")
  }

  const token = tokenHeader.split(" ")[1]
  if (!token) {
    resetFbAuthTokenCookie(event)
    error(400, "Bad Request")
  }

  event.cookies.set(USER_ID_TOKEN_COOKIE_NAME, token, {
    path: "/account",
    maxAge: 60 * 30, // 30 min
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  })
  return new Response("OK", { status: 200 })
}

function resetFbAuthTokenCookie(event: RequestEvent) {
  event.cookies.delete(USER_ID_TOKEN_COOKIE_NAME, {
    path: "/account",
  })
}
