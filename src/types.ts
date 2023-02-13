export interface RelayMetadataResponse {
	id: string;
	name: string;
	description: string;
	pubkey: string;
	supported_nips: number[];
	software: string;
	version: string;
}
