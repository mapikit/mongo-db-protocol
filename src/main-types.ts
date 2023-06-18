// Schema functions types
export type SchemaInsertFunction = (parameters : { data : unknown }) => Promise<{ success : boolean, insertedKey : string }>;
export const schemaInsertFunctionDefinition = {
  // TODO
};

export type SchemaDeleteByIdFunction = (parameters: { id : string }) => Promise<{ deleted : boolean }>;
export const schemaDeleteByIdFunctionDefinition = {
  // TODO
};

export type SchemaUpdateByIdFunction = (parameters: { id : string }) => Promise<{ success : boolean }>;
export const schemaUpdateByIdFunctionDefinition = {
  // TODO
};

export type SchemaFindByIdFunction = (parameters: { id : string }) => Promise<{ success : boolean, data : unknown }>;
export const schemaFindByIdFunctionDefinition = {
  // TODO
};

export type SchemaFindFunction = (parameters: { query: object, limit ?: number, offset ?: number}) => Promise<{ data: unknown[], success: boolean }>;
export const schemaFindFunctionDefinition = {
  // TODO
};