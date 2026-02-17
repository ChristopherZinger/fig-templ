<script lang="ts">
  export let label: string;
  export let checked: boolean;
  export let onChange: (v: boolean) => void;
</script>

<label class="checkbox">
  <div>
    {label}
  </div>

  <input type="checkbox" {checked} on:change={() => onChange(checked)} />
</label>

<style>
  .checkbox {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: space-between;
    cursor: pointer;
  }
</style>
