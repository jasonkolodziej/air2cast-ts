import { PersistentClient } from "@foxxmd/chromecast-client";
import type { Mac } from  "$lib/server/mac/MAC";
import type { MDNSService } from "tinkerhub-mdns";
import { DeviceTypes, type RecordDetails } from "./device";
import { ArpDiscovery } from "../arp/discovery.server";
import { ArpCall } from "../arp/types";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { BasicServiceDiscovery, type Service } from "tinkerhub-discovery";

interface DeviceData extends Service {
    readonly Record:MDNSService;
    readonly MacAddress?: Mac;
    readonly DeviceId: String;
    Client: PersistentClient;
    Type: DeviceTypes;
}

abstract class DeviceInfo extends BasicServiceDiscovery<DeviceInfo> {
    //* For Service interface
    get id() {
        return this.DeviceId as string;
    }
    /* *
    * Implement DeviceServicePub interface
    */
    Record:MDNSService;
    MacAddress?: Mac;
    Client: PersistentClient;

    get Type() {
        return this.deviceType;
    }

    get DeviceId() {
        return this.RecordDetails.Id;
    }
    /* *
    * end of DeviceServicePub interface
    */
    readonly RecordDetails: RecordDetails;

    constructor(service:MDNSService) {
        super('DeviceInfo');
        this.Record = service;
        this.RecordDetails = this.handleRecordDetails();
        this.Client = new PersistentClient(this.Address as PersistentClientOptions);
        // ? handle obtaining the MacAddress
        this.obtainMacAsync();
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

    private async obtainMacAsync() {
        //* Get connected
        await this.Client.connect();

        const someHost = this.Record.addresses.at(0)?.host;
        if (someHost === undefined) {
            throw new Error('host not defined')
        }
        const arp = new ArpDiscovery(ArpCall.NAMED, someHost);
        this.MacAddress = (await arp.onUpdate.once().then(([id, val]) => val.mac_address))
        // this.withMACUpdate(mac);
    }

    private get Address() {
        return this.Record.addresses.at(0)!
    }
}

