import type { ObjectDefinition } from "@meta-system/object-definition";

// General Types
export type FunctionDefinition = {
  input : ObjectDefinition;
  output : ObjectDefinition;
  functionName : string;
}

// Schema functions types
export type SchemaInsertFunction = (parameters : { data : unknown }) => Promise<{ success : boolean, insertedKey : string }>;
export const schemaInsertFunctionDefinition : FunctionDefinition = {
  // TODO
};

export type SchemaDeleteByIdFunction = (parameters: { id : string }) => Promise<{ deleted : boolean }>;
export const schemaDeleteByIdFunctionDefinition : FunctionDefinition = {
  // TODO
};

export type SchemaUpdateByIdFunction = (parameters: { id : string }) => Promise<{ success : boolean }>;
export const schemaUpdateByIdFunctionDefinition : FunctionDefinition = {
  // TODO
};

export type SchemaFindByIdFunction = (parameters: { id : string }) => Promise<{ success : boolean, data : unknown }>;
export const schemaFindByIdFunctionDefinition : FunctionDefinition = {
  // TODO
};

export type SchemaFindFunction = (parameters: { query: object, limit ?: number, offset ?: number}) => Promise<{ data: unknown[], success: boolean }>;
export const schemaFindFunctionDefinition : FunctionDefinition = {
  // TODO
};