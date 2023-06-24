// Make a function to Add "_id" field to a schema
import { SchemaType } from "schema-repo.js";
import { ProtocolConfigParams } from "./main-class.js";

const addIdToSchema = (schema: SchemaType) : SchemaType => {
  schema.format["_id"] = { "type": "string" };

  return schema
}

export const configure = (broker, config : ProtocolConfigParams) => {
  const allSchemas = broker.schemas.getAll();

  const newSchemas: SchemaType[] = allSchemas.map(addIdToSchema)
  newSchemas.forEach((schema) => {
    broker.schemas.modifySchema(schema);
  })
}

export const boot = (broker, context) => {
  // Launch server
}

