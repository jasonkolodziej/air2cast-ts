// ? Interfaces of `spsConfig.json`
import { PWD } from '$env/static/private';
import { createEventAdapter, type Subscribable } from "atvik";
import { ChildProcess, spawn } from "child_process";
import { Readable } from "stream";
import { platform } from "os";
import { BasicServiceDiscovery } from "tinkerhub-discovery";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { createLogger, type Logger } from "@lvksh/logger";
import chalk from 'chalk';
import type { KV, ParsedConfiguration, Section, Sections, Sps, DeviceConfig } from '$lib/server/sps/types';
import { SectionsWriter, UpdateFields } from '$lib/server/sps/utils';



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
}