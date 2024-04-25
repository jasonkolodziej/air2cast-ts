import { MDNSServiceDiscovery, type MDNSDiscoveryOptions, type MDNSService } from "tinkerhub-mdns";
import { ToDeviceRecord, type DeviceRecord } from "./mdns.server";
import { PersistentClient, ReceiverController } from "@foxxmd/chromecast-client";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { arpDevice, arpAll, type ArpData, ArpDataCache, ArpDataSig } from "./arp.server";
import { mdnsServiceOpt } from "./chromecastHandler.server";
import { isIP } from 'net';
import type { Readable } from "svelte/store";
import { parseMAC } from "./mac/MAC";



export class Device {
    /**
     *
     */
    private mdnsRecord:DeviceRecord;
    private client: PersistentClient;
    public receiver?: ReceiverController.Receiver;
    public id?: string;
    private arpData:Array<ArpData>;
    protected readonly recordData: Map<string, string|boolean>;
    constructor(service:MDNSService, arpData?: Readable<Array<ArpData>>) {
        // super();
        this.id = service.id;
        arpData?.subscribe(sub => this.arpData = sub);
        this.mdnsRecord = ToDeviceRecord(service);
        this.recordData = this.mdnsRecord.Record//.entries();
        const clientOptions = {host: this.mdnsRecord.IPAddress, port: this.mdnsRecord.Port} as PersistentClientOptions;
        this.client = new PersistentClient(clientOptions);
        this.client.connect().then(
            () => {
                this.receiver = ReceiverController.createReceiver(this.client);
            }
        )
        // this.resolveMac();
        // this.receiver = ReceiverController.createReceiver(this.client);
    }

    
    // private _arpData(value : ArpData[]): void {
    //     this.arpData = value;
    // }
    // private set arpData(value : ArpData[]) {
    //     this.arpData = value;
    // }
    
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
        let mac = this.arpData.filter(dataPkt => this.mdnsRecord!.IPAddress === dataPkt.ip_address);
        if (mac.length > 0) {
            this.mdnsRecord = {
                ...this.mdnsRecord!,
                MacAddress: (mac.pop()!.mac_address as string),
            };
            return;
        } else { // * Did we find it?
            console.warn("still need Mac")
            // TODO: Might not handle all use cases
            arpDevice(this.mdnsRecord!.IPAddress!)!.stdout!.once('data', (stream: string) => {
                // const arp = stream.split('\n').map(
                //     line => line.split(' ')
                //         .filter(piece => piece !== 'at' && piece !== 'on' && piece !== '')
                //     ).filter(
                //         item => 
                //             isIP(item.at(1)?.replace("(","").replace(")","") as string) === 4 &&
                //             parseMAC(item.at(2) as string)
                //     ).map(editedLine => {
                //       // console.debug(editedLine)
                //         return {
                //             hw_type: editedLine.pop()?.replace('[','').replace(']',''),
                //             hostname: editedLine.reverse().pop(), // .at(0),
                //             ip_address: editedLine.pop()?.replace('(','').replace(')',''), // .at(1)?.replace('(','').replace(')',''),
                //             mac_address: parseMAC(editedLine.pop() as string), //.at(2),
                //             interface_name: editedLine.pop(), //.at(3),
                //             scope: editedLine,
                //         } as ArpData}
                //     );
                const arp = ArpDataSig(stream)
                console.debug('Devices.mac', arp)
                this.mdnsRecord = {
                    ...this.mdnsRecord!,
                    MacAddress: (arp?.mac_address as string),
                };
            })
        }
    }

    
    public get asMapEntry() : [string, Device] {
        return [this.id!.toString(), this]
    }

    public static mapEntry(service: MDNSService, arpData?:Readable<Array<ArpData>>): [string, Device] {
        return [service.id, new Device(service, arpData)]
    }

    
    public get DeviceRecord() : DeviceRecord {
        return this.mdnsRecord 
    }
}

// const serializeNonPOJOs = (value: object | null) => {
//     return structuredClone(value)
// };

export class Devices {
    /**
     *
     */
    protected readonly discover:MDNSServiceDiscovery;
    protected readonly devices:Map<string, Device> = new Map();
    public arpData:Readable<Array<ArpData>>;
    constructor(discovery?: MDNSServiceDiscovery, options?: MDNSDiscoveryOptions) {
        this.arpData = arpAll();
        this.discover = discovery ?? new MDNSServiceDiscovery(options ?? mdnsServiceOpt);
        this.discover.onAvailable(
            (service) => this.devices.set(...Device.mapEntry(service, this.arpData))
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

    
    // public get ArpData(): Array<ArpData> {
    //     return this.arpData.subscribe.caller()
    // }

    // public set ArpData(v: Subscriber<Array<ArpData>>){
    //     this.arpData.subscribe(v)
    // }

}