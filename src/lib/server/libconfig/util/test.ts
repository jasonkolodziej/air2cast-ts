export class Assertion {
    actual: any
    expected: any
    name: String
    /**
     * 
     * @param {any} actual 
     * @param {any} expected 
     * @param {String} name 
     */
    constructor(actual, expected, name) {
        this.actual = actual
        this.expected = expected
        this.name = name
    }

    assert() {
        const aa = typeof this.actual === "object" ? JSON.stringify(this.actual) : this.actual
        const bb = typeof this.expected === "object" ? JSON.stringify(this.expected) : this.expected
        if (aa != bb) {
            throw `${this.name} failed, expected [[ ${aa} ]] == [[ ${bb} ]]`
        } else {
            return true
        }
    }
}

export class TestParser {
    part_name: any
    assertions: any[]
    /**
     * 
     * @param {String} part_name 
     * @param  {...Assertion|TestParser} assertions 
     */
    constructor(part_name, ...assertions) {
        this.part_name = part_name
        this.assertions = assertions
    }

    runTest(nestedLevel = 0) {
        let errors = []
        let childOutput = []
        for (let i = 0; i < this.assertions.length; i++) {
            const assertion = this.assertions[i];
            if (assertion instanceof TestParser) {
                childOutput.push(assertion.runTest(nestedLevel + 1))
            } else {
                try {
                    if (!assertion.assert()) { throw new Error("Impossible Error") }
                } catch (error) {
                    errors.push(error)
                }
            }
        }
        const failedChildTests = childOutput.filter(i => i.errors.length >= 1).length
        //console.log(failedChildTests, childOutput.filter(i => return i.errors.length >= 1))
        if (nestedLevel === 0) {
            const output = this._generateOutput(errors, nestedLevel, failedChildTests)
            this._displayOutput(output)
            childOutput.forEach(output => this._displayOutput(output))
            return (errors.length + failedChildTests) === 0
        } else {
            return this._generateOutput(errors, nestedLevel, failedChildTests)
        }

    }

    _displayOutput({ info, errors, error_prefix }) {
        console.info(info)
        for (let i = 0; i < errors.length; i++) {
            console.error(error_prefix, errors[i])
        }
    }

    _generateOutput(errors, nestedLevel, failedChildTests) {
        const prefix = nestedLevel > 0 ? (new Array(nestedLevel)).fill("-").join('') : ""
        return {
            info: `${prefix}> ${this.part_name} (${this.assertions.length - (errors.length + failedChildTests)}/${this.assertions.length})`,
            error_prefix: `${(new Array(nestedLevel + 2)).fill(" ").join('')}E)`,
            errors: errors
        }
    }
}
