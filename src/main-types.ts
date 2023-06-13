// Schema functions types
export type SchemaInsertFunction = (parameters : { data : unknown }) => Promise<{ success : boolean, insertedKey : string }>
export const schemaInsertFunctionDefinition = {
  // TODO
}

export type SchemaDeleteByIdFunction = (parameters: { key : string }) => Promise<{ deleted : boolean }>