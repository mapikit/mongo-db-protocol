import { Collection, Db } from "mongodb";
import { SchemaHistory, SchemaHistoryEntry } from "./schema-history.js";

export type SchemaType = {
  name : string;
  identifier : string;
  format : Object; // Object Definition
}

export class SchemaRepo {
  private readonly schemaHistoryCollectionName = "__DBSchemaVersioning";
  private readonly collections : Map<string, Collection> = new Map();
  private readonly schemas : Map<string, SchemaType> = new Map();
  private cachedLatestSchemaVersion ?: SchemaHistory;
  private readonly indexedSchemas : SchemaType[] = [];

  public constructor (
    private readonly schemaList : SchemaType[],
    private readonly connectedDb : Db,
  ) {
    this.getCollection = this.getCollection.bind(this);
    this.getSchema = this.getSchema.bind(this);
    this.bootDb = this.bootDb.bind(this);
    this.getNewSchemas = this.getNewSchemas.bind(this);
    this.getRenamedSchemas = this.getRenamedSchemas.bind(this);
    this.saveSchemaVersion = this.saveSchemaVersion.bind(this);
    this.getLatestSchemaVersion = this.getLatestSchemaVersion.bind(this);
  }

  public async bootDb () : Promise<void> {
    await this.getLatestSchemaVersion();
    const newSchemas = this.getNewSchemas();
    const renamedSchemas = this.getRenamedSchemas();

    for (const newSchema of newSchemas) {
      await this.connectedDb.createCollection(newSchema.name);
    }

    for (const renamedSchema of renamedSchemas) {
      await this.connectedDb.renameCollection(renamedSchema.oldName, renamedSchema.newName);
    }

    await this.saveSchemaVersion();

    this.schemaList.forEach((schema) => {
      this.collections.set(schema.identifier, this.connectedDb.collection(schema.name));
      this.schemas.set(schema.identifier, schema);
    });
  }

  private getNewSchemas () : SchemaType[] {
    return this.schemaList.filter((schema) => {
      return this.cachedLatestSchemaVersion?.schemaList
        ? !this.cachedLatestSchemaVersion.schemaList.find((item) => item.identifier === schema.identifier)
        : true
    })
  }

  private getRenamedSchemas () : { identifier : string, newName : string, oldName : string }[] {
    if (!this.cachedLatestSchemaVersion) {
      return []
    }

    const results = [];

    for (const schema of this.schemaList) {
      const oldSchema = this.cachedLatestSchemaVersion.schemaList
        .find((item) => item.identifier === schema.identifier )
      if (oldSchema.name !== schema.name) {
        results.push({ identifier: schema.identifier, newName: schema.name, oldName: oldSchema.name })
      }
    }

    return results;
  }

  private async saveSchemaVersion () : Promise<void> {
    const collection = this.connectedDb.collection(this.schemaHistoryCollectionName);
    const schemaHistory = new SchemaHistory(this.indexedSchemas);

    await collection.insertOne(schemaHistory.getHistoryEntry());
  }

  private async getLatestSchemaVersion () : Promise<SchemaHistory | undefined> {
    if (this.cachedLatestSchemaVersion !== undefined) { return this.cachedLatestSchemaVersion; };

    const collection = this.connectedDb.collection(this.schemaHistoryCollectionName);

    const resultCursor = await collection.find<SchemaHistoryEntry>({}).sort({ creationDate: -1 });
    const result : SchemaHistoryEntry[] = [];
    await resultCursor.forEach((document) => { result.push(document); });

    if (!result[0]) {
      return undefined;
    }

    this.cachedLatestSchemaVersion = SchemaHistory.fromDB(result[0]);

    return this.cachedLatestSchemaVersion;
  }

  public getCollection (schemaId : string) : Collection {
    return this.collections.get(schemaId);
  }

  public getSchema (schemaId : string) : SchemaType {
    return this.schemas.get(schemaId);
  }
}
