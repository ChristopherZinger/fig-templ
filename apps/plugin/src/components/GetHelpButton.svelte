<script lang="ts">
  import { onMount } from "svelte";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../lib/utils/plugin-api-endpoint";
  import Button from "./Button.svelte";

  const PLUGIN_VERSION = process.env.PLUGIN_VERSION;

  let webappUrl: URL | undefined | null;
  let latestVersion: string | undefined | null;
  onMount(async () => {
    try {
      const info = await callTemplettoApi({
        action: TemplettoApiActions.getPluginInfo,
      });
      if (!info.ok) {
        console.error("failed_to_get_plugin_info", info);
        webappUrl = null;
        latestVersion = null;
        return;
      }
      const data = await info.json();
      if ("webappUrl" in data && data.webappUrl) {
        webappUrl = new URL(data.webappUrl);
      }
      if ("version" in data && data.version) {
        latestVersion = data.version;
      }
    } catch (error) {
      console.error("failed_to_get_plugin_info", error);
      webappUrl = null;
      latestVersion = null;
    }
  });
</script>

<div class="container">
  {#if latestVersion !== undefined && latestVersion !== PLUGIN_VERSION}
    <div class="version-outdated">
      version is outdated. Please update to the latest version.
    </div>
  {/if}
  <div>
    Find out more about
    {#if webappUrl}
      <Button
        variant="naked"
        style={{
          color: "lightblue",
          "text-decoration": "underline",
          "font-size": "10px",
        }}
        onClick={() => {
          if (webappUrl) {
            open(webappUrl.toString());
          } else {
            console.log("webappUrl is null");
          }
        }}
      >
        {webappUrl.hostname}
      </Button>
    {:else}
      templetto online.
    {/if}
  </div>
</div>

<style>
  .container {
    font-size: 10px;
    color: lightgray;
    text-align: center;
    margin: 10px 0;
  }
  .version-outdated {
    color: red;
    font-size: 10px;
    margin: 10px 0;
    color: white;
    background-color: red;
  }
</style>
