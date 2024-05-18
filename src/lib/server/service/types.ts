import { createLogger, type MethodList } from '@lvksh/logger';
import type { Logger as ChaLogger } from '@lvksh/logger';
import { type Subscribable, Event } from 'atvik';
import chalk from 'chalk';
import {
	AbstractServiceDiscovery,
	BasicServiceDiscovery,
	type AdvancedMapper,
	type Mapper,
	type Service,
	type ServiceDiscovery,
	type ServicePredicate
} from 'tinkerhub-discovery';
// import pkg from 'debug';
import winston, { type LeveledLogMethod } from 'winston';
// import { LabelOptions } from 'winston';
import Transport from 'winston-transport';
import type { Sps } from '../sps/types';
// * helpful exports
// const { debug } = pkg;
const { combine, timestamp, printf, colorize, align, label } = winston.format;
const { debug, info } = winston;
export type WinstonLogger = winston.Logger;
export type Logger = WinstonLogger | ChaLogger<string>;
export type Entry = winston.LogEntry;
// type LogFunction = winston.LogMethod

// export const NewLogEntry = (level, messasge, opts):Entry => {return {} as Entry;}

/**
 * WinstonLogger constructs a Logger from pkg [`winston`](https://www.npmjs.com/package/winston#multiple-transports-of-the-same-type)
 * @returns winston.Logger class object
 */
export const WinstonLogger = (serviceType?: string): WinstonLogger => {
	const logger = winston.createLogger({
		level: process.env.LOG_LEVEL || 'debug',
		// format: winston.format.json(),
		// format: combine(
		// 	colorize({ all: true }),
		// 	timestamp({
		// 		format: 'YYYY-MM-DD hh:mm:ss.SSS A'
		// 	}),
		// 	align(),
		// 	printf((info) => `[${info.timestamp}] ${info.level}: ${info.service} ${info.message}`)
		// ),
		format: combine(
			colorize({ all: true }),
			timestamp({
				format: 'YYYY-MM-DD hh:mm:ss.SSS A'
			}),
			// label({ message: false, label: 'OH NO' }),
			label({ message: false, label: 'Test?' }),
			align(),
			printf(AbstractDestroyableService.WinstonFormatTemplate)
		),
		defaultMeta: { service: 'service-' + serviceType },
		transports: [
			//
			// - Write all logs with importance level of `error` or less to `error.log`
			// - Write all logs with importance level of `info` or less to `combined.log`
			//
			// new winston.transports.File({ filename: 'error.log', level: 'error' }),
			// new winston.transports.File({ filename: 'combined.log' }),
			// new winston.transports.Http({
			// 	level: 'warn',
			// 	format: winston.format.json()
			// }),
			// new winston.transports.Console({
			// 	level: 'info',
			// 	format: winston.format.combine(
			// 	  winston.format.colorize(),
			// 	  winston.format.simple()
			// 	)
			// })
			new winston.transports.Console()
		]
	});
	// logger.defaultMeta();
	//
	// If we're not in production then log to the `console` with the format:
	// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
	if (process.env.NODE_ENV !== 'production') {
		// //? Streaming
		// //
		// // Start at the end.
		// //
		// winston.stream({ start: -1 }).on('log', function(log) {
		// 	console.log(log);
		// });
		// logger.add(new winston.transports.Console({
		// 	format: winston.format.combine(
		// 		winston.format.simple(),
		// 		winston.format.colorize()
		// 	)}
		// ));
	}
	return logger;
};

/**
 * ChalkLogger constructs a Logger from pkg [`@v3xlabs/logger`](https://github.com/v3xlabs/logger)
 * @returns Logger, alias ChaLogger typed object
 */
export const ChalkLogger = <S extends string>(otherConfigs: MethodList<S>): ChaLogger<S> =>
	createLogger(
		{
			ok: {
				label: chalk.greenBright(`[OK]`),
				newLine: '| ',
				newLineEnd: '\\-'
			},
			debug: chalk.magentaBright(`[DEBUG]`),
			info: {
				label: chalk.cyan(`[INFO]`),
				newLine: chalk.cyan(`⮡`),
				newLineEnd: chalk.cyan(`⮡`)
			},
			...otherConfigs
		},
		{
			padding: 'PREPEND'
			//     preProcessors: [
			//         (inputs, { name, err }) => {
			//             let index = 0;

			//             return inputs.map(it => `[Called ${name} ${++index} times] ${it}`);
			//         }
			// ]
		},
		console.log
	);

export const serializeNonPOJOs = (value: object | null) => {
	return structuredClone(value);
};

interface Serializable<T> {
	/**
	 * serialize(value: T | null): object
	 */
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

/*
 * Service this is published for the discovery. A published service is exposed
 * and discoverable until `destroy()` is called.
 */
export interface ServicePublisher {
	/*
	 * Event emitted when an error occurs during publishing.
	 */
	readonly onError: Subscribable<this, [Error]>;
	/**
	 * Destroy the publisher, effectively unpublishing the service.
	 */
	destroy(): Promise<void>;
}

/*
 * Abstract base class to simplify implementation of publishers.
 */
export abstract class AbstractServicePublisher
	// extends AbstractServiceDiscovery<P>
	implements ServicePublisher
{
	/*
	 * Debugger that can be used to output debug messages for the publisher.
	 */
	protected readonly _debug: Logger;
	/*
	 * Event used to emit errors for this publisher.
	 */
	protected readonly errorEvent: Event<this, [Error]>;

	constructor(type: string, logger: Logger = WinstonLogger(type)) {
		this._debug = logger;
		// this.logger.debug(`type of:(${type})`, () => {});
		this.errorEvent = new Event(this);
	}

	get onError() {
		return this.errorEvent.subscribable;
	}

	/*
	 * Log and emit an error for this discovery.
	 *
	 * @param error
	 */
	protected logAndEmitError(error: Error, message: string = 'An error occurred:') {
		this.error(message, error.cause);
		// this.logger.emit('logged', message);
		// this.debug(message, error);
		this.errorEvent.emit(error);
	}

	protected get logger() {
		return this._debug;
	}
	protected debug = (a: any, ...aa: any[]) =>
		this.logFormatter.bind(this.debug)(this.logger.debug as LeveledLogMethod, a, ...aa);

	protected info = (a: any, ...aa: any[]) =>
		this.logFormatter.bind(this.info)(this.logger.info as LeveledLogMethod, a, ...aa);

	protected crit = (a: any, ...aa: any[]) =>
		this.logFormatter.bind(this.crit)(this.logger.crit as LeveledLogMethod, a, ...aa);

	protected emerg = (a: any, ...aa: any[]) =>
		this.logFormatter.bind(this.emerg)(this.logger.emerg as LeveledLogMethod, a, ...aa);

	protected warn = (a: any, ...aa: any[]) =>
		this.logFormatter.bind(this.warn)(this.logger.warn as LeveledLogMethod, a, ...aa);

	protected error = (a: any, ...aa: any[]) =>
		this.logFormatter.bind(this.error)(this.logger.error as LeveledLogMethod, a, ...aa);

	private logFormatter(f: LeveledLogMethod, a: any, ...aa: any[]): Logger {
		const newLine = '├-';
		const newLineEnd = '└-';
		const last = aa.pop();
		// const pad = aa.map((a) => String(a).padStart(3, ''));
		let format = `${a}`;
		for (const item of aa) {
			format += `\n\t     ${newLine} ${item}`;
		}
		if (last !== undefined) {
			format += `\n\t     ${newLineEnd} ${last}`;
		}
		// console.log(f);
		return f(format);
	}

	protected static logFormatterStatic(f: LeveledLogMethod, a: any, ...aa: any[]): Logger {
		const newLine = '├-';
		const newLineEnd = '└-';
		const last = aa.pop();
		// const pad = aa.map((a) => String(a).padStart(3, ''));
		let format = `${a}`;
		for (const item of aa) {
			format += `\n\t     ${newLine} ${item}`;
		}
		if (last !== undefined) {
			format += `\n\t     ${newLineEnd} ${last}`;
		}
		// console.log(f);
		return f(format);
	}

	static WinstonFormatTemplate = (info: winston.Logform.TransformableInfo): string => {
		// const upperLevel = String(info.level).toUpperCase();
		return info.label !== undefined
			? `[${info.timestamp}]:\t${info.service}\n   [${String(info.label).toUpperCase()}:${info.level}]${info.message}`
			: `[${info.timestamp}]:\t${info.service}\n\t [${info.level}]${info.message}`;
	};

	/*
	 * Destroy this instance.
	 */
	public abstract destroy(): Promise<void>;
}

export abstract class AbstractDestroyableService extends AbstractServicePublisher {
	/**
	 * Get if this discovery has been destroyed.
	 */
	private _destroyed: boolean;
	/**
	 * Event used to emit when this discovery is destroyed.
	 */
	private readonly destroyEvent: Event<this>;

	constructor(type: string) {
		super('destroyable:' + type);
		this._destroyed = false;
		this.destroyEvent = new Event(this);
	}

	public destroy(): Promise<void> {
		if (this.destroyed) return Promise.resolve();

		this._destroyed = true;
		this.destroyEvent.emit();

		return Promise.resolve();
	}

	protected abstract beforeDestroy(): Promise<void>;

	get destroyed() {
		return this._destroyed;
	}

	get onDestroy() {
		return this.destroyEvent.subscribable;
	}
}

export abstract class BasicServiceDiscoveryJ<
		Provider extends BasicServiceDiscoveryJ,
		S extends Service
	>
	extends BasicServiceDiscovery<S>
	implements AbstractDestroyableService
{
	protected _debug: Logger;
	protected errorEvent: Event<this, [Error]>;
	protected get logger(): Logger {
		return this._debug;
	}
	private _provider: Provider;
	constructor(type: string, logger: Logger = WinstonLogger(type)) {
		super(type);
		this.errorEvent = new Event(this);
		super.logAndEmitError.bind(this.logAndEmitError);
		this._debug = logger;
		this.emerg = this.logger.emerg;
		this.info = this.logger.info;
		this.crit = this.logger.crit;
		this.warn = this.logger.warn;
		this.error = this.logger.error;
		this.setServices = super.setServices;
		this.updateService = super.updateService;
		this.removeService = super.removeService;
	}
	protected set provider(parent: Provider) {
		this._provider = parent;
	}
	// protected logFormatter = (f: LeveledLogMethod, a: any, ...aa: any[]): Logger => // AbstractServicePublisher()
	public abstract beforeDestroy(): Promise<void>;

	protected info: (a: any, ...aa: any[]) => Logger;
	protected crit: (a: any, ...aa: any[]) => Logger;
	protected emerg: (a: any, ...aa: any[]) => Logger;
	protected warn: (a: any, ...aa: any[]) => Logger;
	protected error: (a: any, ...aa: any[]) => Logger;

	protected updateService: (service: S) => S | null;
	protected setServices: (services: Iterable<S>) => void;
	protected removeService: (service: string | S) => S | null;
}
