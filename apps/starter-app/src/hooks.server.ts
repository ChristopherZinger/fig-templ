import { type Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"
import { log } from "@templetto/logging"
import {
  ensureUserAndOrgForAuthUser,
  getAuth,
  initFirebaseAdmin,
  getFirestore,
} from "@templetto/firebase"
import { env } from "$env/dynamic/private"
import { USER_ID_TOKEN_COOKIE_NAME } from "$lib/stores/userStore"

initFirebaseAdmin({
  bucketUri: env.FIREBASE_STORAGE_BUCKET_NAME || "",
  googleApplicationCredentials: env.GOOGLE_APPLICATION_CREDENTIALS || "",
})

const authGuard: Handle = async ({ event, resolve }) => {
  event.locals.firebaseUser = null
  const jwtToken = event.cookies.get(USER_ID_TOKEN_COOKIE_NAME)
  if (jwtToken) {
    try {
      const decodedToken = await getAuth().verifyIdToken(jwtToken)
      event.locals.firebaseUser = decodedToken

      await getFirestore().runTransaction(async (t) => {
        await ensureUserAndOrgForAuthUser(t, {
          uid: decodedToken.uid,
          userName: decodedToken.name || "New User",
          email: decodedToken.email || "",
        })
      })
    } catch (error) {
      log.error("Error verifying Firebase ID token:", error)
    }
  }
  return resolve(event)
}

const logger: Handle = async ({ event, resolve }) => {
  log.info("webapp_request", {
    method: event.request.method,
    url: event.url.pathname,
    userAgent: event.request.headers.get("user-agent"),
    ...(event.locals.firebaseUser
      ? {
          userId: event.locals.firebaseUser.uid,
        }
      : {}),
  })

  return resolve(event)
}

export const handle: Handle = sequence(logger, authGuard)
