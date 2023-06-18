// Logic Keys should always come before any object paths;
const validLogicKeys = ["$and", "$or", "$nor", "not"]

export const and = (param : { values: object[] }) => {
  return { $and: param.values }
}

export const not = (param : { value: object }) => {
  return { $not: param.value }
}

export const nor = (param : { values: object[] }) => {
  return { $nor: param.values }
}

export const or = (param : { values: object[] }) => {
  return { $or: param.values }
}