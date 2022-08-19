import { ObjectId } from "mongodb";

type CreateObjectIdType = {
  errorMessage ?: string;
  objectId ?: ObjectId;
}

export function createObjectId (input : {stringId : string}) : CreateObjectIdType {
  if(!ObjectId.isValid(input.stringId)) return { errorMessage: "Input must be a 12 char string or 24 char hex id" };
  return { objectId: new ObjectId(input.stringId) };
};
