<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import z from "zod"

  /**
   * THIS PAGE OPENS IN THE PLUGIN
   */

  const SERVER_URL = "http://localhost:3000"
  const WEBAPP_URL = "http://localhost:5173"

  let writeKey: string | null = null
  let readKey: string | null = null
  let interval: NodeJS.Timeout | null = null
  async function getPkceKeys() {
    try {
      console.log("getting_pkce_keys")
      const response = await fetch(`${SERVER_URL}/plugin/get-pkce-keys`, {
        method: "GET",
      })
      const resp = await response.json()
      writeKey = resp.writeKey
      readKey = resp.readKey

      if (interval) {
        clearInterval(interval)
      }
      interval = setInterval(
        () => readKey && pullSessionToken(readKey),
        1000 * 1,
      )

      window.open(`${WEBAPP_URL}/plugin/login?writeKey=${writeKey}`, "_blank")
    } catch (error) {
      console.log({ error })
    }
  }

  async function pullSessionToken(readKey: string) {
    console.log("pulling_session_token")
    let sessionKey: string | null = null
    try {
      const response = await fetch(`${SERVER_URL}/plugin/read-session-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readKey }),
      })
      if (!response.ok) {
        console.error("failed_to_pull_session", response)
        return
      }
      const respBody = await response.json()
      const parseResult = z.object({ sessionKey: z.string() }).parse(respBody)
      sessionKey = parseResult.sessionKey
    } catch (error) {
      console.error({ error })
      return
    }

    if (!sessionKey) {
      console.error("expected_session_key")
      return
    }
    if (interval) {
      clearInterval(interval)
    }

    saveSessionKeyInLocalStorage(sessionKey)
  }

  function saveSessionKeyInLocalStorage(sessionKey: string) {
    // TODO: implement
    // - send message to main thread
  }

  onMount(() => {
    void getPkceKeys()
  })

  onDestroy(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
</script>

<div>Login In Browser</div>
