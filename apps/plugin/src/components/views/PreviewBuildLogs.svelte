<script lang="ts">
  export let htmlBuildLogs: {
    severity: "error" | "warning" | "info";
    message: string;
  }[] = [];

  const warnings = htmlBuildLogs.filter((log) => log.severity === "warning");
  const errors = htmlBuildLogs.filter((log) => log.severity === "error");
  const infos = htmlBuildLogs.filter((log) => log.severity === "info");

  const buildLogs = [...errors, ...warnings, ...infos];
</script>

<div class="build-logs-container">
  {#each buildLogs as log}
    <div class={`build-log ${log.severity}`}>
      <div class="build-log-severity">{log.severity}</div>
      <div class="build-log-message">{log.message}</div>
    </div>
  {/each}
</div>

<style>
  .build-logs-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
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
