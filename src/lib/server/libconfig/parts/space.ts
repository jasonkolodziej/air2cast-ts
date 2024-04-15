// const { Parse } = require('sprache');
import { Parse } from "sprache";

export const space = Parse.whiteSpace.or(Parse.char('\n').or(Parse.char("\t")));
