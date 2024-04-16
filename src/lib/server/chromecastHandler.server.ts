// import {ReceiverController, type PersistentClient} from 'chromecast-client'
import { Protocol, type MDNSDiscoveryOptions } from 'tinkerhub-mdns';
import { type DeviceServices } from '$lib/server/mdns.server';
import { ReceiverController } from '@foxxmd/chromecast-client';

//ChromecastServiceName is the name of the service to lookup via mDNS for finding chromecast devices
export const chromecastServiceName = "_googlecast._tcp"

export const mdnsServiceOpt: MDNSDiscoveryOptions = {type: 'googlecast', protocol: Protocol.TCP}


export const _disconnect = async (_val: DeviceServices) => {
    console.log("inside DISCONNECT")
    await _val.client!.close()
    _val.receiverCtrl = undefined
    return _val;
}

export const _connect = async (_val: DeviceServices) => {
    console.log("inside CONNECT")
    await _val.client!.connect()
    _val.receiverCtrl = ReceiverController.createReceiver(_val.client!)
    return _val;
}

export const controller = (_val: DeviceServices) => {
    return _val.receiverCtrl;
}


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