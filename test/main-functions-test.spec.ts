import { MongoDbProtocol, ProtocolConfigParams } from "../src/main-class.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";
import { ObjectId } from "mongodb";
import { SchemaType } from "../src/schema-repo.js";
import { loggerMock } from "./logger.mock.js";
import { containsElementThat } from "../src/functions/list-operators.js";
import { greaterOrEqualTo, lesserThan } from "../src/functions/query-operators.js";

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

const dollarSchema : SchemaType[] = [
  {
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
  const mongoClientServer = new MongoMemoryServer();
  const uri = await mongoClientServer.getUri();

  return uri;
};

describe("General Tests", () => {
  it("Executes insert function", async () => {
    const config : ProtocolConfigParams = { dbConnectionString: await generateUri(), databaseName: "SomeDb" };
    const mainClassInstance = new MongoDbProtocol(config, loggerMock, sampleSchema);

    await mainClassInstance.initialize();
    const insertSchemaFunction = mainClassInstance.getSchemaInsertFunction(sampleSchema[0].identifier);
    const result = await insertSchemaFunction({ data: { name: "josh", age: 22 } });

    expect(result.success).to.be.true;
  });

  it("Builds and executes queries successfully", async () => {
    const config : ProtocolConfigParams = { dbConnectionString: await generateUri(), databaseName: "SomeDb" };
    const mainClassInstance = new MongoDbProtocol(config, loggerMock, dollarSchema);

    await mainClassInstance.initialize();
    const insertSchemaFunction = mainClassInstance.getSchemaInsertFunction(dollarSchema[0].identifier);
    const findSchemaFunction = mainClassInstance.getSchemaFindFunction(dollarSchema[0].identifier);

    for (const entity of dollarSchemaEntities) {
      await insertSchemaFunction({ data: entity });
    }

    // Step would be executed by Meta-System :ok_hand:
    const query = {
      dollarBillsInVirtualWallet: containsElementThat({
        rules: [
          greaterOrEqualTo({ value: 20 })["query"],
          lesserThan({ value: 50 })["query"],
        ],
      })["query"],
    };

    const result = await findSchemaFunction({ query, limit: 10 });

    expect(result.success).to.be.true;
    expect(result.data[0]["name"]).to.be.equal("Mary");
    expect(result.pages).to.be.equal(1);
  });
});
