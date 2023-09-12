import { MetaSystemFunction } from "../main-types.js";

// Logic Keys should always come before any object paths;
export const and = (param : { queries : object[] }) : object => {
  return { query: { $and: param.queries } };
};

export const andMetaSystemFunction : MetaSystemFunction = {
  function: and,
  definition: {
    functionName: "and",
    input: { queries: { type: "array", subtype: "cloudedObject", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};

export const not = (param : { query : object }) : object => {
  return { query: { $not: param.query } };
};

export const notMetaSystemFunction : MetaSystemFunction = {
  function: not,
  definition: {
    functionName: "not",
    input: { query: { type: "array", subtype: "cloudedObject", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};

export const nor = (param : { queries : object[] }) : object => {
  return { query: { $nor: param.queries } };
};

export const norMetaSystemFunction : MetaSystemFunction = {
  function: nor,
  definition: {
    functionName: "nor",
    input: { queries: { type: "array", subtype: "cloudedObject", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};

export const or = (param : { queries : object[] }) : object => {
  return { query: { $or: param.queries } };
};

export const orMetaSystemFunction : MetaSystemFunction = {
  function: or,
  definition: {
    functionName: "or",
    input: { queries: { type: "array", subtype: "cloudedObject", required: true } },
    output: { query: { type: "cloudedObject" } },
  },
};
