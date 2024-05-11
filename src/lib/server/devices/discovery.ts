import { BasicServiceDiscovery } from "tinkerhub-discovery";
import { DeviceTypes, type DeviceService, type RecordDetails } from "$lib/server/devices/device";
import type { MDNSService } from "tinkerhub-mdns";
import { PersistentClient, ReceiverController } from "@foxxmd/chromecast-client";
import {AsyncEvent, Event, type Listener, type Subscribable} from "atvik";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { MAC, type Mac } from "$lib/server/mac/MAC";
import { ArpDiscovery } from "../arp/discovery.server";
import { ArpCall, type ArpDataService } from "../arp/types";

class DeviceDiscovery extends BasicServiceDiscovery<DeviceService> implements DeviceService {
    protected readonly deviceEvent: Event<this, [DeviceService]>;
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

        get onDevice(): Subscribable<this, [DeviceService]> {
            return this.deviceEvent.subscribable;
        }
    
        get onClient(): Subscribable<this, [PersistentClient]> {
            return this.clientEvent.subscribable;
        }
        /* *
        *   End of Implementation
        */

    constructor(service: MDNSService) {
        super('device:service:discovery')
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
        this.availableEvent.emit(this);

        this.Client.connect().then(
            () => {
                this.Receiver = ReceiverController.createReceiver({client: this.Client});
                // this.receiverEvent.emit(this.Receiver);
                this.updateService(this);
            }
        );
        this.obtainMacAsync();
    }

    private get Address() {
            return this.Record.addresses.at(0)!
    }

    private handleRecordDetails() {
        return {
            Id: this.Record.data.get('id') as String,
            ManufacturerDetails: this.Record.data.get('md') as String,
            FriendlyName: this.Record.data.get('fn') as String,
        } as RecordDetails;
    }

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
    async obtainMacAsync() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new ArpDiscovery(ArpCall.NAMED, someHost);
        await arp.onAvailable.once().then(([id]) => this.arpListener(id))
        // const mac: MAC = (await arp.onUpdate.once().then(([id, val]) => val.mac_address))
        // this.withMACUpdate(mac);
    }

    withMACUpdate:Listener<this, [MAC]> = (mac: MAC) => {
        console.debug('DeviceService.withMACUpdate');
        this.withUpdate(mac);
        // this.macEvent.emit(mac);
    }

    private arpListener:Listener<unknown, [ArpDataService]> = (data: ArpDataService) => {
        console.debug('DeviceService.arpListener');
        this.withMACUpdate(data.mac_address);
    }

    withUpdate(someSubscribable: MDNSService | MAC) {
        console.debug('DeviceService.onUpdate');
        if(someSubscribable instanceof MAC) { // * Mac
        // if('_value' in someSubscribable) {
            console.debug('Mac update')
            this.MacAddress = someSubscribable;
            this.updateService(this);
            // this.deviceEvent.emit(this);
        }
        if('name' in someSubscribable) { // * MDNSService
            this.Record = someSubscribable;
            // this.deviceEvent.emit(this);
            this.updateService(this);
        }
    }

} /** End of DeviceDiscovery */