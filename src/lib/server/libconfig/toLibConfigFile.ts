// Result can be "unstable" because it needs to guess
// whether the json array is ment to be a libconfig array or a list
function toLibConfigFile(json_object) {
    if (typeof json_object !== "object" || Array.isArray(json_object)) {
        throw new Error("Expected an Object")
    }

    return convertObject(json_object, 0)
}

function convertObject(object, nestingLevel) {
    let resultLines = "{\n"
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const element = object[key]
            const value = convertValue(element, nestingLevel + 1)
            if (typeof value === "undefined") continue
            resultLines += `${tabs(nestingLevel + 1)}${key}: ${value}\n`
        }
    }
    resultLines += `${tabs(nestingLevel)}}\n`
    return resultLines
}

function convertArray(array, nestingLevel) {
    let resultLines = "[\n"
    resultLines += array
        .map(
            (elem) => `${tabs(nestingLevel + 1)}${JSON.stringify(elem)},\n`
        ).join('')
    resultLines += `${tabs(nestingLevel)}]\n`
    return resultLines
}

function convertList(array, nestingLevel) {
    let resultLines = "(\n"
    resultLines += array
        .map(
            (elem) => `${tabs(nestingLevel + 1)}${convertValue(elem, nestingLevel + 1)},\n`
        ).join('')
    resultLines += `${tabs(nestingLevel)})\n`
    return resultLines
}

function convertValue(value, nestingLevel) {
    if (typeof value === "object") {
        if (Array.isArray(value)) {
            if (isArrayLibConfigArray(value)) {
                return convertArray(value, nestingLevel)
            } else {
                return convertList(value, nestingLevel)
            }
        } else {
            return convertObject(value, nestingLevel)
        }
    } else {
        return JSON.stringify(value)
    }
}

function isArrayLibConfigArray(array) {
    //is array of same type and only contains scalar values (number boolean string)
    const type = typeof array[0]
    console.log(type)
    if(!["string","number","boolean"].includes(type)) return false
    for (let i = 1; i < (array.length); i++) {
        if (typeof array[i] !== type) return false
    }
    return true
}

function tabs(number) {
    let thing = ""
    for (let i = 0; i < number; i++) {
        thing += "    "
    }
    return thing
}

// todo tests and check if specs match
// todo multiline strings

module.exports = toLibConfigFile

//https://hyperrealm.github.io/libconfig/libconfig_manual.html#Why-Another-Configuration-File-Library_003f



