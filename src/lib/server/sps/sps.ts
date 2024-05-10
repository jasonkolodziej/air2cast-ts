import { type PathOrFileDescriptor } from 'fs';
import type { ParsedConfiguration } from './types';
import type { Service } from 'tinkerhub-discovery';
/**
 * ## DeviceConfig
    Represents the interface of fields that need to be modified for each device that will proxy `shairport-sync`.
 */
    export interface DeviceConfig {
        // airplay_device_id: String, // * 0x<MACADDR>L
        // port: Number,
        // mdns_backend: 'avahi',
        // output_backend: "alsa" | "pipe" | "stdout",
        // interpolation: "auto" | "basic" | "soxr",
        name: String
}

export interface Sps extends Service {
    readonly configPath: PathOrFileDescriptor;
    readonly content: Buffer;
    templateConfiguration: ParsedConfiguration;
    // templateConfig:
}