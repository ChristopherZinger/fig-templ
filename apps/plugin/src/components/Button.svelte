<script lang="ts">
  export let isActive: boolean = false;
  export let onClick: () => void;
  export let isDisabled: boolean = false;
  export let variant: "primary" | "secondary" | "naked" = "primary";
  export let options: {
    fullWidth?: boolean;
  } = {
    fullWidth: false,
  };
  export let style: Record<string, string> = {};
</script>

<button
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  class:naked={variant === "naked"}
  disabled={isDisabled}
  class:active={isActive}
  onclick={onClick}
  class:fullWidth={options.fullWidth}
  style={Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")}
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

  .naked {
    background-color: transparent;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
  }
  .naked.active {
    text-decoration: underline;
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
