<script lang="ts">
  import _ from "lodash";

  export let htmlBuildLogs: {
    severity: "error" | "warning" | "info";
    message: string;
  }[] = [];

  $: buildLogs = [
    ...htmlBuildLogs.filter((log) => log.severity === "warning"),
    ...htmlBuildLogs.filter((log) => log.severity === "error"),
    ...htmlBuildLogs.filter((log) => log.severity === "info"),
  ];
</script>

<div class="build-logs-container">
  {#if buildLogs.length > 0}
    {#each buildLogs as log}
      <div class={`build-log ${log.severity}`}>
        <div class="build-log-severity">{log.severity}</div>
        <div class="build-log-message">{log.message}</div>
      </div>
    {/each}
  {:else}
    <div class={`build-log info`}>
      <div class="build-log-severity">Info</div>
      <div class="build-log-message">No warnings.</div>
    </div>
  {/if}
</div>

<style>
  .build-logs-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
    padding: 12px;
  }

  .build-log {
    display: flex;
    gap: 8px;
    padding: 4px;
    margin: 2px;
    border: 1px solid black;
    border-radius: 4px;
  }

  .build-log-severity {
    font-weight: bold;
    text-transform: uppercase;
  }

  .build-logs-message {
    text-transform: capitalize;
  }

  .error {
    color: red;
    border-color: red;
    background-color: rgba(255, 0, 0, 0.1);
  }

  .warning {
    color: orange;
    border-color: orange;
    background-color: rgba(255, 165, 0, 0.1);
  }

  .info {
    color: lightblue;
    border-color: lightblue;
    background-color: rgba(0, 128, 255, 0.1);
  }
</style>
