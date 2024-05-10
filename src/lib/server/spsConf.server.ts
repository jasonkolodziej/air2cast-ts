// ? Interfaces of `spsConfig.json`
import { PWD } from '$env/static/private';
import { createEventAdapter, type Subscribable } from "atvik";
import { ChildProcess, spawn } from "child_process";
import { Readable } from "stream";
import { platform } from "os";
import { BasicServiceDiscovery, type Service } from "tinkerhub-discovery";
import { type PathOrFileDescriptor, readdirSync, readFileSync,
    statSync, existsSync, writeFileSync } from "fs";
import path from "path";
import { createLogger, type Logger } from "@lvksh/logger";
import chalk from 'chalk';

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

/**
 * ## DeviceConfig
    Represents the interface of fields that need to be modified for each device that will proxy `shairport-sync`.
 */
export interface DeviceConfig {
        // airplay_device_id: String, // * 0x<MACADDR>L
        // port: Number,
        // mdns_backend: 'avahi',
        // output_backend: "alsa" | "pipe" | "stdout",
        // interpolation: "auto" | "basic" | "soxr",
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
const CommentWriter = (c: Comment, isKV: boolean = false):string => {
    switch (c.$style) {
       case "CppStyle": //? '//'
        if(isKV === true && c._isCommented) {
            return '// '
        } else if (isKV) return '';
        return c._description.map((line) => '// '+line).join('\n');
       case "CStyle": //? '/* */'
        if(isKV === true && c._isCommented) {
            return '/* '
        } else if (isKV) return '';
        if (c._description.length > 1) {
            return '/*\n ' + c._description.join('\n') + ' */';
        } else {
            return '/* ' + c._description.join('') + ' */';
        }
       case "ScriptStyle": //? '#'
        if(isKV === true && c._isCommented) {
            return '# '
        } else if (isKV) return '';
        return c._description.map((line) => '# '+line).join('\n');
    }
    return ''
}
/**
 * ## Section
    Within the `json` template for `shairport-sync` a section represents any 
    section of the `libconfig` for each device -- holding it KeyValue pairs for each field.
 */
export interface Section {
    _comments: Comment;
    properties: SectionPropertyMap;
}

export interface SectionPropertyMap {
    [key: string]:KV;
}

export interface Sections {
    [key: string]:Section;
}

const UpdateFields = (dc: DeviceConfig, sections: Sections, secName?: string):Sections => {
    let d = Object.entries(dc);
    return Object.fromEntries(Object.entries<Section>(sections) //.fromEntries(Object.entries(sections)
        .filter(([n,_]) => secName == n || secName === undefined )
        .map(([sectionName, val]) => {
            console.debug('in', sectionName);
            const section = Object(val);
            d = d.map(([seg, nVal]) => {
                if (section.hasOwnProperty(seg) && nVal !== undefined) {
                    console.debug(`section: ${sectionName} contains: ${seg}`);
                    const kval = section[seg] as KV;
                    kval._value = nVal;
                    return [seg, undefined];
                }
                return [seg, nVal];
            });
            return [sectionName, section];
    }));
}

// export type SectionPropertyName = keyof SectionProperty;

const SectionsWriter = (s: Sections) => Object.entries<Section>(s).map(val => SectionWriter(...val)).join('');

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
        return CommentWriter(kv._description, true) + name + ' = ' + KvWriter(kv);
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
    // private errorEvent: Event<this, [ Error | string ]>;
    protected logger: Logger<string> = createLogger(
            {
                ok: {
                    label: chalk.greenBright(`[OK]`),
                    newLine: '| ',
                    newLineEnd: '\\-',
                },
                debug: chalk.magentaBright(`[DEBUG]`),
                info: {
                    label: chalk.cyan(`[INFO]`),
                    newLine: chalk.cyan(`⮡`),
                    newLineEnd: chalk.cyan(`⮡`),
                },
                ffmpegError: {
                    label: chalk.bgRed.white.bold(`[TRANSCODER]`),
                    newLine: chalk.bgRed.white.bold('| '),
                    newLineEnd: chalk.bgRed.white.bold('\\-'),
                },
                spsError: {
                    label: chalk.bgYellowBright.black.bold(`[shairport-sync]`),
                    newLine: chalk.bgYellowBright.black.bold('| '),
                    newLineEnd: chalk.bgYellowBright.black.bold('\\-'),
                },
            },
            { 
                padding: 'PREPEND', 
            //     preProcessors: [
            //         (inputs, { name, err }) => {
            //             let index = 0;

            //             return inputs.map(it => `[Called ${name} ${++index} times] ${it}`);
            //         }                    
            // ]
            },
            console.log
    );
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


    constructor(deviceInfo:DeviceConfig) {
        super('sps:ffmpeg');
        // * check to see if file exists
        this.inform('Resolving Configuration')
        const [_path, configuration] = this.args(deviceInfo);
        this.inform('Spawning Shairport Sync');
        this._proc = spawn('shairport-sync', configuration);
        this.inform('Spawning FFMpeg');
        this._next = spawn('ffmpeg', this.ffmpegConfig);
        // * send data from shairport-sync to ffmpeg stdout-->stdin
        this.inform('Piping children');
        this._proc.stdout!.pipe(this._next.stdin!);
        this._proc.stderr?.on('data', (err) => this.logAndEmitError(Error(err), 'sps'));
        this._next.stderr?.on('data', (err) => this.logAndEmitError(Error(err), 'ffmpeg'));
        // * get output from ffmpeg
        this._parent = createEventAdapter(this._next.stdout!, 'data');
        this._parent.subscribe((listener) => {
        this.debug('listening', listener);
            this.availableEvent.emit({
                configPath: _path, 
                content: listener as Buffer,
                id: "Sps",
                templateConfiguration: this.parsedConfiguration()
            })
        });
        // this.availableEvent.subscribe
    }
    private get spsError() {
        return this.logger.spsError;
    }
    private get ffmpegError() {
        return this.logger.ffmpegError;
    }
    private get ok() {
        return this.logger.ok;
    }
    private get debugMe() {
        return this.logger.debug;
    }
    private get inform() {
        return this.logger.info;
    }

    protected override logAndEmitError(error: Error, namepaceSegment?: string, message: string = 'true'): void {
        switch(namepaceSegment) {
            case 'sps':
            this.spsError(error.message);
                break;
            case 'ffmpeg':
            this.ffmpegError(error.message);
                break;
            default:
            if (message !== 'true') {
                super.logAndEmitError(error, message);
            }
        }
    }
    
    private args(info: DeviceConfig):[string, Array<string>] {
        if (this._args.length === 2) {
            this.logAndEmitError(new Error(`Arguments for shairport-sync have already been set: ${this._args}`), 'SPS.args():')
        } else {
            let fileName: string = '';
            const pForm = platform()
            switch (pForm) {
                // case: 'aix'
                case 'linux':
                    fileName = `/etc/shairport-sync${info.name}.conf`;
                    // existsSync
                    break;
                // case 'openbsd':
                // case 'darwin':
                // case 'freebsd':
                // case 'sunos':
                // case: 'win32':
            }
            if(existsSync(fileName)) {
                this.debugMe('File Found!', fileName);
                this._args.push(`/etc/shairport-sync${info.name}.conf`);
            } else {
                this.debugMe('WARNING: Attempting to generate a configuration!', info.name, `on platform ${pForm}`);
                return this.createConfFile(info);
            }
        }
        return [this._args[1], this._args];
    }

    private createConfFile(config: DeviceConfig, specificSection?: string):[string, Array<string>] {
        //* resolve file path based on OS
        let fileName:string = ''
        switch (platform()) {
            // case: 'aix'
            case 'linux':
                fileName = `/etc/shairport-sync${config.name}.conf`;
                break;
            // case 'openbsd':
            // case 'darwin':
            // case 'freebsd':
            // case 'sunos':
            // case: 'win32':
            default:
                this.spsError('SPS.createConfFile:',`${platform()} is NOT supported`);
                this.destroy();
        }
        //* get the template
        const template = SPS.parseConfiguration();
        //* modify them for the specific device
        const revised = UpdateFields(config, template, specificSection)
        writeFileSync(fileName, SectionsWriter(revised), 'utf-8')
        this._args.push(fileName);
        return [fileName, this._args];
    }

    private static preloadConfig(path?: string) {
        return JSON.parse(readFileSync(PWD+"/spsConfig.json", 'utf-8'))
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
        const dataObj = config ?? new Object(SPS.preloadConfig());
        // return Object.setPrototypeOf(dataObj, Sections).map(([sectionName, section]) => {
        //     return [sectionName, Object.setPrototypeOf]
        // })
        return (Object.setPrototypeOf(dataObj, Object({} as Sections)) as Sections)
    }

    protected static parseConfigurationTry(config?: object) {
        const dataObj = config ?? Object(SPS.preloadConfig());
       return Object.fromEntries(Object.entries<Section>(dataObj).map(entry => {
        const sect = entry[1] as Section;
        let childsMap = new Map<string, KV>()
        const props = Object.entries(sect).filter((elem) => { elem[0] !== '_comments' })
        // console.info(childs)
        for (let [key, value] of props) {
            if (key == '_comments') {
                continue
            }
            // console.log(key, value);
            childsMap = childsMap.set(key, (value as KV))
        }
        return [entry[0], new Object(Object.defineProperties(sect, Object.fromEntries(childsMap.entries())))]
        // console.log(SectionWriter(entry[0], sect))
    }))
    }

    static test() {

        // const file = ParseFile('spsTemplate.conf', __dirname)
        // const jsonObj = JSON.stringify(
        //     file, null, 4
        // )
        // const cfg = toLibConfigFile(file)

        const cfg = SPS.parseConfiguration();
       const updated = UpdateFields({name: "HELLOJASON"}, cfg);
        
        console.log(SectionsWriter(updated));
    }
}