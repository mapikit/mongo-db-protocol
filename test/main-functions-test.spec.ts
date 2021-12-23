import { SchemaList } from "@meta-system/meta-protocol-helper/dist/src/db-protocol";
import { MongoDbProtocol, ProtocolConfigParams } from "main-class";
import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";

const sampleSchema : SchemaList = [
  {
    "dbProtocol": "1234",
    "format": {
      name: { type: "string", required: true },
      age: { type: "number", required: true },
    },
    "identifier": "abcd",
    "name": "testSchema",
  },
];

const generateUri = async () : Promise<string> => {
  const mongoClientServer = await MongoMemoryServer.create();
  const uri = mongoClientServer.getUri();

  return uri;
};

describe("General Tests", () => {
  it("Executes insert function", async () => {
    const config : ProtocolConfigParams = { dbConnectionString: await generateUri(), databaseName: "SomeDb" };
    const mainClassInstance = new MongoDbProtocol(config, sampleSchema);

    await mainClassInstance.initialize();
    const result = await mainClassInstance.insert("abcd", { data: { name: "josh", age: 22 } });

    expect(result.success).to.be.true;
  });
});
