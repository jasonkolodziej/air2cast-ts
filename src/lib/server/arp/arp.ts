import {ChildProcess, spawn} from 'child_process';
import { isIP } from 'net';
import { MAC } from '$lib/server/mac/MAC';
import { Event, type Subscribable, createEventAdapter } from 'atvik';
import { Readable } from 'stream';
import { AbstractServicePublisher, type ServicePublisher } from '../service/type';
export interface ArpDataEntry {
  hostname: String;
  ip_address: String;
  mac_address: MAC;
  interface_name: String;
  scope: String | String[];
  hw_type: String;
};

export interface ArpServicePublisher extends ServicePublisher {
  onEvent<T = EventCall>(calling:T): Subscribable<this, [typeof calling, [String, ArpDataEntry]]>;
  readonly onEvents: Subscribable<this, [EventCall, [ String, ArpDataEntry ]]>;
// readonly onUnavailable: Subscribable<this, [ ArpDataEntry ]>;
}

export type ArpCallType = keyof typeof ArpCall;
export enum ArpCall {
  ALL = '-a',
  NAMED = '-n'
}

export enum EventCall {
  Available,
  Unavailable,
  Update,
  Destroy
}

export type EventCallType = keyof typeof EventCall;

export abstract class AbstractArpService 
extends AbstractServicePublisher implements ArpServicePublisher {
  protected readonly parent: ArpServicePublisher = this;
  protected abstract event: Event<this, [EventCall, [String, ArpDataEntry]]>;
  private  serviceMap: Map<String, ArpDataEntry> = new Map();
  private readonly  _parent: Subscribable<Readable, any[]>;
  readonly _type: ArpCall;
  private  _proc: ChildProcess;

  constructor(_type: ArpCall = ArpCall.ALL,
    parent?: ArpServicePublisher, ipAddress?: string) {
      super('arp'+_type.toString())
      this._type = _type;

      if(parent !== undefined) {
        console.debug('parent was defined')
        this.parent = parent;
        this.parent.onEvents.subscribe(this.withEvent);
        // this.event = new Event(this.parent);
      } else {
        // this.event = new Event(this);
      }

      const args = new Array<string>();
      args.push(this._type);
      switch(this._type) {
        case ArpCall.NAMED:
        if(!isIP(ipAddress!)) 
        switch(isIP(ipAddress!)) {
          case 4:
            args.push(ipAddress!);
          default:
          this.logAndEmitError(
            new Error(`Arp: ${ipAddress}, type: ${isIP(ipAddress!)} was not validated properly.`)
          );
        }
      }
      this._proc = spawn('arp', args);
      this._proc.stderr?.on('data', (err) => this.logAndEmitError(err));
      // this.errorEvent.subscribe((msg) => this.logAndEmitError(msg));
      this._parent = createEventAdapter(this._proc.stdout!, 'data');
      console.debug('arp type creating: ', _type.toString())
      this._parent.subscribe((listener) => {
        this.debug('listening', listener);
        this.parse(listener);
      });
  }

onEvent<T = typeof EventCall>(calling: T): Subscribable<this, [T, [String, ArpDataEntry]]> {
  return this.onEvents.filter((callType) => callType == calling) as Subscribable<this, [T, [String, ArpDataEntry]]>
}
/**
 * Get all the available services.
 */
get services() {
  return Array.from(this.serviceMap.values());
}

public get(id: string): [String, ArpDataEntry] | null {
  const val = this.serviceMap.get(id);
  return val ? [id, val] : null;
}


get onAvailable() {
  return this.onEvent<EventCall.Available>(EventCall.Available);
}

get onUpdate() {
  return this.onEvent<EventCall.Update>(EventCall.Update);
}

get onUnavailable() {
  return this.onEvent<EventCall.Unavailable>(EventCall.Unavailable);
}

withEvent(arg0: EventCall, a1: [String, ArpDataEntry]) {
  switch (arg0) {
    case EventCall.Available:
      console.debug('withEvent', `Avail ${a1[0]}`)
      this.serviceMap.set(a1[0], a1[1])
      return;
    case EventCall.Update:
      console.debug('withEvent', `Update ${a1[0]}`)
      this.serviceMap.set(a1[0], a1[1])
      return;
    case EventCall.Unavailable:
      console.debug('withEvent', `Unavail ${a1[0]}`)
      this.serviceMap.delete(a1[0]);
      return;
  }
}

get onEvents() {
  /*
    * Return the subscribable of the event - which is a function that can be
    * used to listen to the event.
    */
  return this.event.subscribable;
}

  protected get filter() { return this.onEvents.filter }

  protected get withThis() { return this.onEvents.withThis }

  // protected once = this.onEvents.once;

  protected parse(data: Buffer | String):void {
    console.debug(`typeof ${typeof data} instanceIsString: ${data instanceof String}, instanceIsBuffer: ${data instanceof Buffer}`);
    const serializedData = (data instanceof Buffer) ? data.toString() : data;
    const dataArray = serializedData.split('\n')
      .map( // * Split spaces and remove words from output
        (line) => {
          return line.split(' ').filter(piece => piece !== 'at' && piece !== 'on' && piece !== '');
        })
      .filter( // * perform a check on the IP addresses and mac addresses to know if their usable
          (item) => 
            isIP(item.at(1)?.replace("(","").replace(")","") as string) === 4 &&
            new MAC(item.at(2)!)
      )
      // .map((editedLine) => { // * Map the data to an interface
      //   return {
      //     hw_type: editedLine.pop()?.replace('[','').replace(']',''),
      //     hostname: editedLine.reverse().pop() as string, // .at(0),
      //     ip_address: editedLine.pop()?.replace('(','').replace(')',''), // .at(1)?.replace('(','').replace(')',''),
      //     mac_address: new MAC(editedLine.pop() as string), //.at(2),
      //     interface_name: editedLine.pop(), //.at(3),
      //     scope: editedLine,
      //   } as ArpDataEntry;
      // });
    // if(this._type == ArpCall.NAMED) {
    //   console.log('parse for named')
    // }
    for (const editedLine of dataArray) {
      let entry = {
        hw_type: new String(editedLine.pop()?.replace('[','').replace(']','')),
        hostname: new String(editedLine.reverse().pop()), // .at(0),
        ip_address: new String(editedLine.pop()?.replace('(','').replace(')','')), // .at(1)?.replace('(','').replace(')',''),
        mac_address: new MAC(editedLine.pop() as string), //.at(2),
        interface_name: new String(editedLine.pop()), //.at(3),
       scope: editedLine,
        id: ''
      } as ArpDataEntry;
      const key = entry.ip_address;
      const hardened = {...entry, id: key as string};
      // * check if the key exists
      if (this.serviceMap.has(key)) {
        console.debug('emmitting an update...')
        if(this._type == ArpCall.NAMED) {
          console.debug('parse.Update', key)
        }
        // * update
        this.event.parallelEmit(EventCall.Update, [key, hardened])
      } else {
        // * new
        if(this._type == ArpCall.NAMED) {
          console.debug('parse.Avail', key)
        }
        this.event.parallelEmit(EventCall.Available, [key, hardened])
      }
      this.serviceMap.set(key, hardened);
    }
  }

}




export class Arp extends AbstractArpService {
  protected parent: ArpServicePublisher;
  protected event: Event<this, [EventCall, [String, ArpDataEntry]]>;

  constructor(_type: ArpCall = ArpCall.ALL,
    ipAddress?: string, parent?: ArpServicePublisher) {
    super(_type, parent);
    console.debug('back in Arp parent was defined')
    this.parent = parent!;
    this.event = (parent !== undefined) ? new Event(this.parent) : new Event(this);
  }

  get onAvailable() {
    return this.onEvent<EventCall.Available>(EventCall.Available);
  }

  get onUpdate() {
    return this.onEvent<EventCall.Update>(EventCall.Update);
  }

  get onUnavailable() {
    return this.onEvent<EventCall.Unavailable>(EventCall.Unavailable);
  }

  findAll(ipAddress: string): Subscribable<this, [EventCall, [String, ArpDataEntry]]> {
    // return new Arp(ArpCall.NAMED, ipAddress, this)
    return this.filter((_, service) => {
    return ipAddress == service[1].ip_address
    })
  }

  filterBy(ipAddress: string): Subscribable<this, [EventCall, [String, ArpDataEntry]]> {
    return this.withThis(new Arp(ArpCall.NAMED, ipAddress, this)).filter((_, service) => {
      return ipAddress == service[1].ip_address
    });
  }

  public destroy(): Promise<void> {
    throw new Error('Method not implemented.');
  }

}