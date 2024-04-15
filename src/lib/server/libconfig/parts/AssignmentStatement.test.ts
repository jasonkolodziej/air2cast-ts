import { TestParser, Assertion } from '../util/test'
const { AssignmentOperator, Setting, ArrayParser } = require("./AssignmentStatement")

module.exports = new TestParser("Assignments",
    new TestParser("Settings",
        //AssignmentOperator
        new Assertion(AssignmentOperator.parse(":"), ":", "AssignmentOperator"),
        new Assertion(AssignmentOperator.parse("="), "=", "AssignmentOperator"),
        //Setting
        new Assertion(
            Setting.parse(
                "id2 = 5;"),
            { type: "setting", key: 'id2', value: 5 },
            "test number"
        ),
        new Assertion(
            Setting.parse("id =false ;"),
            { type: "setting", key: 'id', value: false },
            "test boolean"
        ),
        new Assertion(
            Setting.parse("message = \"Hello World\";"),
            { type: "setting", key: 'message', value: "Hello World" },
            "test string"
        ),
        new Assertion(
            Setting.parse('id="fa" "l" \n \t "se" ;'),
            { type: "setting", key: 'id', value: "false" },
            "test string that is splited in parts"
        ),
    ),

    new TestParser("Arrays",
        new Assertion(ArrayParser.parse(`[ \n"h" "e"\t\n "llo"\n, "world" \n]`), ['hello', 'world'], "string in array"),
        new Assertion(ArrayParser.parse(`[ \nfalse\t\n , true ]`), [false, true], "boolean in array"),
        new Assertion(
            Setting.parse("this = [1,2,3,4,5]"), {
                type: 'setting',
                key: 'this',
                value: [1, 2, 3, 4, 5]
            }, "a Setting with an array as value"
        )
    ),
    new TestParser("Lists",
        new Assertion(Setting.parse(
            `   test = 
              ({
                title = "My Application";
                size = [7,0x85];
                pos = { x = 350; y = 250; };
              }, true, 0, 957);
          `
        ), {
                type: 'setting',
                key: 'test',
                value:
                    [{
                        title: 'My Application',
                        size: [7, 133],
                        pos: { x: 350, y: 250 }
                    },
                        true,
                        0,
                        957]
            }, "Lists"
        )
    ),
    new TestParser("Groups",
        new Assertion(
            Setting.parse(`this = { title  = "Snow Crash";
       author = "Neal Stephenson";
       price  = 9.99;
       qty    = 8 ; } ;`),
            {
                type: 'setting',
                key: 'this',
                value:
                {
                    title: 'Snow Crash',
                    author: 'Neal Stephenson',
                    price: 9.99,
                    qty: 8
                }
            }, "a Setting with a group as value - example from their page"
        ),

    ),
    new TestParser("Combinations of List, Array and Group",
        new Assertion(
            Setting.parse(`window:
                  {
                    title = "My Application";
                    size = { w = 640; h = 480; };
                    pos = { x = 350; y = 250; };
                  };
              `),
            {
                type: 'setting',
                key: 'window',
                value:
                {
                    title: 'My Application',
                    size: { w: 640, h: 480 },
                    pos: { x: 350, y: 250 }
                }
            }, "nested Groups"
        ),
        new Assertion(
            Setting.parse(`window:
                  {
                    title = "My Application";
                    size = [640, 480];
                    pos = { x = 350; y = 250; };
                  };
              `),
            {
                type: 'setting',
                key: 'window',
                value:
                {
                    title: 'My Application',
                    size: [640, 480],
                    pos: { x: 350, y: 250 }
                }
            }, "Array in Group"
        ),
        new Assertion(
            Setting.parse(`list = 
            ({
              group = (false, 5, "5%", (false) );
              pos = { x = 350; y = 250; };
            }, "test");`),
            {
                type: 'setting',
                key: 'list',
                value:
                    [
                        {
                            group: [false, 5, '5%', [false]],
                            pos: { x: 350, y: 250 }
                        },
                        'test']
            }, "list in group in list"
        ),
    ),
)