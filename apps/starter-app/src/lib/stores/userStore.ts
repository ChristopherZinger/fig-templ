import { writable } from "svelte/store"
import type { User } from "firebase/auth"

export const USER_ID_TOKEN_COOKIE_NAME = "tmpl_user_id_token"

export const userStore = writable<User | null>(null)
