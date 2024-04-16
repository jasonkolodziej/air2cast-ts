import {exec} from 'child_process';
import { isIP } from 'net';
import { MAC, parseMAC } from './mac/MAC';
import type { K } from 'vitest/dist/reporters-LqC_WI4d.js';

// const IPv6 = v6({exact: true});

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
        ).map(editedLine => 
            editedLine.length > 0 ? Object.assign({
                hw_type: editedLine.pop()?.replace('[','').replace(']',''),
                hostname: editedLine.reverse().pop(), // .at(0),
                ip_address: editedLine.pop()?.replace('(','').replace(')',''), // .at(1)?.replace('(','').replace(')',''),
                mac_address: parseMAC(editedLine.pop() as string), //.at(2),
                interface_name: editedLine.pop(), //.at(3),
                scope: editedLine,
            }) : null
    ).filter(item => item != null);


export const arp = executeCommand('arp -a',
  (data: string) => {
    // gl-mt3000.localdomain (192.168.2.61) at 9e:83:c4:3d:ce:3d on en0 ifscope [ethernet]
    let info = ArpDataCache(data)
        console.log(info)
  },
  console.error
);

export const ArpDataWhere = <T>(field:<Kt, in T>(_kt: keyof T) => Kt, matches:<K, in ArpData>(_key: keyof ArpData) => K, _self: Array<ArpData>):Array<ArpData> => {
    return (_self).filter(item => {
        matches === field
    })
}

function keyof<T>(field: any, matches: any, arg2: string) {
    throw new Error('Function not implemented.');
}

