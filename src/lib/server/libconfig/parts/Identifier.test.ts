const { TestParser, Assertion } = require('../util/test')
const { Identifier } = require("./Identifier")

module.exports = new TestParser("Identifier",
    new Assertion(Identifier.parse("i2d= 5"), "i2d", "full"),
    new Assertion(Identifier.parse("id2=5"), "id2", "full"),
    new Assertion(Identifier.parse("id = 5"), "id", "full"),
    new Assertion(Identifier.parse("id2:5"), "id2", "full:"),
    new Assertion(Identifier.parse("i2d: 5"), "i2d", "full:"),
    new Assertion(Identifier.parse("id : 5"), "id", "full:")
)