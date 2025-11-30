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

initFirebaseAdmin({
  bucketUri: env.PRIVATE_FIREBASE_STORAGE_BUCKET_NAME,
  googleApplicationCredentials: env.GOOGLE_APPLICATION_CREDENTIALS,
})

const authGuard: Handle = async ({ event, resolve }) => {
  event.locals.firebaseUser = null
  const jwtToken = event.cookies.get("token")
  if (jwtToken) {
    try {
      const decodedToken = await getAuth().verifyIdToken(jwtToken)
      event.locals.firebaseUser = decodedToken

      await getFirestore().runTransaction(async (t) => {
        await ensureUserAndOrgForAuthUser(t, {
          uid: decodedToken.uid,
          userName: decodedToken.name || "New User",
        })
      })
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error)
    }
  }
  return resolve(event)
}

const logger: Handle = async ({ event, resolve }) => {
  const startTime = Date.now()

  log.info("request_started", {
    method: event.request.method,
    url: event.url.pathname,
    userAgent: event.request.headers.get("user-agent"),
    ...(event.locals.firebaseUser
      ? {
          firebaseUser: event.locals.firebaseUser.uid,
          firebaseUserEmail: event.locals.firebaseUser.email,
          firebaseUserDisplayName: event.locals.firebaseUser.displayName,
          firebaseUserProvider: event.locals.firebaseUser.providerId,
          firebaseUserProviderID: event.locals.firebaseUser.providerID,
        }
      : {}),
  })

  const response = await resolve(event)

  const duration = Date.now() - startTime
  log.info("request_completed", {
    method: event.request.method,
    url: event.url.pathname,
    status: response.status,
    duration,
  })

  return response
}

export const handle: Handle = sequence(logger, authGuard)
