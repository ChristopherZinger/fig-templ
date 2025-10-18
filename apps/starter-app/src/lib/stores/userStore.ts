import { writable } from "svelte/store"
import cookie from "cookie"
import type { User } from "firebase/auth"
import { browser } from "$app/environment"
import { auth } from "../utils/firebase/init-firebase"

export const userStore = writable<User | null>(null)

if (browser) {
  auth.onIdTokenChanged(async (newUser) => {
    const token = newUser ? await newUser?.getIdToken() : undefined
    if (token) {
      document.cookie = cookie.serialize("token", token ?? "", {
        path: "/",
        maxAge: token ? undefined : 0,
      })
      userStore.set(newUser)
    } else {
      document.cookie = cookie.serialize("token", "", {
        path: "/",
        maxAge: 0,
      })
      userStore.set(null)
    }
  })

  // refresh the ID token every 10 minutes
  setInterval(
    async () => {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true)
      }
    },
    10 * 60 * 1000,
  )
}
