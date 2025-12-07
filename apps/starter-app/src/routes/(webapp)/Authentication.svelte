<script lang="ts">
  import { userStore } from "$lib/stores/userStore"
  import { onIdTokenChanged, type Unsubscribe, type User } from "firebase/auth"
  import { auth } from "$lib/utils/firebase/init-firebase"
  import { onDestroy, onMount } from "svelte"
  import { fetchPostAuthCookie } from "$lib/utils/account-api-calls"
  import { goto } from "$app/navigation"

  interface Props {
    children?: import("svelte").Snippet
  }
  let { children }: Props = $props()

  let userBefore: User | null = null
  let unsubscribe: Unsubscribe
  onMount(() => {
    unsubscribe = onIdTokenChanged(auth, async (newUser) => {
      if (newUser) {
        const token = await newUser.getIdToken()
        await fetchPostAuthCookie(token)
        userStore.set(newUser)
        if (!userBefore || userBefore.uid !== newUser.uid) {
          goto("/account")
        }
      } else {
        await fetchPostAuthCookie(null)
        userStore.set(null)
        if (userBefore) {
          goto("/")
        }
      }
      userBefore = newUser
    })
  })

  onDestroy(() => {
    unsubscribe?.()
  })
</script>

{@render children?.()}
