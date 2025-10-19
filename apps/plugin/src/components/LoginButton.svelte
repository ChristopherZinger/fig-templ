<script lang="ts">
  import { URLS } from "../lib/utils/shared/urls";

  async function goToLogin() {
    const baseUrl = URLS.webapp;
    const url = `${baseUrl}/plugin/get-pkce-keys`;
    location.href = url;
  }
</script>

<button onclick={goToLogin}>Login</button>
