import { TestParser, Assertion } from '../util/test'
const { Comment } = require("./Comments")

module.exports = new TestParser("Comments",
    // ScriptStyleComment
    new Assertion(
        Comment.parse("# TEST \n  not parsed"),
        { type: 'ScriptStyle', comment: " TEST " }, ""
    ),
    new Assertion(
        Comment.parse("# hey whats goin' on ##sda \n not parsed"),
        { type: 'ScriptStyle', comment: " hey whats goin' on ##sda " }, ""
    ),
    new Assertion(
        Comment.parse("#hello world"),
        { type: 'ScriptStyle', comment: "hello world" }, "without linebreak"
    ),
    // CppComment
    new Assertion(
        Comment.parse("// TEST \n  not parsed"),
        { type: 'CppStyle', comment: " TEST " }, ""
    ),
    new Assertion(
        Comment.parse("// hey whats goin' on #//sda \n not parsed"),
        { type: 'CppStyle', comment: " hey whats goin' on #//sda " }, ""
    ),
    new Assertion(
        Comment.parse("//hello world"),
        { type: 'CppStyle', comment: "hello world" }, "without linebreak"
    ),
    // oneLineComment
    new Assertion(
        Comment.parse("#hello world"),
        { type: 'ScriptStyle', comment: "hello world" }, "without linebreak"
    ),
    new Assertion(
        Comment.parse("// TEST \n  not parsed"),
        { type: 'CppStyle', comment: " TEST " }, ""
    ),

    // CComment
    new Assertion(Comment.parse("/* comment and it continues...\n in a new line */"), { type: 'CStyle', comment: " comment and it continues...\n in a new line " }, "with linebreak in between"),
    new Assertion(Comment.parse("/* comment and it continues...\n in a new line \n in a new line */"), { type: 'CStyle', comment: " comment and it continues...\n in a new line \n in a new line " }, "with linebreaks in between"),
    new Assertion(Comment.parse("/* comment and nothing else in one line */"), { type: 'CStyle', comment: " comment and nothing else in one line " }, "in one line"),
    new Assertion(Comment.parse("/*stars **** ** *** ******* ** / / / /*  */"), { type: 'CStyle', comment: "stars **** ** *** ******* ** / / / /*  " }, "in one line"),
    new Assertion(
        Comment.parse("/******\n\n\n*****\n*******\n**************/"),
        { type: 'CStyle', comment: "*****\n\n\n*****\n*******\n*************" },
        "many stars"
    ),
)