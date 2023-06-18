// Single Element Operations
export const equal = (param : { value: unknown }) => {
  return { $eq: param.value }
}

export const notEqual = (param : { value: unknown }) => {
  return { $ne: param.value }
}

export const greaterThan = (param : { value: unknown }) => {
  return { $gt: param.value }
}

export const greaterOrEqualTo = (param : { value: unknown }) => {
  return { $gte: param.value }
}

export const lesserThan = (param : { value: unknown }) => {
  return { $lt: param.value }
}

export const lesserOrEqualTo = (param : { value: unknown }) => {
  return { $lte: param.value }
}

export const isOneOf = (param : { values: unknown[] }) => {
  return { $in: param.values }
}

export const isNoneOf = (param : { values: unknown[] }) => {
  return { $nin: param.values }
}

export const exists = (param : { exists: boolean }) => {
  return { $exists: param.exists }
}

export const matchesRegex = (param : { regex: string, options: { caseSensitive: boolean, multiline: boolean, dotMatchesMultiline: boolean } }) => {
  let finalOption = undefined;

  if (param.options?.caseSensitive) { finalOption = finalOption ? finalOption += "i" : "i"}
  if (param.options?.multiline) { finalOption = finalOption ? finalOption += "m" : "m"}
  if (param.options?.dotMatchesMultiline) { finalOption = finalOption ? finalOption += "s" : "s"}

  if (!finalOption) return { $regex: param.regex }
  return { $regex: param.regex, $options: finalOption }
}