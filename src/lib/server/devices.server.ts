import { MDNSServiceDiscovery, type MDNSDiscoveryOptions, type MDNSService } from "tinkerhub-mdns";
import { DeviceType, DeviceTypes, ToDeviceRecord, type DeviceRecord } from "./mdns.server";
import { PersistentClient, ReceiverController } from "@foxxmd/chromecast-client";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { arpDevice, arpAll, type ArpData, ArpDataCachePOJO } from "./arp.server";
import { mdnsServiceOpt } from "./chromecastHandler.server";

export const serializeNonPOJOs = (value: object | null) => {
    return structuredClone(value)
};
interface Serializable<T> {
    /**
     * serialize(value: T | null): object    */
    serialize?(value: T | null): T | null;
}

abstract class Serialize<T extends object> implements Serializable<object> {
    // abstract _t(): T | null;
    // constructor(val: T | null) {
        
    // }
    serialize(value: T | null): T | null {
        return structuredClone(value);
    }
    
    static serialize<T>(value: T | null): T | null {
        return structuredClone(value);
    }
}

export class Device extends Serialize<Device> {
    /**
     *
     */
    private mdnsRecord:DeviceRecord;
    private client: PersistentClient;
    public receiver?: ReceiverController.Receiver;
    public id?: string;
    private arpData:Array<ArpData>;
    protected readonly recordData: Map<string, string|boolean>;
    constructor(service:MDNSService, arpData?: Array<ArpData>) {
        super();
        this.id = service.id;
        this.arpData = arpData ?? [];
        this.mdnsRecord = ToDeviceRecord(service);
        this.recordData = this.mdnsRecord.Record//.entries();
        const clientOptions = {host: this.mdnsRecord.IPAddress, port: this.mdnsRecord.Port} as PersistentClientOptions;
        this.client = new PersistentClient(clientOptions);
        this.client.connect().then(
            () => {
                this.receiver = ReceiverController.createReceiver(this.client);
                this.resolveMac();
            }
        )
        // console.debug(this);
        // this.receiver = ReceiverController.createReceiver(this.client);
    }
    /**
     * update
     */
    public async update(service: MDNSService) {
        this.client.close()
        this.id = service.id;
        this.mdnsRecord = {
            ...ToDeviceRecord(service),
            MacAddress: this.mdnsRecord!.MacAddress
        };
        const clientOptions = {host: this.mdnsRecord.IPAddress, port: this.mdnsRecord.Port} as PersistentClientOptions;
        this.client = new PersistentClient(clientOptions);
        await this.client.connect()
    }
    /**
     * update
     */
    public unavailable(service: MDNSService) {
        this.client.close()
        // delete(this.mdnsRecord)
        // this.id = undefined;
    }

    // public destroy() {
    //     delete this.mdnsRecord;
    // }

    protected resolveMac() {
        // console.debug('device.resolveMac var: arpData', this.arpData)        
        let mac = this.arpData?.filter(dataPkt => this.mdnsRecord!.IPAddress === dataPkt.ip_address).pop();
        if (mac === undefined) { // * Did we find it?
            console.warn("still need Mac")
            // TODO: Might not handle all use cases
            arpDevice(this.mdnsRecord!.IPAddress!)!.stdout!.once('data', (stream: string) => {
                mac = ArpDataCachePOJO(stream).pop();
            })
        }
        // console.debug('device.resolveMac', mac)
        this.mdnsRecord = {
            ...this.mdnsRecord!,
            MacAddress: mac?.mac_address,
        };
    }

    public get asMapEntry() : [string, Device] {
        return [this.id!.toString(), this]
    }

    public static mapEntry(service: MDNSService, arpData?:Array<ArpData>): [string, Device] {
        return [service.id, new Device(service, arpData)]
    }

    public get DeviceRecord() : DeviceRecord {
        return this.mdnsRecord 
    }
    
}

// const serializeNonPOJOs = (value: object | null) => {
//     return structuredClone(value)
// };

export class Devices extends Serialize<Devices> {
    /**
     *
     */
    protected readonly discover:MDNSServiceDiscovery;
    protected readonly devices:Map<string, Device> = new Map();
    public arpData:Array<ArpData>;
    constructor(discovery?: MDNSServiceDiscovery, options?: MDNSDiscoveryOptions) {
        super();
        const allArp = arpAll();
        allArp.subscribe((sub) => {this.arpData = sub});
        this.discover = discovery ?? new MDNSServiceDiscovery(options ?? mdnsServiceOpt);
        // const promisedData = new Promise<Array<ArpData>>((resolve, reject) => {
        //     allArp.subscribe((sub) => {
        //         // this.arpData = sub;
        //         resolve(sub)
        //     });
        // }).then((sub) => {
        //     // this.unsubscribe = unsub;
        //     this.arpData = sub;
        //     this.discover.onAvailable(
        //         (service) => this.devices.set(...Device.mapEntry(service, this.arpData))
        //     )
        // });
        this.discover.onAvailable(
            (service) => {
                const dev = new Device(service, this.arpData)
                // if(dev.DeviceRecord.Type !== undefined && dev.DeviceRecord.Type !== DeviceTypes.TV)
                this.devices.set(...dev.asMapEntry)
            }
        )
        this.discover.onUpdate(
            (service, newService) => this.devices.get(service.id)?.update(newService)
        )
        this.discover.onUnavailable(
            (service) => {
                this.devices.get(service.id)?.unavailable(service)
                this.devices.delete(service.id)
            }
        )
    }

    public get DeviceRecords():Map<string, DeviceRecord> {
        const map = new Map<string, DeviceRecord>()
        for (const iterator of this.devices.entries()) {
            map.set(iterator[0], iterator[1].DeviceRecord)
        }
        return map;
    }

    public DeviceRecordArray(stripOpts?: DeviceRecord):Array<DeviceRecord> {
        return Array.from(this.Devices).map((device) => {return {...(device.DeviceRecord), ...stripOpts} as DeviceRecord })
    }

    public DeviceIdArray():Array<string> {
        return Array.from(this.DeviceEntries).map(([id, _]) => id);
    }

    public get Devices():IterableIterator<Device> {
        return this.devices.values()
    }

    public get DeviceEntries():Map<string, Device> {
        return this.devices
    }

}