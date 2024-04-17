import {exec, spawn} from 'child_process';
import { isIP } from 'net';
import { MAC, parseMAC } from './mac/MAC';
import { readable, readonly, writable } from 'svelte/store';

// const IPv6 = v6({exact: true});
//? https://zaiste.net/posts/nodejs-child-process-spawn-exec-fork-async-await/
export const executeCommand = (
    cmd: string, 
    successCallback: { (branch: any): any; (arg0: string): void; }, 
    errorCallback: { (errormsg: any): any; (arg0: string): void; }) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
       // console.log(`error: ${error.message}`);
        if (errorCallback) {
          errorCallback(error.message);
        }
        return;
      }
      if (stderr) {
        //console.log(`stderr: ${stderr}`);
        if (errorCallback) {
          errorCallback(stderr);
        }
        return;
      }
      //console.log(`stdout: ${stdout}`);
      if (successCallback) {
        successCallback(stdout);
      }
    });
  };

const getGitBranchCommand = (folder: any, success: (arg0: any) => any, error: (arg0: any) => any) => {
    executeCommand(
      `git -C ${folder} rev-parse --abbrev-ref HEAD`,
        (branch: any) => success(branch),
      (errormsg: any) => error(errormsg)
    );
  }; 

export type ArpData = {
    hostname: String;
    ip_address: String;
    mac_address: String | MAC;
    interface_name: String;
    scope: String | String[];
    hw_type: String;
  };

export const ArpDataCache = (data: string):Array<ArpData> => data.
    split('\n').map(
        line => line.split(' ')
            .filter(piece => piece !== 'at' && piece !== 'on' && piece !== '')
        ).filter(
            item => 
                isIP(item.at(1)?.replace("(","").replace(")","") as string) === 4 &&
                parseMAC(item.at(2) as string)
        ).map(editedLine => {
          console.log(editedLine)
            editedLine.length > 0 ? Object.assign({
                hw_type: editedLine.pop()?.replace('[','').replace(']',''),
                hostname: editedLine.reverse().pop(), // .at(0),
                ip_address: editedLine.pop()?.replace('(','').replace(')',''), // .at(1)?.replace('(','').replace(')',''),
                mac_address: parseMAC(editedLine.pop() as string), //.at(2),
                interface_name: editedLine.pop(), //.at(3),
                scope: editedLine,
            }) : null}
    ).filter(item => item != null);


export const arpDevice = (ip:string) => {
  switch(isIP(ip))
  {
    case 6: return undefined
    case 4:
    default:
      return exec(`arp -n ${ip}`)
  }
}

// export const arpAll = () => {
//   const p = spawn('arp', ['-a'])
//   const arp = readable(p.stdout)
//   const arpData = writable(new Array<ArpData>())
//   arp.subscribe((stdOut) => {
//     stdOut.on('data', (stream: string) => {
//       console.log("ARPALL")
//       // console.log(stream)
//       // arpData.set(ArpDataCache(stream))
//     })
//   })
//   return arpData
// }

const writableStore = writable(new Array<ArpData>());

export const arpAll = () => {
  const p = exec('arp -a');
  const arp = readable(p)
  const arpData = writable(new Array<ArpData>());
  arp.subscribe((p) => p.stdout?.on('data', (stream) => {
    arpData.set(ArpDataCache(stream))
  }))
  return readonly(arpData);
}

const arp = executeCommand('arp -a',
  (data: string) => {
    // gl-mt3000.localdomain (192.168.2.61) at 9e:83:c4:3d:ce:3d on en0 ifscope [ethernet]
    let info = ArpDataCache(data)
        console.log(info)
  },
  console.error
);

// export const ArpDataWhere = <T>(field:<Kt, in T>(_kt: keyof T) => Kt, matches:<K, in ArpData>(_key: keyof ArpData) => K, _self: Array<ArpData>):Array<ArpData> => {
//     return (_self).filter(item => {
//         matches === field
//     })
// }

