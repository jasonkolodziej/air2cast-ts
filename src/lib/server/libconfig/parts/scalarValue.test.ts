import { TestParser, Assertion } from '../util/test'
const { scalarValue } = require("./scalarValue");


module.exports = new TestParser("scalarValue",
    new TestParser("Numbers",
        new Assertion(scalarValue.parse("0027"), 0o27, "octal"),
        new Assertion(scalarValue.parse("5"), 5, "integer"),
        new Assertion(scalarValue.parse("546368"), 546368, "big integer"),
        new Assertion(scalarValue.parse("0x1FC3"), 0x1FC3, "hex"),
        new Assertion(scalarValue.parse("40.05"), 40.05, "float"),
        //signed numbers
        new Assertion(scalarValue.parse("-0027"), -0o27, "signed octal"),
        new Assertion(scalarValue.parse("-5"), -5, "signed integer"),
        new Assertion(scalarValue.parse("-546368"), -546368, "signed big integer"),
        new Assertion(scalarValue.parse("-0x1FC3"), -0x1FC3, "signed hex"),
        new Assertion(scalarValue.parse("+0027"), 0o27, "signed octal"),
        new Assertion(scalarValue.parse("-4.05"), -4.05, "signed float"),
        new Assertion(scalarValue.parse("+9"), 9, "signed integer"),
        new Assertion(scalarValue.parse("+546368"), 546368, "signed big integer"),
        new Assertion(scalarValue.parse("+0x1FC3"), 0x1FC3, "signed hex"),
        new Assertion(scalarValue.parse("+40.05"), 40.05, "signed float"),
        new Assertion(scalarValue.parse("940.485e+8L"), 940.485e8, "signed e+8 float"),
        new Assertion(scalarValue.parse("940.485e8L"), 940.485e8, "signed e8 float"),
        //64bit numbers
        new Assertion(scalarValue.parse("0027"), 0o27, "64bit octal"),
        new Assertion(scalarValue.parse("5"), 5, "64bit integer"),
        new Assertion(scalarValue.parse("546368"), 546368, "64bit big integer"),
        new Assertion(scalarValue.parse("0x1FC3"), 0x1FC3, "64bit hex"),
        new Assertion(scalarValue.parse("940.0554L"), 940.0554, "64bit float"),
        // extra number tests    
        new Assertion(scalarValue.parse("-8L"), -8, "signed 64bit integer"),
        new Assertion(scalarValue.parse("-0"), 0, "0"),
        new Assertion(scalarValue.parse("-00"), 0o0, "00"),
        new Assertion(scalarValue.parse("940.0554EL"), 940.0554, "64bit e float"),
        new Assertion(scalarValue.parse("940.0554E-8L"), 940.0554e-8, "64bit e-8 float"),
        new Assertion(scalarValue.parse("0x1Fc3"), 0x1fc3, "hex"),
    ),
    new TestParser("Boolean",
        new Assertion(scalarValue.parse("true"), true, "boolean true 1"),
        new Assertion(scalarValue.parse("false"), false, "boolean false"),
        new Assertion(scalarValue.parse("TRUE"), true, "boolean true 2"),
        new Assertion(scalarValue.parse("FALSE"), false, "boolean false"),
        new Assertion(scalarValue.parse("TrUe"), true, "boolean true 3"),
        new Assertion(scalarValue.parse("FaLsE"), false, "boolean false"),
    ),
    new TestParser("Strings",
        new Assertion(scalarValue.parse("\"test\""), "test", "string"),
        new Assertion(scalarValue.parse("\"4\""), "4", "number in string"),
        new Assertion(scalarValue.parse("\"Hello World\""), "Hello World", "string with whitespaces"),

        // strings
        new Assertion(scalarValue.parse("\"Hello\\n World\""), "Hello\n World", "string with '\\n'"),
        new Assertion(scalarValue.parse('"Hello \\" World \\""'), "Hello \" World \"", "string with '\\\"'"),
        new Assertion(scalarValue.parse("\"Hello \\\" World \\\"\""), "Hello \" World \"", "string with '\\\"'"),

        // The escape sequences
        new Assertion(scalarValue.parse(String.raw`"o: \\xFF"`), "o: \\xFF", "escaped Hex asci code"),
        new Assertion(scalarValue.parse(String.raw`"\\n"`), "\\n", "escaped linebreak"),
        new Assertion(scalarValue.parse(String.raw`"\f"`), "\f", "\\f"),
        new Assertion(scalarValue.parse(String.raw`"\n"`), "\n", "\\n"),
        new Assertion(scalarValue.parse(String.raw`"\r"`), "\r", "\\r"),
        new Assertion(scalarValue.parse(String.raw`"\t"`), "\t", "\\t"),

        new Assertion(scalarValue.parse(String.raw`"\"Hi\""`), "\"Hi\"", "escaped \""),

        // string escape chars - ascii
        new Assertion(scalarValue.parse(String.raw`"\xd1 i"`), "\xd1 i", "Hex asci codes '\\xd1' (lowercase letter)"),
        new Assertion(scalarValue.parse(String.raw`"\xDF p"`), "\xDF p", "Hex asci codes '\\xDF'"),
        new Assertion(scalarValue.parse(String.raw`"0 \xFF y"`), "0 \xFF y", "Hex asci codes '\\xFF'"),

        // Adjacent strings are automatically concatenated
        new Assertion(scalarValue.parse('"hello " "world"'), "hello world", "Adjacent strings whitespace"),
        new Assertion(scalarValue.parse('"hello" \n" world"'), "hello world", "Adjacent strings linebreak"),
        new Assertion(scalarValue.parse('"hell\\"o " \n"world"'), "hell\"o world", "Adjacent strings linebreak + \""),
        new Assertion(scalarValue.parse('<"hello \n world">'), "hello \n world", "<\"Multiline Strings\">"),
        new Assertion(scalarValue.parse('<"hello \n \"string\" world">'), "hello \n \"string\" world", "<\"Multiline \"\"Strings\">"),
    )
)