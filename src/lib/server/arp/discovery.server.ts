import {ChildProcess, spawn} from 'child_process';
import { isIP } from 'net';
import { MAC } from '$lib/server/mac/MAC';
import { type Subscribable, createEventAdapter } from 'atvik';
import { Readable } from 'stream';
import { BasicServiceDiscovery } from 'tinkerhub-discovery';
import { ArpCall, 
  type ArpDataService } from '$lib/server/arp/types';
import { WinstonLogger, type Logger } from '../service/types';
import { debug } from 'winston';

// TODO: tests
export class ArpDiscovery extends BasicServiceDiscovery<ArpDataService> {
  private readonly  _parent: Subscribable<Readable, any[]>;
  readonly _type: ArpCall;
  private  _proc: ChildProcess;
  private readonly _l: Logger = WinstonLogger();
  // readonly _type: ArpCallType;
  constructor(_type:ArpCall = ArpCall.ALL, ipAddress?:string) {
    super('service:arp')
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
          new Error(`Arp: ${ipAddress}, type: ${isIP(ipAddress!)} was not validated properly.`),
          'arp'
        );
      }
    }
    // console.debug(args);
    this._proc = spawn('arp', args);
    this._proc.stderr?.on('data', (err) => this.logAndEmitError(Error(err), 'arp'));
    // this.errorEvent.subscribe((msg) => this.logAndEmitError(msg));
    this._parent = createEventAdapter(this._proc.stdout!, 'data');
    console.debug('arp type creating: ', _type.toString(), 'with ', ipAddress)
    this._parent.subscribe((listener) => {
      this.debug('listening', listener);
      this.parse(listener);
    });
  }

  protected override logAndEmitError(error: Error, namepaceSegment?: string, message: string = 'true'): void {
    switch(namepaceSegment) {
        case 'arp':
          this._l.debug(error);
          break;
        default:
        if (message !== 'true') {
            super.logAndEmitError(error, message);
        }
    }
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
        this._l.debug('emmitting an update...', debug);
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
