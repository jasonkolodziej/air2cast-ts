import {MDNSServiceDiscovery, type MDNSService} from 'tinkerhub-mdns'
import { _connect, _disconnect, mdnsServiceOpt } from './chromecastHandler.server'
import { writable, type Readable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store'
import {PersistentClient, ReceiverController} from '@foxxmd/chromecast-client'
import type { PersistentClientOptions } from '@foxxmd/chromecast-client/dist/cjs/src/persistentClient'
import { type MAC } from './mac/MAC';
import type { Subscribable } from 'atvik';
import { ArpDataCache, arpDevice, type ArpData } from './arp.server'
// import { Injectable } from ''

/**
 * ex: https://developer.spotify.com/documentation/commercial-hardware/implementation/guides/zeroconf
* docs: https://github.com/thingbound/tinkerhub-mdns/tree/master
        // Listen for services as they become available
        // export const onAvailable = discoverChromeCast.onAvailable

        // discoverChromeCast.(service => {
        //     console.log()
        //     // Service available
        //   });
        // And for updates to them, such as new network addresses
        discoverChromeCast.onUpdate(service => {
            // Service updated
        });
        
        // And for when they are no longer available
        discoverChromeCast.onUnavailable(service => {
            // Service no longer available
        });
        
        // When discovery is no longer needed destroy it
        discoverChromeCast.destroy();
 */

export const discoverChromeCast = new MDNSServiceDiscovery(mdnsServiceOpt)
export type Available = Subscribable<MDNSServiceDiscovery, [MDNSService]>
export type Update = Subscribable<MDNSServiceDiscovery, [MDNSService, MDNSService]>
export const onCastAvail: Available = discoverChromeCast.onAvailable // * emits MDNSService
export const onCastUpdate: Update = discoverChromeCast.onUpdate
export const onCastUnavail:Available = discoverChromeCast.onUnavailable



export interface DeviceServices extends MDNSService {
    receiverCtrl?: ReceiverController.Receiver;
    client?: PersistentClient;
    readonly mac_address?: MAC | String | EventListener;
    readonly configFile?: object;
    onAvailable?: Subscriber<MDNSService>; // set | listener: Listener<MDNSServiceDiscovery, [MDNSService]>
    // onUnAvailable?: Invalidator<MDNSService>;
    onUpdate?: Updater<MDNSService>; // update
    onDestroy?: Unsubscriber; // unsubscribe
}

export const ToDevice = (_eval: MDNSService, 
                        arpData?: Array<ArpData>): 
    DeviceServices => {
    console.log("inside ToDevice")
    const info = _eval.addresses.at(0) as PersistentClientOptions
    let mac = arpData?.filter(dataPkt => info.host === dataPkt.ip_address).pop();
    if (mac === undefined) { // * Did we find it?
        console.warn("still need Mac")
        // TODO: Might not handle all use cases
        arpDevice(info.host)?.stdout?.once('data', (stream) => mac = ArpDataCache(stream).pop()) 
    }
    console.warn("still need Connect")
    return {
        client: new PersistentClient(info),
        mac_address: mac?.mac_address,
        ..._eval,
    }
}

// export const UpdateDevice = (_old: DeviceServices,
//     _eval: MDNSService, 
//     arpData?: Array<ArpData>,
//     ignoreTVs?: boolean,
//     ): 
//     Promise<DeviceServices> => {
//         console.log("inside UpdateDevice")
//         _old.client?.close()
//         const info = _eval.addresses.at(0) as PersistentClientOptions
//         const mac = arpData?.filter(dataPkt => info.host === dataPkt.ip_address).pop()
//         // const {unsubscribe, set, update}
//         console.warn("still need Connect")
//         const newDS = {
//             client: new PersistentClient(info),
//             mac_address: mac?.mac_address ?? _old.mac_address,
//             ..._eval,
//         };
//         return _connect(newDS).then((val:DeviceServices) => _old = val)  // : undefined) // update filter
// }

export const StartStopNotify = (available: Available, 
    unAvailable: Available, 
    update: Update,
    arpData?: Readable<Array<ArpData>>): 
    Writable<DeviceServices> => {
        const device = writable({} as DeviceServices)
        let packets: ArpData[]
        arpData?.subscribe((pktAry) => packets = pktAry)
        available(service => {
                    console.log("SERVICE AVAIL:")
                    const d = ToDevice(service, packets)
                    !IsTv(d) ? _connect(d).then((val:DeviceServices) => device.set(val)) : null
        })
        update(service => {
            console.log("SERVICE UPDATING:")
            device.update((d) => d = ToDevice({...service, ...d}, packets))
            // device.update(oldie => // ? Should we disconnect from client?
            //     UpdateDevice(oldie, service, packets).then( 
            //         (val:DeviceServices) => oldie = val
            //     ).finally(()=> void);
            // )
        })
        unAvailable(service => {
            console.warn("SERVICE DEEMED UNAVAIL:", service)
            const unsub = device.subscribe(svc => {console.warn('unsubscribing')}, (some) => {
                console.warn('Unsubscribe')
                _disconnect(some as DeviceServices)
        })
            unsub()
        })
        return device
}


export const IsTv = <T extends MDNSService>(device: T):boolean|undefined => {
    const key = "fn"
    return device.data.get(key)?.toString().toLowerCase().includes('tv')
}



function UpdateDevice(_old: DeviceServices,
    _eval: MDNSService, 
    arpData?: Array<ArpData>,
    // ignoreTVs?: boolean,
    ): 
    Promise<DeviceServices> {
        console.log("inside UpdateDevice")
        _old.client?.close()
        const info = _eval.addresses.at(0) as PersistentClientOptions
        const mac = arpData?.filter(dataPkt => info.host === dataPkt.ip_address).pop()
        // const {unsubscribe, set, update}
        console.warn("still need Connect")
        const newDS = {
            client: new PersistentClient(info),
            mac_address: mac?.mac_address ?? _old.mac_address,
            ..._eval,
        };
        return _connect(newDS).then((val:DeviceServices) => _old = val) 
     } // : undefined) // up
// export const 
  
