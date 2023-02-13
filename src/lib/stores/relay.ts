import {
	SimplePool,
	type Relay,
	type Filter,
	type SubscriptionOptions,
	type Event
} from 'nostr-tools';
import { derived, writable } from 'svelte/store';
import type { RelayMetadataResponse } from '../../types';
import { keyBy, uniq } from 'lodash';

const defaultRelays = ['wss://nostr.wine', 'wss://relay.f7z.io'];

const createRelayPoolStore = () => {
	const { subscribe, set, update } = writable<Relay[]>([]);
	const pool = new SimplePool();

	return {
		subscribe,
		init: async () => {
			const relays = await Promise.all(defaultRelays.map((d) => pool.ensureRelay(d)));
			relays.map((r) =>
				fetch(r.url.replace('wss', 'https'), {
					mode: 'cors',
					credentials: 'omit',
					headers: { accept: 'application/nostr+json' }
				})
					.then((r) => r.json())
					.then(console.log)
			);
			set(relays);
		},
		list: async (filters: Filter[], opts?: SubscriptionOptions) => {
			return pool.list(defaultRelays, filters, opts);
		},
		get: async (filter: Filter, opts?: SubscriptionOptions) =>
			pool.get(defaultRelays, filter, opts),
		publish: async (event: Event) => {
			const pubs = pool.publish(defaultRelays, event);
			pubs.map((p) => p.on('ok', () => console.log('Sent')));
		}
	};
};

const relayPool = createRelayPoolStore();
export default relayPool;

export const relayMetadata = derived<typeof relayPool, Record<string, RelayMetadataResponse>>(
	relayPool,
	($relayPool, set) => {
		const urls = $relayPool.map((r) => r.url.replace('wss://', '').replace('ws://', ''));
		const metadataP = urls.map(async (url) => {
			const response = await fetch(url, {
				mode: 'cors',
				credentials: 'omit',
				headers: { accept: 'application/nostr+json' }
			});
			if (!response.ok) return;
			return response.json() as Promise<RelayMetadataResponse>;
		});
		Promise.all(metadataP).then((infos) => {
			set(keyBy(uniq(infos) as RelayMetadataResponse[], 'id'));
		});
	}
);
