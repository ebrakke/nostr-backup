<script lang="ts">
	import '@skeletonlabs/skeleton/styles/all.css';
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import relays from '../lib/stores/relay';
</script>

{#await relays.init()}
	<p>Initializing...</p>
{:then}
	<div class="container">
		<slot />
	</div>
{/await}
