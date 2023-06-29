/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Disabled because the type is elsewhere for the violations in this file
import * as Mongo from "mongodb";
import { SchemaRepo, SchemaType } from "./schema-repo.js";
import { SchemaCountFunction,
  SchemaDeleteByIdFunction,
  SchemaDeleteFunction,
  SchemaFindByIdFunction,
  SchemaFindFunction,
  SchemaInsertFunction,
  SchemaUpdateByIdFunction,
  SchemaUpdateFunction } from "./main-types.js";

type LoggerFunction = (...data : unknown[]) => void
type Logger = {
  fatal : LoggerFunction;
  success : LoggerFunction;
  operation : LoggerFunction;
  error : LoggerFunction;
  warn : LoggerFunction;
  info : LoggerFunction;
  debug : LoggerFunction;
}

export interface ProtocolConfigParams {
  dbConnectionString : string;
  databaseName : string;
  usedSchemas ?: { identifier : string }[]
  defaultLimit ?: number;
}

export class MongoDbProtocol {
  private connection : Mongo.MongoClient;
  private db : Mongo.Db;
  private schemaRepo : SchemaRepo;
  private defaultLimit = 1000;

  // eslint-disable-next-line max-lines-per-function
  constructor (
    private readonly protocolConfiguration : ProtocolConfigParams,
    public readonly logger : Logger,
    private readonly schemaList : SchemaType[],
  ) {
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.getSchemaInsertFunction = this.getSchemaInsertFunction.bind(this);
    this.getSchemaDeleteByIdFunction = this.getSchemaDeleteByIdFunction.bind(this);
    this.getUpdateByIdFunction = this.getUpdateByIdFunction.bind(this);
    this.getSchemaUpdateFunction = this.getSchemaUpdateFunction.bind(this);
    this.getSchemaDeleteFunction = this.getSchemaDeleteFunction.bind(this);
    this.getFindByIdFunction = this.getFindByIdFunction.bind(this);
    this.getSchemaFindFunction = this.getSchemaFindFunction.bind(this);
    this.getSchemaCountFunction = this.getSchemaCountFunction.bind(this);

    this.defaultLimit = protocolConfiguration.defaultLimit ?? 1000;
  }

  public async initialize () : Promise<void> {
    const connection = new Mongo.MongoClient(this.protocolConfiguration.dbConnectionString);
    this.connection = await connection.connect();

    this.db = this.connection.db(this.protocolConfiguration.databaseName);

    await this.db.command({ ping: 1 });
    this.logger.info(`[Mongo DB Protocol] Success connecting to "${this.protocolConfiguration.databaseName}"`);

    this.schemaRepo = new SchemaRepo(this.schemaList, this.db);
    await this.schemaRepo.bootDb();
  }

  public async shutdown () : Promise<void> {
    await this.connection.close();

    delete this.schemaRepo;
    delete this.connection;
    delete this.db;
  }

  public getSchemaInsertFunction (schemaIdentifier : string) : SchemaInsertFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      const result = await schemaCollection.insertOne(parameters.data);

      return {
        success: result.insertedId !== undefined,
        insertedId: result.insertedId.toString(),
      };
    };
  }

  public getSchemaDeleteByIdFunction (schemaIdentifier : string) : SchemaDeleteByIdFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      await schemaCollection.deleteOne({ _id: new Mongo.ObjectId(parameters.id) });

      return {
        deleted: true,
      };
    };
  }

  public getUpdateByIdFunction (schemaIdentifier : string) : SchemaUpdateByIdFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      const result = await schemaCollection.updateOne(
        { _id: new Mongo.ObjectId(parameters.id) }, { $set: parameters.data },
      );

      return {
        success: result.modifiedCount > 0,
      };
    };
  }

  public getFindByIdFunction (schemaIdentifier : string) : SchemaFindByIdFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      const result = schemaCollection.findOne({ _id: new Mongo.ObjectId(parameters.id) });

      return {
        success: true,
        data: result,
      };
    };
  }

  public getSchemaUpdateFunction (schemaIdentifier : string) : SchemaUpdateFunction {
    const collection = this.schemaRepo.getCollection(schemaIdentifier);

    return async (parameters) => {
      const result = await collection.updateMany(parameters.query, { $set: parameters.updatedData });

      return {
        success: result !== undefined,
        updatedCount: result.modifiedCount,
      };
    };
  }

  public getSchemaDeleteFunction (schemaIdentifier : string) : SchemaDeleteFunction {
    const collection = this.schemaRepo.getCollection(schemaIdentifier);

    return async (parameters) => {
      const result = await collection.deleteMany(parameters.query);

      return {
        success: result !== undefined,
        deletedCount: result.deletedCount,
      };
    };
  }

  // eslint-disable-next-line max-lines-per-function
  public getSchemaFindFunction (schemaIdentifier : string) : SchemaFindFunction {
    const collection = this.schemaRepo.getCollection(schemaIdentifier);

    return async (parameters) => {
      let partialResult = collection.find(parameters.query);

      if (parameters.limit) partialResult = partialResult.limit(parameters.limit ?? this.defaultLimit);
      if (parameters.offset) partialResult = partialResult.skip(parameters.offset);
      const data = await partialResult.toArray();
      const totalCount = data.length;
      const pages = parameters.limit ? Math.ceil((totalCount) / parameters.limit) : undefined;

      return {
        data: [],
        success: true,
        pages,
      };
    };
  }

  public getSchemaCountFunction (schemaIdentifier : string) : SchemaCountFunction {
    const collection = this.schemaRepo.getCollection(schemaIdentifier);

    return async (parameters) => {
      const result = await collection.countDocuments(parameters.query);

      return {
        success: result !== undefined,
        count: result,
      };
    };
  }
}
