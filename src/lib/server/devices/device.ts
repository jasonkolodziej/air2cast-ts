import {
	PersistentClient,
	ReceiverController,
	type ReceiverStatus
} from '@foxxmd/chromecast-client';
import type { PersistentClientOptions } from '@foxxmd/chromecast-client/dist/cjs/src/persistentClient';
import { Event, type Subscribable, AsyncEvent, type AsyncSubscribable, type Listener } from 'atvik';
import { HostAndPort, type Service } from 'tinkerhub-discovery';
import type { MDNSService } from 'tinkerhub-mdns';
import { ArpCall, type ArpDataService } from '$lib/server/arp/types';
import { MAC, type Mac } from '$lib/server/mac/MAC';
import { AbstractDestroyableService, serializeNonPOJOs } from '$lib/server/service/types';
import { ArpDiscovery } from '$lib/server/arp/discovery.server';
import type { DeviceConfig, Sps } from '../sps/types';
import { SPS } from '../sps/sps.server';
// import type { ReadonlyDevice } from '../../../hooks.client';

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
	readonly MacAddress?: Mac;
	Client: PersistentClient;
	DeviceId: String;
	Type: DeviceTypes;
	readonly Address: HostAndPort;
	readonly RecordDetails: RecordDetails;
	readonly ProgramConfig: DeviceConfig;
	readonly ProgramState: Sps;
}

export interface DeviceServiceSubscribable extends DeviceService {
	readonly onDevice: Subscribable<this, [Device]>;
	readonly onClient: Subscribable<this, [PersistentClient]>;
	readonly onReceiver: AsyncSubscribable<this, [ReceiverController.Receiver]>;
}

export class Device extends AbstractDestroyableService implements DeviceServiceSubscribable {
	protected beforeDestroy(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	// readonly id: string = 'device:service';
	protected readonly deviceEvent: Event<this, [Device]>;

	protected readonly clientEvent: Event<this, [PersistentClient]>;
	// protected readonly programEvent: AsyncSubscribable<this, [Sps]>;
	protected spsProgram?: SPS;
	protected spsState: Sps;
	protected readonly receiverEvent: AsyncEvent<this, [ReceiverController.Receiver]>;
	protected readonly macEvent: Event<this, [Mac]> = new Event(this);
	Receiver?: ReceiverController.Receiver;
	// readonly RecordDetails: RecordDetails;
	get onDevice(): Subscribable<this, [Device]> {
		return this.deviceEvent.subscribable;
	}
	get onClient(): Subscribable<this, [PersistentClient]> {
		return this.clientEvent.subscribable;
	}
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
		return this.DeviceId.toLowerCase() as string;
	}
	get RecordDetails(): RecordDetails {
		//return this.RecordDetails;
		return this.handleRecordDetails();
	}
	get Address() {
		return this.Record.addresses.at(0)!;
	}
	get ProgramConfig() {
		return this.toDeviceConfig();
	}
	get ProgramState() {
		return this.spsState;
	}
	/* *
	 *   End of Implementation
	 */

	constructor(service: MDNSService) {
		super('device');
		this.deviceEvent = new Event(this);
		this.clientEvent = new Event(this);
		this.clientEvent = new Event(this);
		this.receiverEvent = new AsyncEvent(this);

		this.Record = service;
		// this.obtainMac().then(
		//     val => this.withUpdate(val)

		// )
		this.onDevice.bind(this);
		const clientOptions = this.Address as PersistentClientOptions;
		this.Client = new PersistentClient(clientOptions);
		this.Client.connect()
			.then(() => this.obtainMacAsync())
			// .then(() => this.initProgram())
			.then(() => {
				this.Receiver = ReceiverController.createReceiver({
					client: this.Client
				});
			})
			.then(() => this.receiverEvent.emit(this.Receiver!))
			.then(() => this.deviceEvent.emit(this));
		this.logger.debug('Okay');
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
		this.logger.debug(`device has listeners? ${event.hasListeners}`);
		// this.logger.debug();
		// console.debug('event.emit');
		// event.emit(this);
	}

	serialize = () => serializeNonPOJOs(this.asDeviceService);

	private asyncMonitor(event: AsyncEvent<this, [Mac]>) {
		console.debug('mac has listeners', event.hasListeners);
		// console.debug('event.emit');
		// event.emit(this);
	}

	private toDeviceConfig(): DeviceConfig {
		return {
			name: this.RecordDetails.FriendlyName,
			airplay_device_id: this.MacAddress!._value.toString() as string,
			port: 7000,
			mdns_backend: 'avahi',
			output_backend: 'stdout',
			interpolation: 'auto'
		};
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
	/**
		# Example:
		```typescript
			a.onReceiver(async (r) => {
				const vol = (await r.getVolume()).unwrapAndThrow();
				console.debug('VOLUME', vol);
			});
		```
	*/
	get onReceiver(): AsyncSubscribable<this, [ReceiverController.Receiver]> {
		return this.receiverEvent.subscribable;
	}

	get onMac(): Subscribable<this, [Mac]> {
		return this.macEvent.subscribable;
	}

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

	private initProgram() {
		if (this.MacAddress !== undefined) {
			this.logger.debug('DeviceService.initProgram');
			this.spsProgram = new SPS(this.ProgramConfig);
			// this.programEvent.
			this.spsState = this.spsProgram.State;
			const un = this.spsProgram.onAvailable((s) => {
				this.spsState = s;
				// this.logger.debug('ONAVAIL', s);
			});
			this.spsProgram.onUnavailable((s) => this.onProgramUnavailable(s));
		}
	}

	private onProgramAvailable: Listener<unknown, [Sps]> = (data: Sps) => {
		console.debug('DeviceService.onProgramAvailable');
		// this.withMACUpdate(data.mac_address);
	};

	private onProgramUnavailable: Listener<unknown, [Sps]> = (data: Sps) => {
		this.spsState = data;
		console.log('DeviceService.onProgramUnavailable', data);
		// this.withMACUpdate(data.mac_address);
	};

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
				this.receiverEvent.emit(this.Receiver!);
				this.deviceEvent.emit(this); //* good!!
				return this;
			});
		}
		return this;
	}

	get asDeviceService() {
		if (this.MacAddress === undefined) {
			const ds = {
				Type: this.Type,
				id: this.id,
				DeviceId: this.DeviceId,
				// MacAddress: this.MacAddress,
				RecordDetails: this.RecordDetails,
				Address: this.Address,
				ProgramConfig: this.ProgramConfig,
				ProgramState: this.ProgramState
				// onDevice: this.deviceEvent.subscribable
				// Client: this.Client
			} as DeviceService;
			return ds;
		}
		const ds = {
			Type: this.Type,
			id: this.id,
			DeviceId: this.DeviceId,
			MacAddress: this.MacAddress,
			RecordDetails: this.RecordDetails,
			Address: this.Address,
			ProgramConfig: this.ProgramConfig,
			ProgramState: this.ProgramState
			// onDevice: this.deviceEvent.subscribable
			// Client: this.Client
		} as DeviceService;
		return ds;
	}

	protected reflectResolve(x: DeviceService): Device {
		console.debug('reflectResolve');
		// this.Client = x.Client;
		this.Record = x.Record;
		this.MacAddress = x.MacAddress ?? this.MacAddress;
		// if (this.Client.connected) {
		// 	this.Client.close();
		// }
		// this.Receiver?.dispose();
		// this.Client = new PersistentClient(this.Address as PersistentClientOptions);
		// this.Client.connect()
		// 	// .then(() => this.obtainMacAsync())
		// 	.then(() => {
		// 		this.Receiver = ReceiverController.createReceiver({
		// 			client: this.Client
		// 		});
		// 	})
		// 	.then(() => this.receiverEvent.emit(this.Receiver!));
		// .then(() => this.deviceEvent.emit(this));
		return this;
	}

	static promise(service: MDNSService): Promise<Device> {
		return new Promise<Device>((resolve) => {
			const d = new Device(service);
			d.onDevice((x) => resolve(x));
			// d.onDevice((x) => resolve(d.reflectResolve(x)));
		});
	}
}
