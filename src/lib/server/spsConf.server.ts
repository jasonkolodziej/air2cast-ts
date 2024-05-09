// ? Interfaces of `spsConfig.json`
import { PWD } from '$env/static/private';
import { createEventAdapter, type Subscribable } from "atvik";
import { ChildProcess, spawn } from "child_process";
import { Readable } from "stream";
import { platform } from "os";
import { BasicServiceDiscovery, type Service } from "tinkerhub-discovery";
import { type PathOrFileDescriptor, readFileSync } from "fs";

export interface Comment {
    // _description: Array<String> | Description;
    '$style'?: string;
    _isCommented?: boolean;
    _description: Array<String>;
}

export interface Section<TName, String> {
    _comments: Comment;
    TName: KV;
}

export interface KV {
    _value: any;
    '$type': String;
    _description: Comment;
}

export type ParsedConfiguration = Array<{title: string; description: string[]; children: Map<string,KV>}>;

export interface Sps extends Service {
    readonly configPath: PathOrFileDescriptor;
    readonly content: Buffer;
    templateConfiguration: ParsedConfiguration;
    // templateConfig:
}

export abstract class AbstractChildProc {}

export class SPS extends BasicServiceDiscovery<Sps> {
    private readonly  _parent: Subscribable<Readable, any[]>;
    // private readonly  _nextPub: AbstractServicePublisher = new Event();
    private  _proc: ChildProcess;
    private _next: ChildProcess;
    private _args: Array<string> = new Array('-c');
   
/**
    * ffmpegArgs https://ffmpeg.org/ffmpeg-protocols.html#toc-pipe
        ? (e.g. 0 for stdin, 1 for stdout, 2 for stderr).
    
    *   `$ ffmpeg -formats | grep PCM`
    *    - DE alaw            PCM A-law
    *    - DE f32be           PCM 32-bit floating-point big-endian
    *    - DE f32le           PCM 32-bit floating-point little-endian
    *    - DE f64be           PCM 64-bit floating-point big-endian
    *    - DE f64le           PCM 64-bit floating-point little-endian
    *    - DE mulaw           PCM mu-law
    *    - DE s16be           PCM signed 16-bit big-endian
    *    - DE s16le           PCM signed 16-bit little-endian
    *    - DE s24be           PCM signed 24-bit big-endian
    *    - DE s24le           PCM signed 24-bit little-endian
    *    - DE s32be           PCM signed 32-bit big-endian
    *    - DE s32le           PCM signed 32-bit little-endian
    *    - DE s8              PCM signed 8-bit
    *    - DE u16be           PCM unsigned 16-bit big-endian
    *    - DE u16le           PCM unsigned 16-bit little-endian
    *    - DE u24be           PCM unsigned 24-bit big-endian
    *    - DE u24le           PCM unsigned 24-bit little-endian
    *    - DE u32be           PCM unsigned 32-bit big-endian
    *    - DE u32le           PCM unsigned 32-bit little-endian
    *    - DE u8              PCM unsigned 8-bit

       ### Example:
        ```(bash)
        shairport-sync -c /etc/shairport-syncKitchenSpeaker.conf -o stdout \
        | ffmpeg -f s16le -ar 44100 -ac 2 -i pipe: -ac 2 -bits_per_raw_sample 8 -c:a flac -y flac_test1.flac
        
        ```
        #### Or
        ```(bash)
        shairport-sync -c /etc/shairport-syncKitchenSpeaker.conf -o stdout \
        | ffmpeg -y -re -fflags nobuffer -f s16le -ac 2 -ar 44100 -i pipe:0 -c:a adts pipe:1
        ```
    */
    private readonly ffmpegConfig: string[] = [
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


    constructor(deviceName:string) {
        super('sps:ffmpeg');
            // console.debug(args);
        const [_path, configuration] = this.args(deviceName);
        this._proc = spawn('shairport-sync', configuration);
        this._next = spawn('ffmpeg', this.ffmpegConfig);
        // * send data from shairport-sync to ffmpeg stdout-->stdin
        this._proc.stdout!.pipe(this._next.stdin!);
        this._proc.stderr?.on('data', (err) => this.logAndEmitError(err, 'sps'));
        this._next.stderr?.on('data', (err) => this.logAndEmitError(err, 'ffmpeg'));
        // * get output from ffmpeg
        this._parent = createEventAdapter(this._next.stdout!, 'data');
        this._parent.subscribe((listener) => {
        this.debug('listening', listener);
            this.availableEvent.emit({
                configPath: _path, content: listener as Buffer,
                id: "Sps",
                templateConfiguration: this.parsedConfiguration()
            })
        });
        // this.availableEvent.subscribe
    }

    
    private args(deviceName:string):[string, Array<string>] {
        if (this._args.length === 2) {
            this.logAndEmitError(new Error(`Arguments for shairport-sync have already been set: ${this._args}`), 'SPS.args():')
        } else {
            switch (platform()) {
                // case: 'aix'
                case 'linux':
                    this._args.push(`/etc/shairport-sync${deviceName}.conf`)
                // case 'openbsd':
                // case 'darwin':
                // case 'freebsd':
                // case 'sunos':
                // case: 'win32':
            }
        }
        return [this._args[1], this._args];
    }

    private preloadConfig(path?: string) {
        return JSON.parse(readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    }

    protected parsedConfiguration(config?: object): ParsedConfiguration {
        const data  = Array<{title: string; description: string[]; children: Map<string,KV>}>()
    // console.info(layOutdata)
        const dataObj = config ?? Object(this.preloadConfig());
        Object.entries(dataObj).forEach(entry => {
            const props = entry[1] as Object;
            const comments = (props as any)['_comments'] as object
            const des = (comments as any)['_description'] as string[]
            let childsMap = new Map<string, KV>()
            const childs = Object.entries(props) // .filter((elem) => { elem[0] !== '_comments' })
            // console.info(childs)
            for (let [key, value] of childs) {
                if (key == '_comments') {
                    continue
                }
                // console.log(key, value);
                childsMap = childsMap.set(key, (value as KV))
            }
            // console.log(comments)
            data.push({title: entry[0], description: des, children: childsMap})
        })
        return data;
    } 
}