import {MDNSServiceDiscovery, MDNSServicePublisher, type MDNSService} from 'tinkerhub-mdns'
import { chromecastServiceName, mdnsServiceOpt } from './chromecastHandler.server'
import type { Subscriber } from 'svelte/store'

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
export const onCastAvail = discoverChromeCast.onAvailable
export const onCastUpdate = discoverChromeCast.onUpdate
export const onCastUnavail = discoverChromeCast.onUnavailable

export type DeviceSubscriber = Subscriber<[MDNSService]>

export const IsTv = <T extends MDNSService>(device: T):boolean|undefined => {
    const key = "fn"
    return device.data.get(key)?.toString().toLowerCase().includes('tv')
}




// export const 
  
