import {MDNSServiceDiscovery} from 'tinkerhub-mdns'
import { chromecastServiceName, mdnsServiceOpt } from '$lib/server/chromecastHandler.server'

/**
 * ex: https://developer.spotify.com/documentation/commercial-hardware/implementation/guides/zeroconf
  
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

// Listen for services as they become available
export const onAvailable = discoverChromeCast.onAvailable

// (service => {
//     console.log()
//     // Service available
//   });
  
