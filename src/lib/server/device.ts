import { type Listener, type Subscribable, AsyncEvent, Event } from "atvik";
import type { MDNSService } from "tinkerhub-mdns";
import { AbstractDestroyable } from "./service/type";
import { Arp, ArpCall } from "./arp/arp";
import { MAC, type Mac } from "./mac/MAC";

interface DeviceServicePub extends Service {
    Record: MDNSService;
    MacAddress?: Mac;
    readonly onDevice: Subscribable<this, [DeviceServicePub]>
}

class Device extends AbstractDestroyable implements DeviceServicePub {
    protected beforeDestroy(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    readonly id: string = 'device:service';
    Record: MDNSService;
    MacAddress?: Mac;
    protected readonly deviceEvent: Event<this, [DeviceServicePub]>;
    protected readonly macEvent: Event<this, [Mac]> = new Event(this);


    constructor(service: MDNSService) {
        super('device:service')
        this.Record = service;
        this.deviceEvent = new Event(this);
        this.deviceEvent.emit(this);
        // this.obtainMac().then(
        //     val => this.withUpdate(val)

        // )
        this.obtainMacAsync();
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

    // get onDevice(): Subscribable<this, [MDNSService, Mac]> {
    //     return this.deviceEvent.subscribable;
    // }
    get onDevice(): Subscribable<this, [DeviceServicePub]> {
        return this.deviceEvent.subscribable;
    }

    get onMac(): Subscribable<this, [Mac]> {
        return this.macEvent.subscribable;
    }

    obtainMac() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new Arp(ArpCall.NAMED, someHost);
        // let mac: MAC = (await availEvent.once().then(([calling, [id, val]]) => val.mac_address))
        const handle = arp.onAvailable((_, [id, arp]) => {
            // console.log(arp);
            this.withMACUpdate(arp.mac_address);
        });
        // return mac;
    }

    async obtainMacAsync() {
        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            this.logAndEmitError(Error('host not defined'))
            return;
        }
        const arp = new Arp(ArpCall.NAMED, someHost);
        const mac: MAC = (await arp.once().then(([calling, [id, val]]) => val.mac_address))
            // const handle = arp.onAvailable((_, [id, arp]) => {
                // console.log(arp);
        this.withMACUpdate(mac);
    }

    withMACUpdate:Listener<this, [MAC]> = (mac: MAC) => {
        console.debug('DeviceService.withMACUpdate');
        this.withUpdate(mac);
        // this.macEvent.emit(mac);
    }

    withUpdate(someSubscribable: MDNSService | MAC) {
        console.debug('DeviceService.onUpdate');
        if(someSubscribable instanceof MAC) { // Mac
        // if('_value' in someSubscribable) {
            console.debug('Mac update')
            this.MacAddress = someSubscribable;
            this.deviceEvent.emit(this);
            // this.macEvent.emit(this.MacAddress);
            // this.deviceEvent.asyncEmit(this);
            // this.deviceEvent.emit(this.Record, this.MacAddress);
        }
        if('name' in someSubscribable) { // MDNSService
            this.Record = someSubscribable;
            this.deviceEvent.emit(this);
            // this.deviceEvent.emit(this);
            // this.deviceEvent.emit(this.Record, this.MacAddress!);
        }
    }

    get onAvailable() {
		return this.onDevice.subscribe;
	}

	get onUnavailable() {
		return this.onDevice.subscribe;
	}

	get onUpdate() {
		return this.onDevice.subscribe;
	}
}


const mapped = discover.map({
    create: service => new Device(service),
    update: ({ service, previousService, previousMappedService }) => {
        /*
         * `service` points to the updated service to map
         * `previousService` is the previous version of the service to map
         * `previousMappedService` is what `create` or `update` mapped to previously
         * 
         * Either:
         * 
         * 1) Return null/undefined to remove the service
         * 2) Return the previously mapped service
         * 3) Return a new mapped service
         * 
         */
        (previousMappedService as DeviceService).withUpdate(service);
        return previousMappedService;
      },
      destroy: mappedService => mappedService.destroy() /* perform some destruction of the mapped service */
});

mapped.onAvailable((device) => {
    // const dev = await device.onDevice.once()
    device.onDevice((listen) => {console.debug(listen)})
    // device.onMac((maybeMac) => {console.debug(maybeMac)})
})

mapped.onUpdate((device) => {
    // const dev = await device.onDevice.once()
    device.onDevice((listen) => {console.debug(listen)})
})