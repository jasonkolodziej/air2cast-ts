// ? Interfaces of `spsConfig.json`

export interface Comment {
    // _description: Array<String> | Description;
    '$style'?: string;
    _isCommented?: boolean;
    _description: Array<String>;
}

export interface Section<TName, String> {
    _comments: Comment;
    TName: KV;
}

export interface KV {
    _value: any;
    '$type': String;
    _description: Comment;
}