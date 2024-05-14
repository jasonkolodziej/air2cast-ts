import { MDNSServiceDiscovery } from 'tinkerhub-mdns';
import { mdnsServiceOpt } from '$lib/server/chromecastHandler.server';
import { Device } from '$lib/server/devices/device';
import type { ServiceDiscovery } from 'tinkerhub-discovery';

/*
 * ex: https://developer.spotify.com/documentation/commercial-hardware/implementation/guides/zeroconf
 * docs: https://github.com/thingbound/tinkerhub-mdns/tree/master
        // Listen for services as they become available
        // export const onAvailable = discoverChromeCast.onAvailable

        // discoverChromeCast.onAvailable(service => {
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
        discoverChromeCast.destroy(); */

const discover = (): MDNSServiceDiscovery => new MDNSServiceDiscovery(mdnsServiceOpt);

export const discoverDevices = (): ServiceDiscovery<Device> => {
	return discover().map({
		create: (service) => {
			return new Device(service);
		},
		update: ({ service, previousService, previousMappedService }) => {
			/*
			 * `service` points to the updated service to map
			 * `previousService` is the previous version of the service to map
			 * `previousMappedService` is what `create` or `update` mapped to previously
			 *
			 * Either:
			 *
			 * 1) Return null/undefined to remove the service
			 * 2) Return the previously mapped service
			 * 3) Return a new mapped service
			 *
			 */
			// (previousMappedService as Device).withUpdate(service);
			previousMappedService.withUpdate(service);
			return previousMappedService;
		},
		destroy: (mappedService) =>
			mappedService.destroy() /* perform some destruction of the mapped service */
	});
};
