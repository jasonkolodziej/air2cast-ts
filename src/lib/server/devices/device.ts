import { PersistentClient, ReceiverController } from '@foxxmd/chromecast-client';
import type { PersistentClientOptions } from '@foxxmd/chromecast-client/dist/cjs/src/persistentClient';
import { Event, type Subscribable, AsyncEvent, type AsyncSubscribable, type Listener } from 'atvik';
import { HostAndPort, type Service } from 'tinkerhub-discovery';
import type { MDNSService } from 'tinkerhub-mdns';
import { ArpCall, type ArpDataService } from '$lib/server/arp/types';
import { MAC, type Mac } from '$lib/server/mac/MAC';
import { AbstractDestroyableService } from '$lib/server/service/types';
import { ArpDiscovery } from '$lib/server/arp/discovery.server';

export interface RecordDetails {
	Id: String; // m.data.get('id') as string,
	ManufacturerDetails: String; // m.data.get('md') as string,
	FriendlyName: String; //m.data.get('fn') as string,
}

export type DeviceType = keyof typeof DeviceTypes;

export enum DeviceTypes {
	TV = 'tv',
	GROUP = 'group',
	SPEAKER = 'speaker',
	UNKNOWN = ''
}

export interface DeviceService extends Service {
	Record: MDNSService;
	MacAddress?: Mac;
	Client: PersistentClient;
	DeviceId: String;
	Type: DeviceTypes;
	readonly onDevice: Subscribable<this, [Device]>;
	readonly onClient: Subscribable<this, [PersistentClient]>;
	readonly Address: HostAndPort;
}

export class Device extends AbstractDestroyableService implements DeviceService {
	protected beforeDestroy(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	// readonly id: string = 'device:service';
	protected readonly deviceEvent: Event<this, [Device]>;
	protected readonly clientEvent: Event<this, [PersistentClient]>;
	protected readonly receiverEvent: AsyncEvent<this, [ReceiverController.Receiver]>;
	protected readonly macEvent: Event<this, [Mac]> = new Event(this);
	Receiver?: ReceiverController.Receiver;
	readonly RecordDetails: RecordDetails;

	/* *
	 * Implement DeviceServicePub interface
	 */
	Record: MDNSService;
	MacAddress?: Mac;
	Client: PersistentClient;
	get Type() {
		return this.deviceType;
	}
	get DeviceId() {
		return this.RecordDetails.Id;
	}
	get id() {
		return this.DeviceId as string;
	}
	get onDevice(): Subscribable<this, [Device]> {
		return this.deviceEvent.subscribable;
	}

	get onClient(): Subscribable<this, [PersistentClient]> {
		return this.clientEvent.subscribable;
	}
	get Address() {
		return this.Record.addresses.at(0)!;
	}
	/* *
	 *   End of Implementation
	 */

	constructor(service: MDNSService) {
		super('device:service');
		this.deviceEvent = new Event(this);
		this.clientEvent = new Event(this);
		this.receiverEvent = new AsyncEvent(this);
		this.Record = service;
		// this.obtainMac().then(
		//     val => this.withUpdate(val)

		// )
		this.RecordDetails = this.handleRecordDetails();
		this.onDevice.bind(this);
		const clientOptions = this.Address as PersistentClientOptions;
		this.Client = new PersistentClient(clientOptions);
		// this.deviceEvent.emit(this);
		// this.Client.connect().then(() => {
		// 	this.Receiver = ReceiverController.createReceiver({ client: this.Client });
		// 	this.receiverEvent.emit(this.Receiver);
		// 	// this.deviceEvent.emit(this); //* good!!
		// });
		// this.obtainMacAsync();
		this.Client.connect()
			.then(() => this.obtainMacAsync())
			.then(() => {
				this.Receiver = ReceiverController.createReceiver({
					client: this.Client
				});
				this.receiverEvent.emit(this.Receiver);
				this.deviceEvent.emit(this); //* good!!
			});
		// this.obtainMacAsync();
	}

	/* *
	 *   Private functions   */
	private handleRecordDetails() {
		return {
			Id: this.Record.data.get('id') as String,
			ManufacturerDetails: this.Record.data.get('md') as String,
			FriendlyName: this.Record.data.get('fn') as String
		} as RecordDetails;
	}

	private monitor(event: Event<this, [MDNSService, Mac?]>) {
		console.debug('device has listeners?', event.hasListeners);
		// console.debug('event.emit');
		// event.emit(this);
	}

	private asyncMonitor(event: AsyncEvent<this, [Mac]>) {
		console.debug('mac has listeners', event.hasListeners);
		// console.debug('event.emit');
		// event.emit(this);
	}
	/* *
	 *   End of private functions    */

	private get deviceType(): DeviceTypes {
		if (this.Record.data.get('md')?.toString().toLowerCase().includes(DeviceTypes.GROUP)) {
			return DeviceTypes.GROUP;
		}
		if (this.Record.data.get('fn')?.toString().toLowerCase().includes(DeviceTypes.TV)) {
			return DeviceTypes.TV;
		}
		if (this.Record.data.get('fn')?.toString().toLowerCase().includes(DeviceTypes.SPEAKER)) {
			return DeviceTypes.SPEAKER;
		}
		return DeviceTypes.UNKNOWN;
	}

	get onReceiver(): AsyncSubscribable<this, [ReceiverController.Receiver]> {
		return this.receiverEvent.subscribable;
	}

	get onMac(): Subscribable<this, [Mac]> {
		return this.macEvent.subscribable;
	}

	// protected get availableEvent() {
	//     return this.deviceEvent
	// }
	// protected get unavailableEvent() {
	//     return this.deviceEvent
	// }
	// protected get updateEvent() {
	//     return this.deviceEvent
	// }

	obtainMac() {
		const someHost = this.Record.addresses.at(0)?.host;
		if (someHost === undefined) {
			this.logAndEmitError(Error('host not defined'));
			return;
		}
		const arp = new ArpDiscovery(ArpCall.NAMED, someHost);
		// const handle = arp.onAvailable((a) => {
		//     this.withMACUpdate(a.mac_address);
		// });
		const handle = arp.onAvailable(this.arpListener);
		// return mac;
	}

	async obtainMacAsync() {
		const someHost = this.Record.addresses.at(0)?.host;
		if (someHost === undefined) {
			this.logAndEmitError(Error('host not defined'));
			return;
		}
		const arp = new ArpDiscovery(ArpCall.NAMED, someHost);
		await arp.onAvailable.once().then(([id]) => this.arpListener(id));
		// const mac: MAC = (await arp.onUpdate.once().then(([id, val]) => val.mac_address))
		// this.withMACUpdate(mac);
	}

	withMACUpdate: Listener<this, [MAC]> = (mac: MAC) => {
		// console.debug('DeviceService.withMACUpdate');
		this.withUpdate(mac);
		// this.macEvent.emit(mac);
	};

	private arpListener: Listener<unknown, [ArpDataService]> = (data: ArpDataService) => {
		// console.debug('DeviceService.arpListener');
		this.withMACUpdate(data.mac_address);
	};

	withUpdate(someSubscribable: MDNSService | MAC) {
		// console.debug('DeviceService.onUpdate');
		if (someSubscribable instanceof MAC) {
			// * Mac
			// if('_value' in someSubscribable) {
			// console.debug('Mac update')
			this.MacAddress = someSubscribable;
			this.deviceEvent.emit(this);
		}
		if ('name' in someSubscribable) {
			// * MDNSService
			this.Record = someSubscribable;
			this.deviceEvent.emit(this);
		}
	}

	withUpdateAsync(someSubscribable: MDNSService | MAC): Device | Promise<Device> {
		console.debug('DeviceService.onUpdate');
		if (someSubscribable instanceof MAC) {
			// * Mac
			// if('_value' in someSubscribable) {
			console.debug('Mac update');
			this.MacAddress = someSubscribable;
			this.deviceEvent.emit(this);
		}
		if ('name' in someSubscribable) {
			// * MDNSService
			// * First disconnect
			this.Client.close();
			this.Record = someSubscribable;
			this.Client = new PersistentClient(this.Address as PersistentClientOptions);
			return this.Client.connect().then<Device>(() => {
				this.Receiver = ReceiverController.createReceiver({
					client: this.Client
				});
				this.receiverEvent.emit(this.Receiver);
				this.deviceEvent.emit(this); //* good!!
				return this;
			});
		}
		return this;
	}

	static promise(service: MDNSService): Promise<Device> {
		return new Promise<Device>((resolve) => {
			const d = new Device(service);
			d.onDevice((x) => resolve(x));
		});
	}
}
