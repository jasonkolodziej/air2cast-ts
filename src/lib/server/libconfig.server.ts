import {parseFile, parseString, stripComments} from "$lib/server/libconfig";
import { Group } from "./libconfig/parts/AssignmentStatement";
import { ParseCommentedSetting, RemoveComments } from "./libconfig/parts/Comments";

export const ParseFile = parseFile;

export function withComments(input:string):string {
    return ParseCommentedSetting.parse(input) as unknown as string;
}
export const Parse = (arg0: string) => { 
    let o = Group.parse(`{${stripComments(arg0)}}`) as object;
    // o = Object.assign(o, {[Object.keys(o).at(0) as string]:withComments(arg0)})
    // console.log()
    return o
};

export interface DeviceConfig {
        airplay_device_id: String, // * 0x<MACADDR>L
        port: Number,
        mdns_backend: 'avahi',
        output_backend: "alsa" | "pipe" | "stdout",
        interpolation: "auto" | "basic" | "soxr",
        name: String
}

