<script lang="ts">
  import { URLS } from "../lib/utils/shared/urls";
  import Button from "./Button.svelte";

  async function goToLogin() {
    const baseUrl = URLS.webapp;
    const url = `${baseUrl}/plugin/get-pkce-keys`;
    location.href = url;
  }
</script>

<Button onClick={goToLogin}>Login</Button>
