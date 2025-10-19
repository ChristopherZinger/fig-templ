<script lang="ts">
  import { sessionTokenStore } from "../lib/stores/sessionTokenStore";
  import { sendToMainThread } from "../lib/utils/messages";
  import { UiMsg } from "../lib/utils/shared/messages";
  import { URLS } from "../lib/utils/shared/urls";

  $: sessionToken = $sessionTokenStore;

  async function logout() {
    if (!sessionToken) {
      console.error("logout_requested_but_no_session_token");
      return;
    }

    sendToMainThread(UiMsg.Logout);

    try {
      const response = await fetch(`${URLS.server}/plugin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });

      if (!response.ok) {
        console.error("logout_request_failed", { response });
      }
    } catch (error) {
      console.error("failed_to_logout", error);
      return;
    }
  }
</script>

<button onclick={logout} disabled={!sessionToken}>Logout</button>
