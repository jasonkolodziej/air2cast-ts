import { MDNSServiceDiscovery, type MDNSDiscoveryOptions, type MDNSService } from "tinkerhub-mdns";
import { ToDeviceRecord, type DeviceRecord } from "./mdns.server";
import { PersistentClient, ReceiverController } from "@foxxmd/chromecast-client";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { ArpDataCache, arpDevice, type ArpData } from "./arp.server";
import { mdnsServiceOpt } from "./chromecastHandler.server";
import type { MAC } from "./mac/MAC";



export class Device {
    /**
     *
     */
    private mdnsRecord?:DeviceRecord;
    private client: PersistentClient;
    public receiver: ReceiverController.Receiver;
    public id?: string;
    protected readonly recordData: Map<string, string|boolean>;
    constructor(service:MDNSService, arpData?: Array<ArpData>) {
        // super();
        this.id = service.id;
        this.mdnsRecord = ToDeviceRecord(service);
        this.recordData = this.mdnsRecord.Record//.entries();
        const clientOptions = {host: this.mdnsRecord.IPAddress, port: this.mdnsRecord.Port} as PersistentClientOptions;
        this.client = new PersistentClient(clientOptions);
        // this.mac(arpData);
        this.receiver = ReceiverController.createReceiver(this.client);
    }
    /**
     * update
     */
    public async update(service: MDNSService) {
        this.client.close()
        this.id = service.id;
        this.mdnsRecord = ToDeviceRecord(service)
        const clientOptions = {host: this.mdnsRecord.IPAddress, port: this.mdnsRecord.Port} as PersistentClientOptions;
        this.client = new PersistentClient(clientOptions);
        await this.client.connect()
    }
    /**
     * update
     */
    public unavailable(service: MDNSService) {
        this.client.close()
        this.mdnsRecord = undefined;
        this.id = undefined;
    }

    public destroy() {
        delete this.mdnsRecord;
    }

    protected mac(arpData?: Array<ArpData>) {
        let mac = arpData?.filter(dataPkt => this.mdnsRecord?.IPAddress === dataPkt.ip_address).pop();
        if (mac === undefined) { // * Did we find it?
            console.warn("still need Mac")
            // TODO: Might not handle all use cases
            arpDevice(this.mdnsRecord?.IPAddress!)!.stdout?.once('data', (stream) => {
                console.debug('Devices.mac', stream)
                mac = ArpDataCache(stream).pop()
            }) 
        }
        this.mdnsRecord = {
            MacAddress: mac?.mac_address,
            ...this.mdnsRecord!,
        };
    }

    
    public get asMapEntry() : [string, Device] {
        return [this.id!.toString(), this]
    }

    public static mapEntry(service: MDNSService): [string, Device] {
        return [service.id, new Device(service)]
    }

    
    public get DeviceRecord() : DeviceRecord {
        return this.mdnsRecord! 
    }
    
    
}

export class Devices {
    /**
     *
     */
    protected readonly discover:MDNSServiceDiscovery;
    protected readonly devices:Map<string, Device> = new Map();
    constructor(discovery?: MDNSServiceDiscovery, options?: MDNSDiscoveryOptions) {
        this.discover = discovery ?? new MDNSServiceDiscovery(options ?? mdnsServiceOpt);
        this.discover.onAvailable(
            (service) => this.devices.set(...Device.mapEntry(service))
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

    public get Devices():IterableIterator<Device> {
        return this.devices.values()
    }

    public get DeviceEntries():Map<string, Device> {
        return this.devices
    }
    
}