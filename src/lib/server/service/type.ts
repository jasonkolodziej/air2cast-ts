import { type Subscribable, Event } from "atvik";
import pkg from 'debug';
const {debug} = pkg;
/*
 * Service this is published for the discovery. A published service is exposed
 * and discoverable until `destroy()` is called.
 */
export interface ServicePublisher {
	/*
	 * Event emitted when an error occurs during publishing.
	 */
	readonly onError: Subscribable<this, [ Error ]>;

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
	protected readonly debug: debug.Debugger;
	/*
	 * Event used to emit errors for this publisher.
	 */
	protected readonly errorEvent: Event<this, [ Error ]>;

	constructor(type: string) {
		this.debug = debug('arp:discovery:publisher:' + type);

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
		this.debug(message, error);
		this.errorEvent.emit(error);
	}

	/* 
	 * Destroy this instance.
	 */
	public abstract destroy(): Promise<void>;
}


export abstract class AbstractDestroyable extends AbstractServicePublisher {
    /**
	 * Get if this discovery has been destroyed.
	 */
	private _destroyed: boolean;
	/**
	 * Event used to emit when this discovery is destroyed.
	 */
	private readonly destroyEvent: Event<this>;

    constructor(type: string){
        super('destroyable' + type)
        this._destroyed = false;
		this.destroyEvent = new Event(this);
    }

    public destroy(): Promise<void> {
		if(this.destroyed) return Promise.resolve();

		this._destroyed = true;
		this.destroyEvent.emit();

		return Promise.resolve();
	}

    protected abstract beforeDestroy(): Promise<void>;

    get destroyed() {
		return this._destroyed;
	}
}