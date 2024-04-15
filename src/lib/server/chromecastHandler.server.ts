import {connect as conn, ReceiverController, type PersistentClient} from 'chromecast-client'
import type { Subscriber } from 'svelte/store'
import { MDNSServiceDiscovery, Protocol, type MDNSDiscoveryOptions, type MDNSService } from 'tinkerhub-mdns'
import { MDNSResponse } from 'tinkerhub-mdns/dist/types/manager'

//ChromecastServiceName is the name of the service to lookup via mDNS for finding chromecast devices
export const chromecastServiceName = "_googlecast._tcp"

export const mdnsServiceOpt: MDNSDiscoveryOptions = {type: 'googlecast', protocol: Protocol.TCP}


interface Device extends MDNSService {   
    receiverCtrl: ReceiverController.Receiver;
    client: Promise<PersistentClient>;
    play(): void;
}


// const receiverCtrl = <Device>(d: Device) => {
//     return ReceiverController.createReceiver(d.)
// }



// const client = await connect({host: '192.168.1.150'})

// // launch the media app on the Chromecast and join the session (so we can control the CC)
// const controller = ReceiverController.createReceiver({client(d)})

// // get the volume from the chromecast and unwrap the result
// const volume = (await controller.getVolume()).unwrapAndThrow()

// // log the volume level since there weren't any errors (or it would've thrown)
// console.log(volume)

// // dispose of the controller and close the client
// controller.dispose()
// client.close()