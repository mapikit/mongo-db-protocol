import { MetaSystemFunction } from "../main-types.js";

export function sortResult (input : { mode : "ascending"|"descending" }) : object {
  return { sort: input.mode === "ascending" ? 1 : -1 };
};

export const sortResultMetaSystemFunction : MetaSystemFunction = {
  function: sortResult,
  definition: {
    functionName: "sortResult",
    input: { "mode": { type: "enum", required: true, subtype: ["ascending", "descending"] } },
    output: {
      "sort": { type: "number", required: true },
    },
  },
};
