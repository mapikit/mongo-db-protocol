import { MetaSystemFunction } from "main-types.js";

// Multi Element Operations
export const containsElementThat = (param : { rules : object[] }) : object => {
  return { query: { $elemMatch: param.rules } };
};

export const containsElementThatMetaSystemFunction : MetaSystemFunction = {
  function: containsElementThat,
  definition: {
    functionName: "containsElementThat",
    input: { rules: { type: "array", subtype: "cloudedObject", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};

export const allElements = (param : { rules : object[] }) : object  => {
  return { query: { $all: param.rules } };
};

export const allElementsMetaSystemFunction : MetaSystemFunction = {
  function: allElements,
  definition: {
    functionName: "allElements",
    input: { rules: { type: "array", subtype: "cloudedObject", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};

export const listSizeIs = (param : { size : number }) : object  => {
  return { query: { $size: param.size } };
};

export const listSizeIsMetaSystemFunction : MetaSystemFunction = {
  function: listSizeIs,
  definition: {
    functionName: "listSizeIs",
    input: { size: { type: "number", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};
