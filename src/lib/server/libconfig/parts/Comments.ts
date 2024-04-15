
// const { Parse } = require('sprache');
import { Parse } from "sprache";


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

export const RemoveComments = Parse.query(function* () {
    const content = (yield Parse.queryOr(function* () {
        yield Comment
        yield Parse.char("/").or(Parse.char("#"))
        yield Parse.regex(/[^\#\/]+/)
    }).many()) as unknown as string[]
    return Parse.return(
        content.filter(item => typeof item !== "object").join('')
    ) as any;
})
