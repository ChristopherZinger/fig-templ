// src/hooks.server.ts
import { type Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"
import { log } from "@templetto/logging"
import { authAdmin } from "$lib/server/firebase-admin/firebase-admin-init.js"

// export const supabase: Handle = async ({ event, resolve }) => {
// event.locals.supabase = createServerClient(
//   PUBLIC_SUPABASE_URL,
//   PUBLIC_SUPABASE_ANON_KEY,
//   {
//     cookies: {
//       getAll: () => event.cookies.getAll(),
//       /**
//        * SvelteKit's cookies API requires `path` to be explicitly set in
//        * the cookie options. Setting `path` to `/` replicates previous/
//        * standard behavior.
//        */
//       setAll: (cookiesToSet) => {
//         cookiesToSet.forEach(({ name, value, options }) => {
//           event.cookies.set(name, value, { ...options, path: "/" })
//         })
//       },
//     },
//   },
// )
// event.locals.supabaseServiceRole = createClient(
//   PUBLIC_SUPABASE_URL,
//   PRIVATE_SUPABASE_SERVICE_ROLE,
//   { auth: { persistSession: false } },
// )
// // https://github.com/supabase/auth-js/issues/888#issuecomment-2189298518
// if ("suppressGetSessionWarning" in event.locals.supabase.auth) {
//   // @ts-expect-error - suppressGetSessionWarning is not part of the official API
//   event.locals.supabase.auth.suppressGetSessionWarning = true
// } else {
//   console.warn(
//     "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/auth-js/issues/888.",
//   )
// }
// /**
//  * Unlike `supabase.auth.getSession()`, which returns the session _without_
//  * validating the JWT, this function also calls `getUser()` to validate the
//  * JWT before returning the session.
//  */
// event.locals.safeGetSession = async () => {
//   const {
//     data: { session },
//   } = await event.locals.supabase.auth.getSession()
//   if (!session) {
//     return { session: null, user: null, amr: null }
//   }
//   const {
//     data: { user },
//     error: userError,
//   } = await event.locals.supabase.auth.getUser()
//   if (userError) {
//     // JWT validation has failed
//     return { session: null, user: null, amr: null }
//   }
//   const { data: aal, error: amrError } =
//     await event.locals.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
//   if (amrError) {
//     return { session, user, amr: null }
//   }
//   return { session, user, amr: aal.currentAuthenticationMethods }
// }
// return resolve(event, {
//   filterSerializedResponseHeaders(name) {
//     return name === "content-range" || name === "x-supabase-api-version"
//   },
// })
// }

// Not called for prerendered marketing pages so generally okay to call on ever server request
// Next-page CSR will mean relatively minimal calls to this hook
const authGuard: Handle = async ({ event, resolve }) => {
  event.locals.firebaseUser = null
  const jwtToken = event.cookies.get("token")
  if (jwtToken) {
    try {
      const decodedToken = await authAdmin.verifyIdToken(jwtToken)
      event.locals.firebaseUser = decodedToken
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error)
      // Keep firebaseUser as null
    }
  }
  console.log("event.locals.firebaseUser", event.locals.firebaseUser)
  return resolve(event)
}
/*
  if (event.url.pathname.startsWith("/account")) {
    if (!event.locals.firebaseUser) {
      throw redirect(303, "/login")
    }
  }

  if (
    event.locals.firebaseUser &&
    (event.url.pathname.startsWith("/login") ||
      event.url.pathname.startsWith("/sign_up"))
  ) {
    throw redirect(303, "/account")
  }

}
  */

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
