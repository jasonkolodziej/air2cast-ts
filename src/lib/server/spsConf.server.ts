// ? Interfaces of `spsConfig.json`
import { PWD } from '$env/static/private';
import { createEventAdapter, type Subscribable } from "atvik";
import { ChildProcess, spawn } from "child_process";
import { Readable } from "stream";
import { platform } from "os";
import { BasicServiceDiscovery, type Service } from "tinkerhub-discovery";
import { type PathOrFileDescriptor, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
// import {parseFile, stripComments} from "../libconfig";
// import { ParseCommentedSetting } from "../libconfig/parts/Comments";
// import { Group } from "../libconfig/parts/AssignmentStatement";
// import { convert2Json } from "../libconfig/commands";
// import { toLibConfigFile } from "../libconfig/toLibConfigFile";

export const searchForFile = (dir: string, filename: string): PathOrFileDescriptor | undefined => {
    // read the contents of the directory
    const files = readdirSync(dir);
    // search through the files
    for (const file of files) {
        // build the full path of the file
        const filePath = path.join(dir, file);

        // get the file stats
        const fileStat = statSync(filePath);

        // if the file is a directory, recursively search the directory
        if (fileStat.isDirectory()) {
            return searchForFile(filePath, filename);
        } else if (!file.endsWith(filename)) {
            continue;
        } else {
            // if the file is a match, print it
            console.log(filePath);
            return (filePath as PathOrFileDescriptor);
        }
    } // fs.readFileSync(filePath)
}


// export const ParseFile = parseFile;
// // export const jsonConfiguration = configJson; // JSON.parse(configJson);
// export function withComments(input:string):string {
//     return ParseCommentedSetting.parse(input) as unknown as string;
// }
// export const Parse = (arg0: string) => { 
//     let o = Group.parse(`{${stripComments(arg0)}}`) as object;
//     o = Object.assign(o, {[Object.keys(o).at(0) as string]:withComments(arg0)})
//     // console.log()
//     return o
// };
/**
 * ## DeviceConfig
    Represents the interface of fields that need to be modified for each device that will proxy `shairport-sync`.
 */
export interface DeviceConfig {
        airplay_device_id: String, // * 0x<MACADDR>L
        port: Number,
        mdns_backend: 'avahi',
        output_backend: "alsa" | "pipe" | "stdout",
        interpolation: "auto" | "basic" | "soxr",
        name: String
}
/**
 * ## Comment
    Within the `json` template for `shairport-sync` a comment represents any 
    comment per section or field of the `libconfig` for each device.
 */
export interface Comment {
    // _description: Array<String> | Description;
    '$style'?: string;
    _isCommented?: boolean;
    _description: Array<String>;
}
const CommentWriter = (c: Comment, defined?: boolean) => {
    switch (c.$style) {
       case "CppStyle": //? '//'
        if (c._description.length > 1) {
            return '// ' + c._description.join('\n');
        } else {
            return '// ' + c._description.join('');
        }
        //return c._description.map((line) => '// '+line).join('\n');
       case "CStyle": //? '/* */'
        if (c._description.length > 1) {
            return '/*\n ' + c._description.join('\n') + ' */';
        } else {
            return '/* ' + c._description.join('') + ' */';
        }
       case "ScriptStyle": //? '#'
        if (c._description.length > 1) {
                return '# ' + c._description.join('\n');
            } else {
                return '# ' + c._description.join('');
        }
    }
}
/**
 * ## Section
    Within the `json` template for `shairport-sync` a section represents any 
    section of the `libconfig` for each device -- holding it KeyValue pairs for each field.
 */
export interface Section<PName = typeof String> {
    _comments: Comment;
    // PName: KV;
}

const SectionWriter = (name: String, s: object | Section) => {
    let children = new Map<string, KV>();
    const props = Object.entries(s) // .filter((elem) => { elem[0] !== '_comments' })
            // console.info(childs)
    for (let [key, value] of props) {
        if (key == '_comments') {
            continue
        }
        // console.log(key, value);
        children = children.set(key, (value as KV))
    }
    return CommentWriter((s as Section)._comments) + `${name} = {\n` + Array.from(children.entries()).map(([name, kv]) => {
        return name + ' = ' + KvWriter(kv);
    }).join('\n') + '\n}\n';
}
/**
 * ## KV
    Within the `json` template for `shairport-sync` a KV represents any 
    field with in the section of the `libconfig` for each device.
 */
export interface KV {
    _value: any;
    '$type': String;
    _description: Comment;
}
const KvWriter = (kv: KV) => {
    return kv._value + '; ' + CommentWriter(kv._description);
}
/** ## ParsedConfiguration 
    Alias for UI ready array. 
*/ 
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

    private static preloadConfig(path?: string) {
        return JSON.parse(readFileSync(PWD+"/spsConf.json", 'utf-8'))
    }

    protected parsedConfiguration(config?: object): ParsedConfiguration {
        const data  = Array<{title: string; description: string[]; children: Map<string,KV>}>()
    // console.info(layOutdata)
        const dataObj = config ?? Object(SPS.preloadConfig());
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

    protected static parseConfiguration(config?: object) {
        const dataObj = config ?? Object(SPS.preloadConfig());
        Object.entries(dataObj).forEach(entry => {
            const sect = entry[1] as Section;
            const comments = sect._comments
            const des = comments._description
            let childsMap = new Map<string, KV>()
            const props = Object.entries(sect) // .filter((elem) => { elem[0] !== '_comments' })
            // console.info(childs)
            for (let [key, value] of props) {
                if (key == '_comments') {
                    continue
                }
                // console.log(key, value);
                childsMap = childsMap.set(key, (value as KV))
            }
            console.log(SectionWriter(entry[0], sect))
        })
    }

    static test() {

        // const file = ParseFile('spsTemplate.conf', __dirname)
        // const jsonObj = JSON.stringify(
        //     file, null, 4
        // )
        // const cfg = toLibConfigFile(file)

        const cfg = SPS.parseConfiguration();
        
        console.log(cfg);
    }
}