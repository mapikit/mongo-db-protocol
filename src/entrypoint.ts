// Make a function to Add "_id" field to a schema
import { SchemaType } from "./schema-repo.js";
import { MongoDbProtocol, ProtocolConfigParams } from "./main-class.js";
import { createObjectIdMetaSystemFunction } from "./functions/createObjectId.js";
import { allElementsMetaSystemFunction,
  containsElementThatMetaSystemFunction,
  listSizeIsMetaSystemFunction } from "./functions/list-operators.js";
import { andMetaSystemFunction,
  norMetaSystemFunction,
  notMetaSystemFunction,
  orMetaSystemFunction } from "./functions/logic-operators.js";
import { equalMetaSystemFunction,
  existsMetaSystemFunction,
  greaterOrEqualToMetaSystemFunction,
  greaterThanMetaSystemFunction,
  isNoneOfMetaSystemFunction,
  isOneOfMetaSystemFunction,
  lesserOrEqualToMetaSystemFunction,
  lesserThanMetaSystemFunction,
  matchesRegexMetaSystemFunction,
  notEqualMetaSystemFunction } from "./functions/query-operators.js";
import { schemaInsertFunctionDefinition,
  type FunctionDefinition,
  schemaUpdateByIdFunctionDefinition,
  schemaDeleteByIdFunctionDefinition,
  schemaFindByIdFunctionDefinition,
  schemaCountFunctionDefinition,
  schemaFindFunctionDefinition,
  schemaUpdateFunctionDefinition,
  schemaDeleteFunctionDefinition } from "./main-types.js";
import { sortResultMetaSystemFunction } from "./functions/extras.js";


const addIdToSchema = (schema : SchemaType) : SchemaType => {
  schema.format["_id"] = { "type": "string" };

  return schema;
};

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
  sortResultMetaSystemFunction,
];

const schemaFunctions : FunctionDefinition[] = [
  schemaInsertFunctionDefinition,
  schemaUpdateByIdFunctionDefinition,
  schemaDeleteByIdFunctionDefinition,
  schemaFindByIdFunctionDefinition,
  schemaCountFunctionDefinition,
  schemaFindFunctionDefinition,
  schemaUpdateFunctionDefinition,
  schemaDeleteFunctionDefinition,
];

const schemaFunctionsMap : [FunctionDefinition, keyof MongoDbProtocol][] = [
  [schemaInsertFunctionDefinition, "getSchemaInsertFunction"],
  [schemaUpdateByIdFunctionDefinition, "getUpdateByIdFunction"],
  [schemaDeleteByIdFunctionDefinition, "getSchemaDeleteByIdFunction"],
  [schemaFindByIdFunctionDefinition, "getFindByIdFunction"],
  [schemaCountFunctionDefinition, "getSchemaCountFunction"],
  [schemaFindFunctionDefinition, "getSchemaFindFunction"],
  [schemaUpdateFunctionDefinition, "getSchemaUpdateFunction"],
  [schemaDeleteFunctionDefinition, "getSchemaDeleteFunction"],
];

// eslint-disable-next-line max-lines-per-function
export const configure = (broker, config : ProtocolConfigParams) : ProtocolConfigParams => {
  const allSchemas : SchemaType[] = broker.schemas.getAll();
  const usedSchemas = config.usedSchemas !== undefined ? config.usedSchemas.map((item) => {
    return allSchemas.find((schema) => schema.identifier === item.identifier);
  }).filter(i => i) : allSchemas;

  const newSchemas : SchemaType[] = usedSchemas.map(addIdToSchema);
  newSchemas.forEach((schema) => {
    broker.schemas.modifySchema(schema);
  });

  const updatedSchemas : SchemaType[] = broker.schemas.getAll();

  libraryFunctions.forEach((func) => {
    broker.addonsFunctions.register(func.function, func.definition);
  });

  updatedSchemas.forEach((schema) => {
    for (const definition of schemaFunctions) {
      broker.schemaFunctions.preRegisterSchemaFunction(
        schema.name, definition,
      );
    }
  });

  broker.done();
  return config;
};

// eslint-disable-next-line max-lines-per-function
export const boot = async (broker, context : ProtocolConfigParams) : Promise<void> => {
  // Launch server
  const allSchemas : SchemaType[] = broker.schemas.getAll();
  const usedSchemas = context.usedSchemas !== undefined ? context.usedSchemas.map((item) => {
    return allSchemas.find((schema) => schema.identifier === item.identifier);
  }).filter(i => i) : allSchemas;

  const mongoDbProtocol = new MongoDbProtocol(context, broker.logger, usedSchemas);

  await mongoDbProtocol.initialize();

  usedSchemas.forEach((schema) => {
    for (const nameMap of schemaFunctionsMap) {
      broker.schemaFunctions.setRegisteredSchemaFunction(
        schema.name,
        nameMap[0].functionName,
        mongoDbProtocol[nameMap[1]](schema.name),
      );
    }
  });
};

