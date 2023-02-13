<script lang="ts">
	import { nip19 } from 'nostr-tools';
	import relays, { relayMetadata } from '../lib/stores/relay';

	let publicKey: string;
	let privateKey: string;

	const onDownloadNotes = async () => {
		const pk = nip19.decode(publicKey);
		const events = await relays.list([{ kinds: [1], authors: [pk.data as string] }]);
		saveAsFile(JSON.stringify(events), 'notes.json');
	};

	const onDownloadMetadata = async () => {
		const pk = nip19.decode(publicKey);
		const events = await relays.list([{ kinds: [0], authors: [pk.data as string] }]);
		console.log(JSON.parse(events[0].content));
	};

	const saveAsFile = (text: string, fileName: string) => {
		const a = document.createElement('a');
		a.style.display = 'none';
		document.body.appendChild(a);

		const blob = new Blob([text], { type: 'text/plain' });
		a.href = URL.createObjectURL(blob);
		a.download = fileName;
		a.click();
		document.body.removeChild(a);
	};
</script>

<h1 class="prose">NOSTR Backup</h1>
<p class="prose">Query a list of relays for all your data and download it as a JSON file.</p>

<div class="m-2">
	<label for="pk" class="label">
		<span>Public Key</span>
		<input class="input" name="pk" bind:value={publicKey} />
	</label>
	<label class="label" for="sk">
		<span>Private Key</span>
		<input class="input" name="sk" bind:value={privateKey} />
	</label>
</div>

<dl class="list-dl">
	{#each $relays as relay (relay.url)}
		<div>
			<span class="badge bg-primary-500" class:bg-error-500={relay.status === 0} />
			<span class="flex-auto">
				<dt>{relay.url}</dt>
				<dt>{$relayMetadata[relay.url].name}</dt>
			</span>
		</div>
	{/each}
</dl>

<div class="flex justify-between mx-4">
	<button class="btn btn-sm variant-filled-primary" on:click={onDownloadMetadata}
		>Download Notes</button
	>
	<button class="btn btn-sm variant-filled-secondary">Download Messages</button>
</div>
