import { PWD } from "$env/static/private";
import {parseFile, stripComments} from "$lib/server/libconfig";
import { Group } from "./libconfig/parts/AssignmentStatement";
import { ParseCommentedSetting } from "./libconfig/parts/Comments";
import configJson from '$lib/server/spsConf.json';
import { json } from "@sveltejs/kit";

// export const parsedJson = configJson;
import fs from 'fs'
// import { loadConfigFromFile } from "vite";
// export const dataArray = JSON.parse(fs.readFileSync("./spsConf.json", 'utf-8'))

// // ? https://scottspence.com/posts/sveltekit-data-loading-understanding-the-load-function
// import { SECRET_TOKEN } from '$env/static/private'

// export const load = async () => {
//   console.log('=====================')
//   console.log(SECRET_TOKEN)
//   console.log('=====================')
//   const fetchCoins = async () => {
//     const req = await fetch('https://api.coinlore.com/api/tickers/')
//     const { data } = await req.json()
//     return data
//   }

//   return {
//     currenciesServer: fetchCoins(),
//   }
// }


export const ParseFile = parseFile;
// export const jsonConfiguration = configJson; // JSON.parse(configJson);
export function withComments(input:string):string {
    return ParseCommentedSetting.parse(input) as unknown as string;
}
export const Parse = (arg0: string) => { 
    let o = Group.parse(`{${stripComments(arg0)}}`) as object;
    o = Object.assign(o, {[Object.keys(o).at(0) as string]:withComments(arg0)})
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