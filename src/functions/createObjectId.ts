import { ObjectId } from "mongodb";

type CreateError = {
  errorMessage : string
}

export function createObjectId (input : {stringId : string}) : ObjectId | CreateError {
  if(!ObjectId.isValid(input.stringId)) return { errorMessage: "Input must be a 12 char string or 24 char hex id" };
  return new ObjectId(input.stringId);
};
