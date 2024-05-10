import type { DeviceConfig } from "./sps";

/**
* ## Comment
Within the `json` template for `shairport-sync` a comment represents any 
comment per section or field of the `libconfig` for each device.
*/
export interface Comment {
    // _description: Array<String> | Description;
    '$style'?: string;
    _isCommented?: boolean;
    _description: Array<String>;
}

/**
    * ## Section
    Within the `json` template for `shairport-sync` a section represents any 
    section of the `libconfig` for each device -- holding it KeyValue pairs for each field.
    */
export interface Section {
    _comments: Comment;
    properties: SectionPropertyMap;
}

/**
    * SectionPropertyMap resembles something of DescriptorPropertyMap
    */
export interface SectionPropertyMap {
    [key: string]:KV;
}

/**
    * Sections resembles a conglomeration of Section as a map.
    * Used for parsing.
    */
export interface Sections {
    [key: string]:Section;
}

/**
    * ## KV
    Within the `json` template for `shairport-sync` a KV represents any 
    field with in the section of the `libconfig` for each device.
    */
export interface KV {
    _value: any;
    '$type': String;
    _description: Comment;
}

/** ## ParsedConfiguration 
    Alias for UI ready array. 
*/ 
export type ParsedConfiguration = Array<{title: string; description: string[]; children: Map<string,KV>}>;    