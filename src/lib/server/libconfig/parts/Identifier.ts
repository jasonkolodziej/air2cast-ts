// const { Parse } = require('sprache');
import { Parse, type Parser } from "sprache";

export const Identifier:Parser<string> = Parse.query(function* () {
    const leading = yield Parse.whiteSpace.many();
    const name = (yield Parse.regex(/[a-z0-9\*][-a-z0-9_\*]*/i)) as unknown as string
    const trailing = yield Parse.whiteSpace.many();
    return Parse.return(name);
});
