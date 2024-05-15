import type { Subscribable } from 'atvik';
import type { Service, ServicePublisher } from 'tinkerhub-discovery';
import type { MAC } from '$lib/server/mac/MAC';

export interface ArpDataEntry {
	hostname: String;
	ip_address: String;
	mac_address: MAC;
	interface_name: String;
	scope: String | String[];
	hw_type: String;
}

export interface ArpDataService extends ArpDataEntry, Service {
	readonly CallType?: ArpCall;
}

// export type ArpSubscriber = Subscribable<Arp, [EventCall, [ String, ArpDataEntry ]]>;

export interface ArpServicePublisher extends ServicePublisher {
	onEvent<T = EventCall>(calling: T): Subscribable<this, [typeof calling, [String, ArpDataEntry]]>;
	readonly onEvents: Subscribable<this, [EventCall, [String, ArpDataEntry]]>;
	// readonly onUnavailable: Subscribable<this, [ ArpDataEntry ]>;
}

export type ArpCallType = keyof typeof ArpCall;

export enum ArpCall {
	ALL = '-a',
	NAMED = '-n'
}
export enum EventCall {
	Available,
	Unavailable,
	Update,
	Destroy
}
export type EventCallType = keyof typeof EventCall;
