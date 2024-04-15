import { TestParser, Assertion } from "./util/test"
import { join } from "path"
import { parseFile, stripComments, parseString } from './index'
import { getFromFile } from './parts/include'

const dir = join(__dirname, "../testdata/")

module.exports = new TestParser("Index",
    new Assertion(
        stripComments(`#comment\ntest = 8 #help\n test9= 5/* comment */`).trim(),
        "test = 8  test9= 5".trim(),
        "strip comments from string"
    ),
    new Assertion(
        stripComments(getFromFile('example.cfg', dir)).trim(),
        getFromFile('example.withoutComments.cfg', dir).trim(),
        "strip comments from example file"
    ),
    new Assertion(
        parseFile('example.cfg', dir, getFromFile),
        JSON.parse(getFromFile('example.json', dir)),
        "parse example file"
    ),
    new Assertion(
        parseFile('example_nested.cfg', dir, getFromFile),
        JSON.parse(getFromFile('example_nested.json', dir)),
        "parse example nested file (with include)"
    ),
    new Assertion(
        parseFile('example.withoutComments.cfg', dir, getFromFile),
        JSON.parse(getFromFile('example.json', dir)),
        "parse example file (version without comments)"
    ),
)