import type { ObjectDefinition } from "@meta-system/object-definition";

// General Types
export type FunctionDefinition = {
  input : ObjectDefinition;
  output : ObjectDefinition;
  functionName : string;
}

export type MetaSystemFunction = {
  function : Function;
  definition : FunctionDefinition;
}

// Schema functions types
export type SchemaInsertFunction = (parameters : { data : unknown })
=> Promise<{ success : boolean, insertedId : string }>;
export const schemaInsertFunctionDefinition : FunctionDefinition = {
  functionName: "insert",
  input: { data: { type: "cloudedObject", required: true } },
  output: { success: { type: "boolean", required: true }, insertedId: { type: "string", required: false } },
};

export type SchemaDeleteByIdFunction = (parameters : { id : string }) => Promise<{ deleted : boolean }>;
export const schemaDeleteByIdFunctionDefinition : FunctionDefinition = {
  functionName: "deleteById",
  input: { id: { type: "string" } },
  output: { deleted: { type: "boolean", required: true } },
};

export type SchemaUpdateByIdFunction = (parameters : { id : string, data : unknown }) => Promise<{ success : boolean }>;
export const schemaUpdateByIdFunctionDefinition : FunctionDefinition = {
  functionName: "updateById",
  input: { data: { type: "cloudedObject", required: true }, id: { type: "string", required: true } },
  output: { success: { type: "boolean", required: true } },
};

export type SchemaFindByIdFunction = (parameters : { id : string }) => Promise<{ success : boolean, data : unknown }>;
export const schemaFindByIdFunctionDefinition : FunctionDefinition = {
  functionName: "findById",
  input: { id: { type: "string", required: true } },
  output: { success: { type: "boolean", required: true }, data: { type: "cloudedObject", required: true } },
};

export type SchemaFindFunction = (parameters : { query ?: object, sort ?: object ,limit ?: number, offset ?: number})
=> Promise<{ data : unknown[], success : boolean, total : number }>;
export const schemaFindFunctionDefinition : FunctionDefinition = {
  functionName: "find",
  input: {
    query: { type: "cloudedObject", required: false },
    sort: { type: "cloudedObject", required: false },
    limit: { type: "number", required: false },
    offset: { type: "number", required: false },
  },
  output: {
    success: { type: "boolean", required: true },
    data: { type: "array", required: false, subtype: "cloudedObject" },
    total: { type: "number", required: true },
  },
};

export type SchemaCountFunction = (parameters : { query : object }) => Promise<{ success : boolean, count ?: number }>;
export const schemaCountFunctionDefinition : FunctionDefinition = {
  functionName: "count",
  input: { query: { type: "cloudedObject", required: true } },
  output: { success: { type: "boolean", required: true }, count: { type: "number", required: false } },
};

export type SchemaDeleteFunction = (parameters : { query : object })
=> Promise<{ success : boolean, deletedCount ?: number }>;
export const schemaDeleteFunctionDefinition : FunctionDefinition = {
  functionName: "delete",
  input: { query: { type: "cloudedObject", required: true } },
  output: { success: { type: "boolean", required: true }, deletedCount: { type: "number", required: false } },
};

export type SchemaUpdateFunction = (parameters : { query : object, updatedData : object })
=> Promise<{ success : boolean, updatedCount ?: number }>;
export const schemaUpdateFunctionDefinition : FunctionDefinition = {
  functionName: "delete",
  input: { query: { type: "cloudedObject", required: true } },
  output: { success: { type: "boolean", required: true }, deletedCount: { type: "number", required: false } },
};
