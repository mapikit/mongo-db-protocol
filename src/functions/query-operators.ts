import { MetaSystemFunction } from "../main-types.js"

// Single Element Operations
export const equal = (param : { value: unknown }) => {
  return { query: { $eq: param.value } }
}

export const equalMetaSystemFunction : MetaSystemFunction = {
  function: equal,
  definition: {
    functionName: "equal",
    input: { value: { type: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const notEqual = (param : { value: unknown }) => {
  return { query: { $ne: param.value } }
}

export const notEqualMetaSystemFunction : MetaSystemFunction = {
  function: notEqual,
  definition: {
    functionName: "notEqual",
    input: { value: { type: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const greaterThan = (param : { value: unknown }) => {
  return { query: { $gt: param.value } }
}

export const greaterThanMetaSystemFunction : MetaSystemFunction = {
  function: greaterThan,
  definition: {
    functionName: "greaterThan",
    input: { value: { type: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const greaterOrEqualTo = (param : { value: unknown }) => {
  return { query: { $gte: param.value } }
}

export const greaterOrEqualToMetaSystemFunction : MetaSystemFunction = {
  function: greaterOrEqualTo,
  definition: {
    functionName: "greaterOrEqualTo",
    input: { value: { type: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const lesserThan = (param : { value: unknown }) => {
  return { query: { $lt: param.value } }
}

export const lesserThanMetaSystemFunction : MetaSystemFunction = {
  function: lesserThan,
  definition: {
    functionName: "lesserThan",
    input: { value: { type: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const lesserOrEqualTo = (param : { value: unknown }) => {
  return { query: { $lte: param.value } }
}

export const lesserOrEqualToMetaSystemFunction : MetaSystemFunction = {
  function: lesserOrEqualTo,
  definition: {
    functionName: "lesserOrEqualTo",
    input: { value: { type: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const isOneOf = (param : { values: unknown[] }) => {
  return { query: { $in: param.values } }
}

export const isOneOfMetaSystemFunction : MetaSystemFunction = {
  function: isOneOf,
  definition: {
    functionName: "isOneOf",
    input: { values: { type: "array", subtype: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const isNoneOf = (param : { values: unknown[] }) => {
  return { query: { $nin: param.values } }
}

export const isNoneOfMetaSystemFunction : MetaSystemFunction = {
  function: isNoneOf,
  definition: {
    functionName: "isNoneOf",
    input: { values: { type: "array", subtype: "any", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const exists = (param : { exists: boolean }) => {
  return { query: { $exists: param.exists } }
}

export const existsMetaSystemFunction : MetaSystemFunction = {
  function: exists,
  definition: {
    functionName: "exists",
    input: { exists: { type: "boolean", required: true } },
    output: { query: { type: "cloudedObject" } }
  }
}

export const matchesRegex = (param : { regex: string, options: { caseSensitive: boolean, multiline: boolean, dotMatchesMultiline: boolean } }) => {
  let finalOption = undefined;

  if (param.options?.caseSensitive) { finalOption = finalOption ? finalOption += "i" : "i"}
  if (param.options?.multiline) { finalOption = finalOption ? finalOption += "m" : "m"}
  if (param.options?.dotMatchesMultiline) { finalOption = finalOption ? finalOption += "s" : "s"}

  if (!finalOption) return { query: { $regex: param.regex } }
  return { query: { $regex: param.regex, $options: finalOption } }
}

export const matchesRegexMetaSystemFunction : MetaSystemFunction = {
  function: matchesRegex,
  definition: {
    functionName: "matchesRegex",
    input: {
      regex: { type: "string", required: true },
      options: { type: "object", required: false, subtype: {
        caseSensitive: { type: "boolean" },
        multiline: { type: "boolean" },
        dotMatchesMultiline: { type: "boolean" }
      } }
    },
    output: { query: { type: "cloudedObject" } }
  }
}