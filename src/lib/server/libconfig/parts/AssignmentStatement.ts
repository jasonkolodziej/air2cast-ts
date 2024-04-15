import { Identifier } from "./Identifier"
import { scalarValue, ArrayElements } from "./scalarValue"
// const { Parse } = require('sprache');
import { Parse, type Parser } from "sprache";
import { space } from "./space"

export const AssignmentOperator = Parse.char(c => /:|=/.test(c), '=|: (assignment)')

const SettingValue = Parse.queryOr(function* () {
    yield scalarValue
    yield ArrayParser
    yield Group
    yield List
}) as Parser<any>;

export const Setting = Parse.query(function* () {
    yield space.many()
    const identifier = (yield Identifier) as unknown as string
    const assignmentOperator = yield AssignmentOperator
    const value = (yield SettingValue) as unknown as any;
    yield Parse.chars(";").optional()
    return Parse.return({
        type: "setting",
        key: identifier,
        value: value,
    }) as any;
});

export const Group = Parse.query(function* () {
    yield space.many()
    yield Parse.char("{")
    const raw_values = (yield Parse.queryOr(function* () {
        yield Setting
        yield space.atLeastOnce().text()
    }).many()) as unknown as string[];
    yield Parse.char("}")
    yield space.many()

    const values = raw_values.filter((i: any) => typeof i === "object")

    let group = {}
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        group[value.key] = value.value
    }

    return Parse.return(group);
})

export const ArrayParser = Parse.query(function* () {
    yield space.many()
    yield Parse.char("[")
    const values = yield ArrayElements
    yield Parse.char("]")
    yield space.many()

    return Parse.return(values)
})

const List = Parse.query(function*(){
    yield space.many()
    yield Parse.char("(")
    yield space.many()
    const values = yield Parse.query(function*(){
        const value = yield SettingValue 
        yield space.many()
        yield Parse.char(",").optional()
        yield space.many()
        return Parse.return(value)
    }).many()
    yield Parse.char(")")
    yield space.many()

    return Parse.return(values)
})

// module.exports = {
//     AssignmentOperator,
//     Setting,
//     Group,
//     ArrayParser,
// }
