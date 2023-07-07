import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";
import { SchemaRepo, SchemaType } from "../src/schema-repo.js";
import * as Mongo from "mongodb";
import { SchemaHistoryEntry } from "schema-history.js";

const sampleSchema : SchemaType[] = [
  {
    "format": {
      name: { type: "string", required: true },
      age: { type: "number", required: true },
    },
    "identifier": "abcd",
    "name": "testSchema",
  },
];

const generateUri = async () : Promise<string> => {
  const mongoClientServer = new MongoMemoryServer();
  const uri = await mongoClientServer.getUri();

  return uri;
};

describe("Schema Repo Tests", () => {
  it("First insertion writes current schemas to DB history", async () => {
    const uri = await generateUri();
    const database = new Mongo.MongoClient(uri).db();
    const schemaRepo = new SchemaRepo(sampleSchema, database);

    await schemaRepo.bootDb();
    const historyEntry = await database.collection(schemaRepo.schemaHistoryCollectionName)
      .findOne<SchemaHistoryEntry>();
    expect(historyEntry.schemaList).to.be.deep.equal(sampleSchema);
  });
});
