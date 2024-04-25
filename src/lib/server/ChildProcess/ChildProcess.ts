// https://github.com/isaacs/duplex-passthrough/blob/master/dp.js
// https://github.com/joyent/node/blob/master/lib/child_process.js#L583

// var spawn = require('child_process').spawn
import {spawn, type ChildProcessWithoutNullStreams} from 'child_process';
// var Stream = require('stream')
import {Duplex, Stream, PassThrough, 
    type TransformOptions, type Writable, type Readable} from 'stream';
// type Duplex = Stream.Duplex
// var PassThrough = Stream.PassThrough

// require('util').inherits(Child_Process, Duplex)

// module.exports = Child_Process


const find = spawn('find', ['.', '-type', 'f']);
const wc = spawn('wc', ['-l']);

find.stdout.pipe(wc.stdin);

wc.stdout.on('data', (data) => {
  console.log(`Number of files ${data}`);
});
