// Multi Element Operations
export const containsElementThat = (param : { rules: object[] }) => {
  return { $elemMatch: param.rules }
}

export const allElements = (param : { rules: object[] }) => {
  return { $all: param.rules }
}

export const listSizeIs = (param : { size: number }) => {
  return { $size: param.size }
}
