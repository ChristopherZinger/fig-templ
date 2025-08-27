<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Templetto</title>
</svelte:head>

{@render children?.()}
