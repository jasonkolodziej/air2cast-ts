// https://github.com/isaacs/duplex-passthrough/blob/master/dp.js
// https://github.com/joyent/node/blob/master/lib/child_process.js#L583

// var spawn = require('child_process').spawn
import { EventEmitter } from "node:events";
import {spawn, ChildProcess,
  type ChildProcessWithoutNullStreams, type Serializable, type SendHandle, type MessageOptions} from 'child_process';
// var Stream = require('stream')
import {Duplex, Readable, Stream, PassThrough,
    Writable, 
    type TransformOptions, 
    type Pipe} from 'stream';
// type Duplex = Stream.Duplex
// var PassThrough = Stream.PassThrough

// require('util').inherits(Child_Process, Duplex)

// module.exports = Child_Process


const find = spawn('find', ['.', '-type', 'f']);
const wc = spawn('wc', ['-l']);





export type Listener = (chunk: any) => void;

// find.stdout.pipe(wc.stdin);
export const PipeTo = (incoming: Readable, outgoing:Writable) => incoming.pipe(outgoing);

// wc.stdout.on('data', (data) => {
//   console.log(`Number of files ${data}`);
// });
export const On = <T extends EventEmitter>(incoming:T, msg:string, listenerDo:Listener ):T => {
  return incoming.on(msg, listenerDo)
}