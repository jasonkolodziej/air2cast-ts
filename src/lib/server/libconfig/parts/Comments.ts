
// const { Parse } = require('sprache');
import { Parse, Result, type IInput } from "sprache";
import { Setting } from "./AssignmentStatement";
import { space } from "./space";


/**
 * `# comment line`
 */
const ScriptStyleComment = Parse.query(function* () {
    yield Parse.char('#')
    const x = (yield Parse.char(c => !/\n/.test(c), "chars exept for \\n").many()) as unknown as string[]
    yield Parse.char('\n').optional()

    return Parse.return({
        type: 'ScriptStyle',
        comment: x.join('')
    }) as any;
})

/** 
 * `// comment line`
 */
const CppComment = Parse.query(function* () {
    yield Parse.string('//')
    const content = (yield Parse.char(c => !/\n/.test(c), "chars exept for \\n").many()) as unknown as string[]
    yield Parse.char('\n').optional()

    return Parse.return({
        type: 'CppStyle',
        comment: content.join('')
    })
})

const oneLineComment = Parse.queryOr(function* () {
    yield ScriptStyleComment
    yield CppComment
})
/**
 * `/* comment *​/`
 */
const CComment = Parse.query(function* () {
    yield Parse.string('/*')
    const content = yield Parse.char(_ => true, "any char").until(Parse.string('*/')).text()
    yield Parse.char('\n').optional()

    return Parse.return({
        type: 'CStyle',
        comment: content
    })
})

export const Comment = Parse.queryOr(function* () {
    yield ScriptStyleComment
    yield CppComment
    yield CComment
})

export const ParseComments = Parse.query(function* () {
    const content = (yield Parse.queryOr(function* () {
        yield Comment
        yield Parse.regex(/[^\#\/]+/)
    }).many()) as unknown as string[]
    return Parse.return(
        content.filter(item => typeof item === "object")
    )
})

export const ParseCommentedSetting = Parse.query(function* () {
    const content = (yield Parse.queryOr(function* () {
        yield Comment //.many()
        yield Parse.regex(/[^\#\/]+/)
    }).many()) as unknown as {type: string; comment: string;}[]
    let values = content.filter(item => typeof item === "object") 
    let group:object = Object() // {}
    // console.log(values)
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        let a = (Setting.atLeastOnce().tryParse(value.comment as string) as unknown) as Result<{type: string; key: string; value:any;}>
        const b = ParseComments.tryParse(value.comment as string) as unknown as Result<{type: string; comment: string;}>
        if (!a.wasSuccessful && b.wasSuccessful) {
            // console.log(a)
            group = Object.assign(group, {['description']:value});
        } else if (a.wasSuccessful && b.wasSuccessful) {
            // console.log(a)
            const cmnt = a.value as {type: string; key: string; value:any;};
            // console.log(cmnt);
            group = Object.assign(group, Object.assign(
                {[(a.value as unknown as Array<{type: string; key: string; value:any;}>)[0].key as string]: {
                    '_value': (a.value as unknown as Array<{type: string; key: string; value:any;}>)[0].value,
                    ['description']: (b.value as unknown as Array<any>)[0]
                }
            }))
        }
    }
    return Parse.return(
        group        
    ) as any
})



export const RemoveComments = Parse.query(function* () {
    const content = (yield Parse.queryOr(function* () {
        yield Comment
        yield Parse.char("/").or(Parse.char("#"))
        yield Parse.regex(/[^\#\/]+/)
    }).many()) as unknown as string[]
    console.log(content.filter(item => typeof item !== "object").join(''))
    return Parse.return(
        content.filter(item => typeof item !== "object").join('')
    ) as any;
})
