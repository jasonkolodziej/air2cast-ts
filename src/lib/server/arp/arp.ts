import {ChildProcess, spawn} from 'child_process';
import { isIP } from 'net';
import { MAC } from '$lib/server/mac/MAC';
import { type Subscribable, createEventAdapter } from 'atvik';
import { Readable } from 'stream';
import { BasicServiceDiscovery } from 'tinkerhub-discovery';
import { ArpCall, 
  type ArpDataService } from './types';

// export abstract class AbstractArpService 
// extends AbstractServicePublisher implements ArpServicePublisher {
//   protected readonly parent: ArpServicePublisher = this;
//   protected abstract event: Event<this, [EventCall, [String, ArpDataEntry]]>;
//   private  serviceMap: Map<String, ArpDataEntry> = new Map();
//   private readonly  _parent: Subscribable<Readable, any[]>;
//   readonly _type: ArpCall;
//   private  _proc: ChildProcess;

//   constructor(_type: ArpCall = ArpCall.ALL,
//     parent?: ArpServicePublisher, ipAddress?: string) {
//       super('arp'+_type.toString())
//       this._type = _type;

//       if(parent !== undefined) {
//         console.debug('parent was defined')
//         this.parent = parent;
//         this.parent.onEvents.subscribe(this.withEvent);
//         // this.event = new Event(this.parent);
//       } else {
//         // this.event = new Event(this);
//       }

//       const args = new Array<string>();
//       args.push(this._type);
//       switch(this._type) {
//         case ArpCall.NAMED: 
//         switch(isIP(ipAddress!)) {
//           case 4:
//             args.push(ipAddress!);
//           default:
//           this.logAndEmitError(
//             new Error(`Arp: ${ipAddress}, type: ${isIP(ipAddress!)} was not validated properly.`)
//           );
//         }
//       }
//       // console.debug(args);
//       this._proc = spawn('arp', args);
//       this._proc.stderr?.on('data', (err) => this.logAndEmitError(err));
//       // this.errorEvent.subscribe((msg) => this.logAndEmitError(msg));
//       this._parent = createEventAdapter(this._proc.stdout!, 'data');
//       console.debug('arp type creating: ', _type.toString(), 'with ', ipAddress)
//       this._parent.subscribe((listener) => {
//         this.debug('listening', listener);
//         this.parse(listener);
//       });
//   }

// onEvent<T = typeof EventCall>(calling: T): Subscribable<this, [T, [String, ArpDataEntry]]> {
//   return this.onEvents.filter((callType) => callType == calling) as Subscribable<this, [T, [String, ArpDataEntry]]>
// }
// /**
//  * Get all the available services.
//  */
// get services() {
//   return Array.from(this.serviceMap.values());
// }

// public get(id: string): [String, ArpDataEntry] | null {
//   const val = this.serviceMap.get(id);
//   return val ? [id, val] : null;
// }


// get onAvailable() {
//   return this.onEvent<EventCall.Available>(EventCall.Available);
// }

// get onUpdate() {
//   return this.onEvent<EventCall.Update>(EventCall.Update);
// }

// get onUnavailable() {
//   return this.onEvent<EventCall.Unavailable>(EventCall.Unavailable);
// }

// withEvent(arg0: EventCall, a1: [String, ArpDataEntry]) {
//   switch (arg0) {
//     case EventCall.Available:
//       console.debug('withEvent', `Avail ${a1[0]}`)
//       this.serviceMap.set(a1[0], a1[1])
//       return;
//     case EventCall.Update:
//       console.debug('withEvent', `Update ${a1[0]}`)
//       this.serviceMap.set(a1[0], a1[1])
//       return;
//     case EventCall.Unavailable:
//       console.debug('withEvent', `Unavail ${a1[0]}`)
//       this.serviceMap.delete(a1[0]);
//       return;
//   }
// }

// get onEvents() {
//   /*
//     * Return the subscribable of the event - which is a function that can be
//     * used to listen to the event.
//     */
//   return this.event.subscribable;
// }

//   protected get filter() { return this.onEvents.filter }

//   protected get withThis() { return this.onEvents.withThis }

//   public get once() { return this.onEvents.once }

//   // protected once = this.onEvents.once;
//   private darwinParse(data: Buffer | String): Array<ArpDataEntry> {
//     const serializedData = (data instanceof Buffer) ? data.toString() : data;
//     const dataArray = serializedData
//     return serializedData.split('\n')
//     .map( // * Split spaces and remove words from output
//       (line) => {
//         console.log(line);
//         return line.split(' ').filter(piece => piece !== 'at' && piece !== 'on' && piece !== '');
//       })
//     .filter( // * perform a check on the IP addresses and mac addresses to know if their usable
//         (item) => 
//           isIP(item.at(1)?.replace("(","").replace(")","") as string) === 4 &&
//           new MAC(item.at(2)!)
//     ) // TODO Test
//     .map((editedLine) => { // * Map the data to an interface
//         return {
//           hw_type: editedLine.pop()?.replace('[','').replace(']',''),
//           hostname: editedLine.reverse().pop() as string, // .at(0),
//           ip_address: editedLine.pop()?.replace('(','').replace(')',''), // .at(1)?.replace('(','').replace(')',''),
//           mac_address: new MAC(editedLine.pop() as string), //.at(2),
//           interface_name: editedLine.pop(), //.at(3),
//           scope: editedLine,
//         } as ArpDataEntry;
//       });
//   }

//   private nParse(data: Buffer | String): ArpDataEntry {
//     const serializedData = (data instanceof Buffer) ? data.toString() : data;
//     const dat = serializedData.split('\n')
//     .map( // * Split spaces and remove words from output
//       (line) => {
//         return line.split(' ').filter(piece => piece !== 'at' && piece !== 'on' && piece !== '');
//       }).filter(strAr => strAr.length !== 0 && strAr.find(piece => piece === 'Flags') === undefined)
//     .flat();
//     return {
//           interface_name: dat.pop(), //.at(3),
//           scope: dat.pop(),
//           mac_address: new MAC(dat.pop() as string), //.at(2),
//           hw_type: dat.pop(), //?.replace('[','').replace(']',''),
//           hostname: dat.at(1),
//           ip_address: dat.pop(), // .at(1)?.replace('(','').replace(')',''),
//     } as ArpDataEntry;
//   }

//   protected parse(data: Buffer | String):void {
//     // console.debug(`typeof ${typeof data} instanceIsString: ${data instanceof String}, instanceIsBuffer: ${data instanceof Buffer}`);
//     const dataArray = (this._type == ArpCall.NAMED) ? new Array(this.nParse(data)) : this.darwinParse(data)
//     for (const entry of dataArray) {
//       const key = entry.ip_address;
//       const hardened = {...entry, id: key as string};
//       // * check if the key exists
//       console.debug(`check if the key: ${key} exists...`)
//       if (this.serviceMap.has(key)) {
//         console.debug('emmitting an update...')
//         // * update
//         this.event.emit(EventCall.Update, [key, hardened])
//       } else {
//         // * new
//         this.event.emit(EventCall.Available, [key, hardened])
//       }
//       this.serviceMap.set(key, hardened);
//     }
//   }

// }




// export class Arp extends AbstractArpService {
// protected parent: ArpServicePublisher;
// protected event: Event<this, [EventCall, [String, ArpDataEntry]]>;

// constructor(_type: ArpCall = ArpCall.ALL,
//    ipAddress?: string, parent?: ArpServicePublisher) {
//   super(_type, parent, ipAddress);
//   console.debug('back in Arp super was defined')
//   this.parent = parent ?? this;
//   this.event = (parent !== undefined) ? new Event(this.parent) : new Event(this);
// }

// get onAvailable() {
//   console.debug('onAvailable');
//   return super.onEvent<EventCall.Available>(EventCall.Available);
// }

// get onUpdate() {
//   return this.onEvent<EventCall.Update>(EventCall.Update);
// }

// get onUnavailable() {
//   return this.onEvent<EventCall.Unavailable>(EventCall.Unavailable);
// }

// findAll(ipAddress: string): Subscribable<this, [EventCall, [String, ArpDataEntry]]> {
//   // return new Arp(ArpCall.NAMED, ipAddress, this)
//   return this.filter((_, service) => {
//    return ipAddress == service[1].ip_address
//   })
// }

// filterBy(ipAddress: string): Subscribable<this, [EventCall, [String, ArpDataEntry]]> {
//   return this.withThis(new Arp(ArpCall.NAMED, ipAddress, this)).filter((_, service) => {
//     return ipAddress == service[1].ip_address
//   });
// }

// public destroy(): Promise<void> {
//   throw new Error('Method not implemented.');
// }

// }

// TODO: tests
export class ArpDiscovery extends BasicServiceDiscovery<ArpDataService> {
  private readonly  _parent: Subscribable<Readable, any[]>;
  readonly _type: ArpCall;
  private  _proc: ChildProcess;
  // readonly _type: ArpCallType;
  constructor(_type:ArpCall = ArpCall.ALL, ipAddress?:string) {
    super('custom')
    this._type = _type;

    const args = new Array<string>();
    args.push(this._type);
    switch(this._type) {
      case ArpCall.NAMED: 
      switch(isIP(ipAddress!)) {
        case 4:
          args.push(ipAddress!);
        default:
        this.logAndEmitError(
          new Error(`Arp: ${ipAddress}, type: ${isIP(ipAddress!)} was not validated properly.`)
        );
      }
    }
    // console.debug(args);
    this._proc = spawn('arp', args);
    this._proc.stderr?.on('data', (err) => this.logAndEmitError(err));
    // this.errorEvent.subscribe((msg) => this.logAndEmitError(msg));
    this._parent = createEventAdapter(this._proc.stdout!, 'data');
    console.debug('arp type creating: ', _type.toString(), 'with ', ipAddress)
    this._parent.subscribe((listener) => {
      this.debug('listening', listener);
      this.parse(listener);
    });
  }

  private aParse(data: Buffer | String): Array<ArpDataService> {
    const serializedData = (data instanceof Buffer) ? data.toString() : data;
    const dataArray = serializedData
    return serializedData.split('\n')
    .map( // * Split spaces and remove words from output
      (line) => {
        console.log(line);
        return line.split(' ').filter(piece => piece !== 'at' && piece !== 'on' && piece !== '');
      })
    .filter( // * perform a check on the IP addresses and mac addresses to know if their usable
        (item) => 
          isIP(item.at(1)?.replace("(","").replace(")","") as string) === 4 &&
          new MAC(item.at(2)!)
    ) // TODO Test
    .map((editedLine) => { // * Map the data to an interface
      console.debug(editedLine)
        const part = {
          interface_name: editedLine.pop(), //.at(3),
          hw_type: editedLine.pop()?.replace('[','').replace(']',''),
          hostname: editedLine.reverse().pop() as string, // .at(0),
          ip_address: editedLine.pop()?.replace('(','').replace(')',''), // .at(1)?.replace('(','').replace(')',''),
          mac_address: new MAC(editedLine.pop() as string), //.at(2),
          scope: editedLine,
          CallType: this._type,
        };
        return {
          ...part,
          id: part.hostname,
        } as ArpDataService;
      });
  }

  private nParse(data: Buffer | String): ArpDataService {
    const serializedData = (data instanceof Buffer) ? data.toString() : data;
    const dat = serializedData.split('\n')
    .map( // * Split spaces and remove words from output
      (line) => {
        return line.split(' ').filter(piece => piece !== 'at' && piece !== 'on' && piece !== '');
      }).filter(strAr => strAr.length !== 0 && strAr.find(piece => piece === 'Flags') === undefined)
    .flat();
    const part =  {
      interface_name: dat.pop(), //.at(3),
      scope: dat.pop(),
      mac_address: new MAC(dat.pop() as string), //.at(2),
      hw_type: dat.pop(), //?.replace('[','').replace(']',''),
      hostname: dat.at(1),
      ip_address: dat.pop(), // .at(1)?.replace('(','').replace(')',''),
      CallType: this._type,
    };
    return {
      ...part,
      id: part.hostname,
    } as ArpDataService;
  }

  protected parse(data: Buffer | String):void {
    // console.debug(`typeof ${typeof data} instanceIsString: ${data instanceof String}, instanceIsBuffer: ${data instanceof Buffer}`);
    const dataArray = (this._type == ArpCall.NAMED) ? new Array(this.nParse(data)) : this.aParse(data)
    for (const entry of dataArray) {
      const key = entry.ip_address;
      const hardened = {...entry, id: key as string};
      // * check if the key exists
      console.debug(`check if the key: ${key} exists...`)
      if (this.get(key as string) !== null) {
        console.debug('emmitting an update...')
        // * update
        // this.updateService(hardened)
      } else {
        // * new
        // this.event.emit(EventCall.Available, [key, hardened])
      }
      this.updateService(hardened);
      // this.serviceMap.set(key, hardened);
    }
  }

}