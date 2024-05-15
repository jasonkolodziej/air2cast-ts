import { createLogger, type MethodList } from '@lvksh/logger';
import type { Logger as ChaLogger } from '@lvksh/logger';
import { type Subscribable, Event } from 'atvik';
import chalk from 'chalk';
// import pkg from 'debug';
import winston from 'winston';
import Transport from 'winston-transport';
// * helpful exports
// const { debug } = pkg;
const { combine, timestamp, printf, colorize, align } = winston.format;
export type WinstonLogger = winston.Logger;
export type Logger = WinstonLogger | ChaLogger<string>;
export type Entry = winston.LogEntry;

// export const NewLogEntry = (level, messasge, opts):Entry => {return {} as Entry;}

/**
 * WinstonLogger constructs a Logger from pkg [`winston`](https://www.npmjs.com/package/winston#multiple-transports-of-the-same-type)
 * @returns winston.Logger class object
 */
export const WinstonLogger = (serviceType?: string): WinstonLogger => {
	const logger = winston.createLogger({
		level: process.env.LOG_LEVEL || 'debug',
		// format: winston.format.json(),
		format: combine(
			colorize({ all: true }),
			timestamp({
				format: 'YYYY-MM-DD hh:mm:ss.SSS A'
			}),
			align(),
			printf((info) => `[${info.timestamp}] ${info.level}: ${info.service} ${info.message}`)
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
export abstract class AbstractServicePublisher implements ServicePublisher {
	/*
	 * Debugger that can be used to output debug messages for the publisher.
	 */
	protected readonly debug: Logger;
	/*
	 * Event used to emit errors for this publisher.
	 */
	protected readonly errorEvent: Event<this, [Error]>;

	constructor(type: string) {
		// this.debug = debug('arp:discovery:publisher:' + type);
		this.debug = WinstonLogger(type);
		this.logger.debug(`type of:(${type})`, () => {});
		// this.logger.info('HELLO');
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
		this.logger.error(message, error.cause);
		// this.logger.emit('logged', message);
		// this.debug(message, error);
		this.errorEvent.emit(error);
	}

	protected get logger() {
		return this.debug;
	}

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

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
export class YourCustomTransport extends Transport {
	constructor(opts: winston.transport.TransportStreamOptions | undefined) {
		super(opts);
		//
		// Consume any custom options here. e.g.:
		// - Connection information for databases
		// - Authentication information for APIs (e.g. loggly, papertrail,
		//   logentries, etc.).
		//
	}

	log(info: any, callback: () => void) {
		setImmediate(() => {
			this.emit('logged', info);
		});

		// Perform the writing to the remote service
		callback();
	}
}
