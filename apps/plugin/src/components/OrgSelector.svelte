<script lang="ts">
  export let orgInfos: { id: string; name: string }[] = [];
  export let selectedOrgId: string | undefined;
  export let onSelect: (orgId: string) => void;
</script>

<select
  onchange={(ev) => {
    if (
      ev.target &&
      "value" in ev.target &&
      typeof ev.target.value === "string"
    ) {
      onSelect(ev.target.value);
    }
  }}
>
  {#each orgInfos as org}
    <option selected={selectedOrgId === org.id} value={org.id}
      >{org.name}</option
    >
  {/each}
</select>

<style>
  select {
    outline: none;
    border: none;
    padding: 4px;
    border-radius: 4px;
  }
</style>
