import { SchemaList } from "@meta-system/meta-protocol-helper/dist/src/db-protocol";
import { MongoDbProtocol, ProtocolConfigParams } from "main-class";
import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";
import { ObjectId } from "mongodb";

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

const dollarSchema : SchemaList = [
  {
    "dbProtocol": "1234",
    "format": {
      dollarBillsInVirtualWallet: { "type": "array", "subtype": "number" },
      name: { type: "string" },
    },
    "identifier": "xyz",
    "name": "testSchema",
  },
];

const dollarSchemaEntities = [
  { dollarBillsInVirtualWallet: [ 2, 5, 5, 20, 50, 100 ], name: "Mary" },
  { dollarBillsInVirtualWallet: [ 5, 10, 100, 100 ], name: "John" },
  { dollarBillsInVirtualWallet: [ 2, 10, 10, 50, 100 ], name: "Candice" },
  { dollarBillsInVirtualWallet: [ 5, 10, 50, 50 ], name: "Juan" },
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

  it("Builds and executes queries successfully", async () => {
    const config : ProtocolConfigParams = { dbConnectionString: await generateUri(), databaseName: "SomeDb" };
    const mainClassInstance = new MongoDbProtocol(config, dollarSchema);

    await mainClassInstance.initialize();

    for (const entity of dollarSchemaEntities) {
      await mainClassInstance.insert("xyz", { data: entity });
    }

    const result = await mainClassInstance.find("xyz", { query: {
      dollarBillsInVirtualWallet: {
        one_fulfills: { greater_or_equal_to: 20, less_than: 50 },
      },
    }, limit: 10 });

    expect(result.success).to.be.true;
    expect(result.data[0]["name"]).to.be.equal("Mary");
    expect(result.pages).to.be.equal(1);
  });

  it("Executes Updates", async () => {
    const config : ProtocolConfigParams = { dbConnectionString: await generateUri(), databaseName: "SomeDb" };
    const mainClassInstance = new MongoDbProtocol(config, sampleSchema);

    await mainClassInstance.initialize();
    const inserted = await mainClassInstance.insert("abcd", { data: { name: "john", age: 22 } });

    const resultId = await mainClassInstance.updateById("abcd", { data: { name: "Johnny" }, id: inserted.insertedId });
    const unmodifiedAge = (await mainClassInstance.findById("abcd", { id: inserted.insertedId })).data["age"];

    const resultQuery = await mainClassInstance.update("abcd", { data: { age: 23 },
      query: { age: { equal_to: 22 } } },
    );
    const unmodifiedName = (await mainClassInstance.findById("abcd", { id: inserted.insertedId })).data["name"];

    expect(unmodifiedAge).to.be.equal(22);
    expect(unmodifiedName).to.be.equal("Johnny");
    expect(resultQuery.affectedEntities).to.be.equal(1);
    expect(resultId.success && resultQuery.success).to.be.true;
  });

  it("Tests protocol functions", async () => {
    const config : ProtocolConfigParams = { dbConnectionString: await generateUri(), databaseName: "SomeDb" };
    const mainClassInstance = new MongoDbProtocol(config, sampleSchema);

    await mainClassInstance.initialize();

    const stringId = "62eb0da09be812a2ffb6804c";
    const methods = mainClassInstance.getProtocolPublicMethods();
    const objectId : ObjectId = methods.createObjectId({ stringId }).objectId;

    expect(objectId instanceof ObjectId).to.be.true;
    expect(typeof stringId).to.be.equal("string");
    expect(objectId.toString()).to.be.equal(stringId);
  });
});
