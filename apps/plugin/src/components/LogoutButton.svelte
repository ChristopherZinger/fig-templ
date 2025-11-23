<script lang="ts">
  import { sessionTokenStore } from "../lib/stores/sessionTokenStore";
  import { sendToMainThread } from "../lib/utils/messages";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../lib/utils/plugin-api-endpoint";
  import { UiMsg } from "../lib/utils/shared/messages";
  import Button from "./Button.svelte";

  $: sessionToken = $sessionTokenStore;

  async function logout() {
    if (!sessionToken) {
      console.error("logout_requested_but_no_session_token");
      return;
    }

    sendToMainThread(UiMsg.Logout, null);

    try {
      // TODO: pass session token in header
      const response = await callTemplettoApi({
        action: TemplettoApiActions.Logout,
        body: {
          sessionToken,
        },
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

<Button variant="secondary" onClick={logout} isDisabled={!sessionToken}
  >Logout</Button
>
