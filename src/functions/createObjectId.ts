import { FunctionDefinition, MetaSystemFunction } from "../main-types.js";
import { ObjectId } from "mongodb";

type CreateObjectIdType = {
  errorMessage ?: string;
  objectId ?: ObjectId;
}

export function createObjectId (input : {stringId : string}) : CreateObjectIdType {
  if(!ObjectId.isValid(input.stringId)) return { errorMessage: "Input must be a 12 char string or 24 char hex id" };
  return { objectId: new ObjectId(input.stringId) };
};

export const createObjectIdFunctionDefinition : FunctionDefinition = {
  functionName: "createObjectId",
  input: { "stringId": { type: "string", required: true } },
  output: {
    "errorMessage": { "type": "string", "required": false },
    "objectId": { "type": "cloudedObject", "required": false }
  }
}

export const createObjectIdMetaSystemFunction : MetaSystemFunction = {
  function: createObjectId,
  definition: createObjectIdFunctionDefinition
}