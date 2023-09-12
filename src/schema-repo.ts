import { Collection, Db } from "mongodb";
import { SchemaHistory, SchemaHistoryEntry } from "./schema-history.js";
import type { ObjectDefinition } from "@meta-system/object-definition";

export type SchemaType = {
  name : string;
  identifier : string;
  format : ObjectDefinition; // Object Definition
}

export class SchemaRepo {
  public readonly schemaHistoryCollectionName = "__DBSchemaVersioning";
  private readonly collections : Map<string, Collection> = new Map();
  private readonly schemas : Map<string, SchemaType> = new Map();
  private cachedLatestSchemaVersion ?: SchemaHistory;

  public constructor (
    private readonly schemaList : SchemaType[],
    private readonly connectedDb : Db,
  ) {
    this.getCollection = this.getCollection.bind(this);
    this.getSchema = this.getSchema.bind(this);
    this.bootDb = this.bootDb.bind(this);
    this.saveSchemaVersion = this.saveSchemaVersion.bind(this);
    this.getLatestSchemaVersion = this.getLatestSchemaVersion.bind(this);
    this.setSchemaData = this.setSchemaData.bind(this);
  }

  // eslint-disable-next-line max-lines-per-function
  public async bootDb () : Promise<void> {
    await this.getLatestSchemaVersion();
    await this.saveSchemaVersion();
    this.setSchemaData();
  }

  private setSchemaData () : void {
    this.schemaList.forEach((schema) => {
      this.collections.set(schema.identifier, this.connectedDb.collection(schema.identifier));
      this.schemas.set(schema.identifier, schema);
    });
  }

  private async saveSchemaVersion () : Promise<void> {
    const collection = this.connectedDb.collection(this.schemaHistoryCollectionName);
    const schemaHistory = new SchemaHistory(this.schemaList);

    await collection.insertOne(schemaHistory.getHistoryEntry());
  }

  private async getLatestSchemaVersion () : Promise<SchemaHistory | undefined> {
    if (this.cachedLatestSchemaVersion !== undefined) { return this.cachedLatestSchemaVersion; };

    const collection = this.connectedDb.collection(this.schemaHistoryCollectionName);

    const resultCursor = collection.find<SchemaHistoryEntry>({}).sort({ creationDate: -1 });
    const result : SchemaHistoryEntry[] = [];
    for await (const document of resultCursor) {
      result.push(document);
    }

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
