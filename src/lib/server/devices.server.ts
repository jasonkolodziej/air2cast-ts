import { MDNSServiceDiscovery, type MDNSDiscoveryOptions, type MDNSService } from "tinkerhub-mdns";
import { ToDeviceRecord, type DeviceRecord } from "./mdns.server";
import { PersistentClient, ReceiverController, Result, type ReceiverStatus } from "@foxxmd/chromecast-client";
import type { PersistentClientOptions } from "@foxxmd/chromecast-client/dist/cjs/src/persistentClient";
import { arpDevice, arpAll, type ArpData, ArpDataCachePOJO } from "./arp.server";
import { mdnsServiceOpt } from "./chromecastHandler.server";
import {spawn, ChildProcess,
    type ChildProcessWithoutNullStreams, type SendHandle, type MessageOptions} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export const serializeNonPOJOs = (value: object | null) => {
    return structuredClone(value)
};

const searchForFile = (dir: string, filename: string): fs.PathOrFileDescriptor | undefined => {
        // read the contents of the directory
        const files = fs.readdirSync(dir);
        // search through the files
    for (const file of files) {
        // build the full path of the file
        const filePath = path.join(dir, file);
    
        // get the file stats
        const fileStat = fs.statSync(filePath);
    
        // if the file is a directory, recursively search the directory
        if (fileStat.isDirectory()) {
            return searchForFile(filePath, filename);
        } else if (!file.endsWith(filename)) {
            continue;
        } else {
            // if the file is a match, print it
            console.log(filePath);
            return (filePath as fs.PathOrFileDescriptor);
        }
    } // fs.readFileSync(filePath)
}
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

export interface CastController {
    readonly Client: PersistentClient;
    readonly receiver?: ReceiverController.Receiver;
    Status(): Promise<ReceiverStatus>
}

export interface Pipes {
    readonly ShairportSync: ChildProcessWithoutNullStreams;
    readonly Transcoder: ChildProcessWithoutNullStreams;
}

// interface Status {
//     async ():Promise<ReceiverStatus>;
// }

export class Device extends Serialize<Device> implements CastController, Pipes {
    /**
     *
     */
    private mdnsRecord:DeviceRecord;
    private client: PersistentClient;
    public receiver?: ReceiverController.Receiver;
    public id?: string;
    private arpData:Array<ArpData>;
    protected readonly recordData: Map<string, string|boolean>;
    protected shairportSync?: ChildProcessWithoutNullStreams;
    protected transcoder?: ChildProcessWithoutNullStreams;

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
                this.receiver = ReceiverController.createReceiver({client: this.client});
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

    public get CastController() : CastController {
        return {
            Client: this.Client,
            receiver: this.receiver,
            Status: this.Status,
        }
    }

    public async Status(): Promise<ReceiverStatus> {
        // get the status from the chromecast and unwrap the result
        // const result = (await this.receiver?.getStatus())?.unwrapWithErr()
        const {isOk, value} = await this.receiver?.getStatus().then(Result.unwrapWithErr)

        // launch the media app on the Chromecast and join the session (so we can control the CC)
        // const media = await DefaultMediaApp.launchAndJoin({client}).then(Result.unwrapWithErr)

        // // if the media app failed to load, log the error
        // if (!media.isOk) return console.error(media.value)
       return new Promise((resolve, reject) => isOk ? resolve(value) : reject(value))
    }

    public get Controller(): PersistentClient|ReceiverController.Receiver {
        return this.receiver ?? this.client
    }

    public get Client(): PersistentClient {
        return this.client
    }

    protected findConfigurationFile():fs.PathLike {
        const startPath = '/etc/shairport-sync.conf'
        return searchForFile('/etc', 'shairport-sync.conf') as fs.PathLike
    }

    private assembleShairportSync() {
        const configPath = this.findConfigurationFile().toString()
        this.shairportSync = spawn('shairport-sync', ['-c', configPath]);
    }

    /** 
        * ffmpegArgs https://ffmpeg.org/ffmpeg-protocols.html#toc-pipe
        ? (e.g. 0 for stdin, 1 for stdout, 2 for stderr).
        - $ ffmpeg -formats | grep PCM
        - DE alaw            PCM A-law
        - DE f32be           PCM 32-bit floating-point big-endian
        - DE f32le           PCM 32-bit floating-point little-endian
        - DE f64be           PCM 64-bit floating-point big-endian
        - DE f64le           PCM 64-bit floating-point little-endian
        - DE mulaw           PCM mu-law
        - DE s16be           PCM signed 16-bit big-endian
        - DE s16le           PCM signed 16-bit little-endian
        - DE s24be           PCM signed 24-bit big-endian
        - DE s24le           PCM signed 24-bit little-endian
        - DE s32be           PCM signed 32-bit big-endian
        - DE s32le           PCM signed 32-bit little-endian
        - DE s8              PCM signed 8-bit
        - DE u16be           PCM unsigned 16-bit big-endian
        - DE u16le           PCM unsigned 16-bit little-endian
        - DE u24be           PCM unsigned 24-bit big-endian
        - DE u24le           PCM unsigned 24-bit little-endian
        - DE u32be           PCM unsigned 32-bit big-endian
        - DE u32le           PCM unsigned 32-bit little-endian
        - DE u8              PCM unsigned 8-bit

       ### Example:
            ```
            shairport-sync -c /etc/shairport-syncKitchenSpeaker.conf -o stdout \
                | ffmpeg -f s16le -ar 44100 -ac 2 -i pipe: -ac 2 -bits_per_raw_sample 8 -c:a flac -y flac_test1.flac
                |||
                | ffmpeg -y -re -fflags nobuffer -f s16le -ac 2 -ar 44100 -i pipe:0 -c:a adts pipe:1
            ```
    */
    private assembleFfMpeg() {
        const config = [
            // * arguments
            "-y",
            "-re",
            "-fflags",  // * AVOption flags (default 200)
            "nobuffer", // * reduce the latency introduced by optional buffering
            "-f", "s16le",
            "-ar", "44100",
            "-ac", "2",
            // "-re",         // * encode at 1x playback speed, to not burn the CPU
            "-i", "pipe:", // * input from pipe (stdout->stdin)
            // "-ar", "44100", // * AV sampling rate
            // "-c:a", "flac", // * audio codec
            // "-sample_fmt", "44100", // * sampling rate
            "-ac", "2", // * audio channels, chromecasts don't support more than two audio channels
            // "-f", "mp4", // * fmt force format
            "-bits_per_raw_sample", "8",
            "-f", "adts",
            "pipe:1", // * output to pipe (stdout->)
        ];
        this.transcoder = spawn('ffmpeg', config);
    }

    protected startSubProcs() {
        this.shairportSync ?? this.assembleShairportSync();
        this.transcoder ?? this.assembleFfMpeg();
        this.shairportSync!.stdout.pipe(this.transcoder!.stdin);
    }

    public get ShairportSync(): ChildProcessWithoutNullStreams {
        return this.shairportSync!
    }

    public get Transcoder(): ChildProcessWithoutNullStreams {
        return this.transcoder!
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
    public arpData!: Array<ArpData>;
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