// ? Interfaces of `spsConfig.json`
import { PWD } from '$env/static/private';
import { createEventAdapter, type Subscribable } from 'atvik';
import { ChildProcess, spawn } from 'child_process';
import { Readable } from 'stream';
import { platform } from 'os';
import { BasicServiceDiscovery } from 'tinkerhub-discovery';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { type Logger } from '@lvksh/logger';
import chalk from 'chalk';
import type {
	KV,
	ParsedConfiguration,
	Section,
	Sections,
	Sps,
	DeviceConfig
} from '$lib/server/sps/types';
import { SectionsWriter, UpdateFields } from '$lib/server/sps/utils';
import { ChalkLogger } from '$lib/server/service/types';
import { Filename } from 'carbon-components-svelte';

export abstract class AbstractChildProc {}

export class SPS extends BasicServiceDiscovery<Sps> {
	private _parent: Subscribable<Readable, any[]>;
	protected logger: Logger<string> = ChalkLogger({
		ffmpegError: {
			label: chalk.bgRed.white.bold(`[TRANSCODER]`),
			newLine: chalk.bgRed.white.bold('| '),
			newLineEnd: chalk.bgRed.white.bold('\\-')
		},
		spsError: {
			label: chalk.bgYellowBright.black.bold(`[shairport-sync]`),
			newLine: chalk.bgYellowBright.black.bold('| '),
			newLineEnd: chalk.bgYellowBright.black.bold('\\-')
		}
	});
	private _proc: ChildProcess;
	private _next: ChildProcess;
	protected state: Sps;
	// private readonly maybeConfigPath?:string;
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
		'-y',
		'-re',
		'-fflags', // * AVOption flags (default 200)
		'nobuffer', // * reduce the latency introduced by optional buffering
		'-f',
		's16le',
		'-ar',
		'44100',
		'-ac',
		'2',
		// "-re",         // * encode at 1x playback speed, to not burn the CPU
		'-i',
		'pipe:', // * input from pipe (stdout->stdin)
		// "-ar", "44100", // * AV sampling rate
		// "-c:a", "flac", // * audio codec
		// "-sample_fmt", "44100", // * sampling rate
		'-ac',
		'2', // * audio channels, chromecasts don't support more than two audio channels
		// "-f", "mp4", // * fmt force format
		'-bits_per_raw_sample',
		'8',
		'-f',
		'adts',
		'pipe:1' // * output to pipe (stdout->)
	];
	isOk: boolean = true;

	constructor(deviceInfo: DeviceConfig) {
		super('sps:ffmpeg');
		// * check to see if file exists
		this.inform('Resolving Configuration');
		const [_path, configuration] = this.args(deviceInfo);
		this._args = configuration;
		if (!this.isOk) {
			this.debugMe('WARNING: NOT Okay', _path, 'Sending an unAvalable event');
			this.state = {
				configPath: _path,
				content: null,
				// content: listener as Buffer,
				id: 'Sps',
				templateConfiguration: this.parsedConfiguration(),
				status: 'notSetup'
			} as Sps;
			this.unavailableEvent.emit(this.state);
			const some = super.updateService(this.State);
			this.debugMe('WARNING: UpdateService', _path, `${some}`);
		} else {
			this.state = {
				configPath: _path,
				content: null,
				// content: listener as Buffer,
				id: 'Sps',
				templateConfiguration: this.parsedConfiguration(),
				status: 'notStarted'
			} as Sps;
			this.availableEvent.emit(this.state);
			const some = super.updateService(this.State);
			this.ok('ok: UpdateService', _path, `${some}`);
		}
	}
	public start() {
		this.inform('Spawning Shairport Sync');
		this._proc = spawn('shairport-sync', this._args); //? configuration
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
			// this.debug('listening', listener);
			this.availableEvent.emit({
				configPath: this._args[1],
				content: listener as Buffer,
				id: 'Sps',
				templateConfiguration: this.parsedConfiguration(),
				status: 'ok'
			});
		});
	}
	private get spsError() {
		return this.logger.spsError;
	}
	private get ffmpegError() {
		return this.logger.ffmpegError;
	}
	get State() {
		return this.state;
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

	protected override logAndEmitError(
		error: Error,
		namepaceSegment?: string,
		message: string = 'true'
	): void {
		switch (namepaceSegment) {
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

	private args(info: DeviceConfig): [string, Array<string>] {
		if (this._args.length === 2) {
			this.logAndEmitError(
				new Error(`Arguments for shairport-sync have already been set: ${this._args}`),
				'SPS.args():'
			);
		} else {
			let fileName: string = info.name
				.split(' ')
				.map((v, i) => {
					return i > 0 ? v.charAt(0).toUpperCase() + v.substring(1) : v;
				})
				.join('');
			const pForm = platform();
			switch (pForm) {
				// case: 'aix'
				case 'openbsd':
				case 'freebsd':
				case 'linux': //
					fileName = `/etc/shairport-sync${fileName}.conf`;
					break;
				// case 'darwin':
				// case 'sunos':
				// case: 'win32':
			}
			if (existsSync(fileName)) {
				this.debugMe('File Found!', fileName);
				this.isOk = true;
				this._args.push(fileName);
			} else {
				this.debugMe(
					'WARNING: Attempting to generate a configuration!',
					info.name,
					`on platform ${pForm}`
				);
				this.isOk = false;
				return [fileName, this._args];
				// this.destroy();
				// return this.createConfFile(info);
			}
		}
		return [this._args[1], this._args];
	}

	private createConfFile(config: DeviceConfig, specificSection?: string): [string, Array<string>] {
		//* resolve file path based on OS
		this.isOk = false;
		// const name =
		let fileName: string = config.name
			.split(' ')
			.map((v, i) => {
				return i > 0 ? v.charAt(0).toUpperCase() + v.substring(1) : v;
			})
			.join('');
		switch (platform()) {
			// case: 'aix'
			// case 'darwin':
			case 'openbsd':
			case 'freebsd':
			case 'linux': //
				fileName = `/etc/shairport-sync${fileName}.conf`;
				break;
			// case 'sunos':
			// case: 'win32':
			default:
				this.spsError('SPS.createConfFile:', `${platform()} is NOT supported`);
				this.destroy();
		}
		//* get the template
		const template = SPS.parseConfiguration();
		//* modify them for the specific device
		if (!this.destroyed) {
			const revised = UpdateFields(config, template, specificSection);
			writeFileSync(fileName, SectionsWriter(revised), 'utf-8');
		}
		this._args.push(fileName);
		return [fileName, this._args];
	}

	private static preloadConfig(path?: string) {
		return JSON.parse(readFileSync(PWD + '/src/lib/server/sps/spsConfig.json', 'utf-8'));
	}

	protected parsedConfiguration(config?: object): ParsedConfiguration {
		const data = Array<{ title: string; description: string[]; children: Map<string, KV> }>();
		// console.info(layOutdata)
		const dataObj = config ?? Object(SPS.preloadConfig());
		Object.entries(dataObj).forEach((entry) => {
			const props = entry[1] as Object;
			const comments = (props as any)['_comments'] as object;
			const des = (comments as any)['_description'] as string[];
			let childsMap = new Map<string, KV>();
			const childs = Object.entries(props); // .filter((elem) => { elem[0] !== '_comments' })
			// console.info(childs)
			for (let [key, value] of childs) {
				if (key == '_comments') {
					continue;
				}
				// console.log(key, value);
				childsMap = childsMap.set(key, value as KV);
			}
			// console.log(comments)
			data.push({ title: entry[0], description: des, children: childsMap });
		});
		return data;
	}

	protected static parseConfiguration(config?: object) {
		const dataObj = config ?? new Object(SPS.preloadConfig());
		// return Object.setPrototypeOf(dataObj, Sections).map(([sectionName, section]) => {
		//     return [sectionName, Object.setPrototypeOf]
		// })
		return Object.setPrototypeOf(dataObj, Object({} as Sections)) as Sections;
	}

	protected static parseConfigurationTry(config?: object) {
		const dataObj = config ?? Object(SPS.preloadConfig());
		return Object.fromEntries(
			Object.entries<Section>(dataObj).map((entry) => {
				const sect = entry[1] as Section;
				let childsMap = new Map<string, KV>();
				const props = Object.entries(sect).filter((elem) => {
					elem[0] !== '_comments';
				});
				// console.info(childs)
				for (let [key, value] of props) {
					if (key == '_comments') {
						continue;
					}
					// console.log(key, value);
					childsMap = childsMap.set(key, value as KV);
				}
				return [
					entry[0],
					new Object(Object.defineProperties(sect, Object.fromEntries(childsMap.entries())))
				];
				// console.log(SectionWriter(entry[0], sect))
			})
		);
	}
}
