import { Collection, Db } from "mongodb";
import { SchemaHistory, SchemaHistoryEntry } from "./schema-history.js";

export class SchemaRepo {
  private readonly schemaHistoryCollectionName = "__DBSchemaVersioning";
  private readonly collections : Map<string, Collection> = new Map();
  private readonly schemas : Map<string, SchemaType> = new Map();
  private cachedLatestSchemaVersion : SchemaHistory;

  public constructor (
    private readonly schemaList : SchemaType[],
    private readonly connectedDb : Db,
    public readonly schemaDiffFunction : SchemaDiffFunction,
  ) {
    this.getCollection = this.getCollection.bind(this);
    this.getSchema = this.getSchema.bind(this);
    this.bootDb = this.bootDb.bind(this);
    this.compareSchemas = this.compareSchemas.bind(this);
    this.getNewSchemas = this.getNewSchemas.bind(this);
    this.getRenamedSchemas = this.getRenamedSchemas.bind(this);
    this.saveSchemaVersion = this.saveSchemaVersion.bind(this);
    this.getLatestSchemaVersion = this.getLatestSchemaVersion.bind(this);
  }

  public async bootDb () : Promise<void> {
    const newSchemas = await this.getNewSchemas();
    const renamedSchemas = await this.getRenamedSchemas();

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

  private async compareSchemas () : Promise<CompleteSchemaDiff[]> {
    const currentSchemas = await this.getLatestSchemaVersion();
    const comparison = this.schemaDiffFunction(currentSchemas?.schemaList || [], this.schemaList);

    return Object.values(comparison);
  }

  private async getNewSchemas () : Promise<SchemaType[]> {
    const comparedSchemas = await this.compareSchemas();

    const addedSchemas = comparedSchemas.filter((change) => {
      return change.changes
        .filter((item) => item.action === "added" && item.path === "FULL_SCHEMA")
        .length === 1;
    }).map((diff) => ({
      format: diff.changes[0].newState["format"],
      name: diff.changes[0].newState["name"],
      dbProtocol: diff.changes[0].newState["dbProtocol"],
      identifier: diff.changes[0].newState["identifier"],
    }));

    return addedSchemas;
  }

  // eslint-disable-next-line max-lines-per-function
  private async getRenamedSchemas () : Promise<{ identifier : string, newName : string, oldName : string }[]> {
    const comparedSchemas = await this.compareSchemas();
    const latestVersion = await this.getLatestSchemaVersion();

    const renamedSchemas = comparedSchemas.filter((change) => {
      return change.changes
        .filter((item) => item.action === "changed" && item.path === "name")
        .length !== 0;
    }).map((diff) => ({
      newName: diff.changes[0].newState as string,
      identifier: diff.identifier,
      oldName: latestVersion.schemaList
        .find((element) => element.identifier === diff.identifier)
        .name,
    }));

    return renamedSchemas;
  }

  private async saveSchemaVersion () : Promise<void> {
    const collection = this.connectedDb.collection(this.schemaHistoryCollectionName);
    const schemaHistory = new SchemaHistory(this.schemaList);

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
