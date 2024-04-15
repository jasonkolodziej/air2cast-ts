//console.info = () => {}

import { Assertion } from "./util/test";

console.info("Tests\n=====")

export const tests = [
    'parts/Identifier.test',
    'parts/scalarValue.test',
    'parts/AssignmentStatement.test',
    'parts/Comments.test',
    'parts/include.test',
    'index.test',
]
let failed = false;
tests.forEach(testName => {
    /**
     * @type {TestParser}
     */
    const test = require(`./${testName}`)
    if(!test.runTest())
        failed = true
})

if(failed) process.exit(1)
else process.exit(0)