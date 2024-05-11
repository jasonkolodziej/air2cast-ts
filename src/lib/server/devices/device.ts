import { PersistentClient, ReceiverController } from "@foxxmd/chromecast-client";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { Event, type Subscribable, AsyncEvent, type AsyncSubscribable, type Listener } from "atvik";
import { BasicServiceDiscovery, type Service } from "tinkerhub-discovery";
import type { MDNSService } from "tinkerhub-mdns";
import { ArpCall } from "$lib/server/arp/types";
import { MAC, type Mac } from "$lib/server/mac/MAC";
import { AbstractDestroyable } from "$lib/server/service/types";
import { ArpDiscovery } from "$lib/server/arp/discovery.server";

interface RecordDetails {
    Id: String; // m.data.get('id') as string,
    ManufacturerDetails: String;// m.data.get('md') as string,
    FriendlyName: String; //m.data.get('fn') as string,
}

export type DeviceType = keyof typeof DeviceTypes;

export enum DeviceTypes {
    TV = 'tv',
    GROUP = 'group',
    SPEAKER = 'speaker',
    UNKNOWN = ''
}

export interface DeviceServicePub extends Service {
    Record: MDNSService;
    MacAddress?: Mac;
    Client: PersistentClient;
    DeviceId: String;
    Type: DeviceTypes;
    readonly onDevice: Subscribable<this, [DeviceServicePub]>;
    readonly onClient: Subscribable<this, [PersistentClient]>;
}

export class Device extends AbstractDestroyable implements DeviceServicePub {
    protected beforeDestroy(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    readonly id: string = 'device:service';
    protected readonly deviceEvent: Event<this, [DeviceServicePub]>;
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
        return this.deviceType
    }
    get DeviceId() {
        return this.RecordDetails.Id;
    }
    get onDevice(): Subscribable<this, [DeviceServicePub]> {
        return this.deviceEvent.subscribable;
    }

    get onClient(): Subscribable<this, [PersistentClient]> {
        return this.clientEvent.subscribable;
    }
    /* *
    *   End of Implementation
    */

    constructor(service: MDNSService) {
        super('device:service')
        this.deviceEvent = new Event(this);
        this.clientEvent = new Event(this);
        this.receiverEvent = new AsyncEvent(this);
        this.Record = service;
        // this.obtainMac().then(
        //     val => this.withUpdate(val)

        // )
        this.RecordDetails = this.handleRecordDetails();
        const clientOptions = this.Address as PersistentClientOptions;
        this.Client = new PersistentClient(clientOptions);
        this.Client.connect().then(
            () => {
                this.Receiver = ReceiverController.createReceiver({client: this.Client});
                this.receiverEvent.emit(this.Receiver);
            }
        );
        this.deviceEvent.emit(this);
        this.obtainMacAsync();
    }
    /* *
    *   Private functions   */
    private handleRecordDetails() {
        return {
            Id: this.Record.data.get('id') as String,
            ManufacturerDetails: this.Record.data.get('md') as String,
            FriendlyName: this.Record.data.get('fn') as String,
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
        return DeviceTypes.UNKNOWN
    }

    private get Address() {
        return this.Record.addresses.at(0)!
    }

    get onReceiver(): AsyncSubscribable<this, [ReceiverController.Receiver]> {
        return this.receiverEvent.subscribable;
    }

    get onMac(): Subscribable<this, [Mac]> {
        return this.macEvent.subscribable;
    }

    get onAvailable() {
		return this.onDevice;
	}

	get onUnavailable() {
		return this.onDevice.subscribe;
	}

	get onUpdate() {
		return this.onDevice.subscribe;
	}
    
    obtainMac() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new ArpDiscovery(ArpCall.NAMED, someHost)
        const handle = arp.onAvailable((a) => {
            this.withMACUpdate(a.mac_address);
        });
        // return mac;
    }

    async obtainMacAsync() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new ArpDiscovery(ArpCall.NAMED, someHost);
        const mac: MAC = (await arp.onUpdate.once().then(([id, val]) => val.mac_address))
        this.withMACUpdate(mac);
    }

    withMACUpdate:Listener<this, [MAC]> = (mac: MAC) => {
        console.debug('DeviceService.withMACUpdate');
        this.withUpdate(mac);
        // this.macEvent.emit(mac);
    }

    withUpdate(someSubscribable: MDNSService | MAC) {
        console.debug('DeviceService.onUpdate');
        if(someSubscribable instanceof MAC) { // * Mac
        // if('_value' in someSubscribable) {
            console.debug('Mac update')
            this.MacAddress = someSubscribable;
            this.deviceEvent.emit(this);
        }
        if('name' in someSubscribable) { // * MDNSService
            this.Record = someSubscribable;
            this.deviceEvent.emit(this);
        }
    }
}


class DeviceDiscovery extends BasicServiceDiscovery<DeviceServicePub> implements DeviceServicePub {
    readonly id: string = 'device:service';
    protected readonly deviceEvent: Event<this, [DeviceServicePub]>;
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
        return this.deviceType
    }
    get DeviceId() {
        return this.RecordDetails.Id;
    }
    get onDevice(): Subscribable<this, [DeviceServicePub]> {
        return this.deviceEvent.subscribable;
    }

    get onClient(): Subscribable<this, [PersistentClient]> {
        return this.clientEvent.subscribable;
    }
    /* *
    *   End of Implementation
    */
    constructor(service: MDNSService) {
        super('device:service')
        this.deviceEvent = new Event(this);
        this.clientEvent = new Event(this);
        this.receiverEvent = new AsyncEvent(this);
        this.Record = service;
        // this.obtainMac().then(
        //     val => this.withUpdate(val)

        // )
        this.RecordDetails = this.handleRecordDetails();
        const clientOptions = this.Address as PersistentClientOptions;
        this.Client = new PersistentClient(clientOptions);
        this.Client.connect().then(
            () => {
                this.Receiver = ReceiverController.createReceiver({client: this.Client});
                this.receiverEvent.emit(this.Receiver);
            }
        );
        this.deviceEvent.emit(this);
        this.obtainMacAsync();
    }
    /* *
    *   Private functions   */
    private handleRecordDetails() {
        return {
            Id: this.Record.data.get('id') as String,
            ManufacturerDetails: this.Record.data.get('md') as String,
            FriendlyName: this.Record.data.get('fn') as String,
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

    /* *
    *   private getters     */
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
        return DeviceTypes.UNKNOWN
    }

    private get Address() {
        return this.Record.addresses.at(0)!
    }
    /* *
    *   End of private getters  */
    /* *
    *   Protected functions  */
    protected updateService(service: DeviceServicePub): DeviceServicePub | null {
        return super.updateService(service);
    }

    protected setServices(available: Iterable<DeviceServicePub>): void {
        return super.setServices(available);
    }

    protected removeService(service: string | DeviceServicePub): DeviceServicePub | null {
        return super.removeService(service);
    }
    /* *
    *   End of protected functions  */
    /* *
    *   Public functions  */
    obtainMac() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new ArpDiscovery(ArpCall.NAMED, someHost)
        const handle = arp.onAvailable((a) => {
            this.withMACUpdate(a.mac_address);
        });
        // return mac;
    }

    async obtainMacAsync() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new ArpDiscovery(ArpCall.NAMED, someHost);
        const mac: MAC = (await arp.onUpdate.once().then(([id, val]) => val.mac_address))
        this.withMACUpdate(mac);
    }

    withMACUpdate:Listener<this, [MAC]> = (mac: MAC) => {
        console.debug('DeviceService.withMACUpdate');
        this.withUpdate(mac);
        // this.macEvent.emit(mac);
    }

    withUpdate(someSubscribable: MDNSService | MAC) {
        console.debug('DeviceService.onUpdate');
        if(someSubscribable instanceof MAC) { // * Mac
        // if('_value' in someSubscribable) {
            console.debug('Mac update')
            this.MacAddress = someSubscribable;
            this.deviceEvent.emit(this);
        }
        if('name' in someSubscribable) { // * MDNSService
            this.Record = someSubscribable;
            this.deviceEvent.emit(this);
        }
    }
    /* *
    *   End of public functions  */
    /* *
    *   Public getters  */

    get onReceiver(): AsyncSubscribable<this, [ReceiverController.Receiver]> {
        return this.receiverEvent.subscribable;
    }

    get onMac(): Subscribable<this, [Mac]> {
        return this.macEvent.subscribable;
    }
    /* *
    *   end of Public getters  */
} /** End of DeviceDiscovery */