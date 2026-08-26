<script lang="ts">
  import { chartStore } from "../../stores/chart-store";

  export let id: string;
  export let value: string;
  export let onChange: (value: string) => void;
</script>

<input
  {id}
  type="color"
  {value}
  onchange={(e) => {
    onChange(e.currentTarget.value);
  }}
/>
<input type="text" {value} onchange={(e) => {}} />

<style>
  input[type="color"] {
    outline: none;
    border: none;
    padding: 0;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
  }

  input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  input::-moz-color-swatch {
    border: none;
    border-radius: 50%;
  }
</style>
