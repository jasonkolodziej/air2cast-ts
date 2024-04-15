import { TestParser, Assertion } from '../util/test'
const { join } = require("path")
const { include, getFromFile } = require('./include')

const dir = join(__dirname, "../../testdata/include")

module.exports = new TestParser("Include",
    new Assertion(include(getFromFile("includeConfig.cfg", dir), dir, getFromFile), getFromFile("expected.conf", dir), "basic include example"),
    new Assertion((_ => {
        try {
            include(getFromFile("loop.cfg", dir), dir, getFromFile)
        } catch (error) {
            return error.message
        }
    }) (), "Nesting with @include only is allowed up to a level of 10 times", "error.message on loop"),
)