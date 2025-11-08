<script lang="ts">
  export let onClick: () => void;
  export let isDisabled: boolean = false;
  export let variant: "primary" | "secondary" = "primary";
  export let options: {
    fullWidth?: boolean;
  } = {
    fullWidth: false,
  };
</script>

<button
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  disabled={isDisabled}
  onclick={onClick}
  class:fullWidth={options.fullWidth}
>
  <slot />
</button>

<style>
  button {
    border-radius: 6px;
    border: none;
    outline: none;
    padding: 4px;
    text-align: center;
    cursor: pointer;

    transition-duration: 0.1s;
  }
  .primary {
    background-color: #0c8ce9;
  }
  .secondary {
    border: 1px solid gray;
    background-color: transparent;
    color: lightgray;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: lightgray;
    color: black;
  }
  .fullWidth {
    width: 100%;
  }
</style>
