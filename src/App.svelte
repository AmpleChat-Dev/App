<script>
	import { authenticated } from "./stores/store"
	import Authentication from "./Authentication.svelte"
	import Home from "./Home.svelte"
</script>
<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

{#if !$authenticated}
<Authentication />
{:else}
<Home />
{/if}

<style>
:root {
	--message-other-content: 'Other: '
}
</style>
