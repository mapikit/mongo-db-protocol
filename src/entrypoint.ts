// Make a function to Add "_id" field to a schema
import { SchemaType } from "schema-repo.js";
import { ProtocolConfigParams } from "./main-class.js";
import { createObjectIdMetaSystemFunction } from "./functions/createObjectId.js";
import { allElementsMetaSystemFunction,
  containsElementThatMetaSystemFunction,
  listSizeIsMetaSystemFunction } from "./functions/list-operators.js";
import { andMetaSystemFunction,
  norMetaSystemFunction,
  notMetaSystemFunction,
  orMetaSystemFunction } from "functions/logic-operators.js";
import { equalMetaSystemFunction,
  existsMetaSystemFunction,
  greaterOrEqualToMetaSystemFunction,
  greaterThanMetaSystemFunction,
  isNoneOfMetaSystemFunction,
  isOneOfMetaSystemFunction,
  lesserOrEqualToMetaSystemFunction,
  lesserThanMetaSystemFunction,
  matchesRegexMetaSystemFunction,
  notEqualMetaSystemFunction } from "functions/query-operators.js";


const addIdToSchema = (schema: SchemaType) : SchemaType => {
  schema.format["_id"] = { "type": "string" };

  return schema
}

const libraryFunctions = [
  createObjectIdMetaSystemFunction,
  containsElementThatMetaSystemFunction,
  allElementsMetaSystemFunction,
  listSizeIsMetaSystemFunction,
  andMetaSystemFunction,
  notMetaSystemFunction,
  norMetaSystemFunction,
  orMetaSystemFunction,
  equalMetaSystemFunction,
  notEqualMetaSystemFunction,
  greaterThanMetaSystemFunction,
  greaterOrEqualToMetaSystemFunction,
  lesserThanMetaSystemFunction,
  lesserOrEqualToMetaSystemFunction,
  isOneOfMetaSystemFunction,
  isNoneOfMetaSystemFunction,
  existsMetaSystemFunction,
  matchesRegexMetaSystemFunction,
]

export const configure = (broker, config : ProtocolConfigParams) => {
  const allSchemas = broker.schemas.getAll();

  const newSchemas: SchemaType[] = allSchemas.map(addIdToSchema)
  newSchemas.forEach((schema) => {
    broker.schemas.modifySchema(schema);
  });

  libraryFunctions.forEach((func) => {
    broker.addonsFunctions.register(func.function, func.definition)
  })

  broker.done();
}

export const boot = (broker, context) => {
  // Launch server
}

