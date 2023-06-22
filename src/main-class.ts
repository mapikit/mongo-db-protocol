import * as Mongo from "mongodb";
import { SchemaRepo, SchemaType } from "./schema-repo.js";
import { SchemaDeleteByIdFunction, SchemaFindByIdFunction, SchemaFindFunction, SchemaInsertFunction, SchemaUpdateByIdFunction } from "./main-types.js";

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

  constructor (
    private readonly protocolConfiguration : ProtocolConfigParams,
    public readonly logger : Logger,
    private readonly schemaList : SchemaType[]
  ) {
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.getSchemaInsertFunction = this.getSchemaInsertFunction.bind(this);
    this.getSchemaDeleteByIdFunction = this.getSchemaDeleteByIdFunction.bind(this);
    this.updateById = this.updateById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.findById = this.findById.bind(this);
    this.find = this.find.bind(this);
    this.count = this.count.bind(this);

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
        insertedKey: result.insertedId.toString(),
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
    }
  }

  public updateById (schemaIdentifier : string) : SchemaUpdateByIdFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      const result = await schemaCollection.updateOne({ _id: new Mongo.ObjectId(parameters.id)}, { $set: parameters.data } )

      return {
        success: result.modifiedCount > 0
      }
    }
  }

  public findById (schemaIdentifier : string) : SchemaFindByIdFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      const result = schemaCollection.findOne({ _id: new Mongo.ObjectId(parameters.id) })

      return {
        success: true,
        data: result,
      };
    }
  }

  public async update (schemaIdentifier : string, parameters : { data : unknown, query : QueryType })
    : Promise<QueryOperationResponse> {
    const schema = this.schemaRepo.getSchema(schemaIdentifier);
    const builtQuery = new MongoSchemaQueryBuilder(parameters.query, this.getQueryPerProperty, schema)
      .getFullMongoQuery();

    const result = await this.schemaRepo.getCollection(schemaIdentifier).updateMany(builtQuery, { $set: parameters.data });

    return {
      success: result !== undefined,
      affectedEntities: result.modifiedCount,
    };
  }

  public async delete (schemaIdentifier : string, parameters : { query : QueryType }) : Promise<QueryOperationResponse> {
    const schema = this.schemaRepo.getSchema(schemaIdentifier);
    const builtQuery = new MongoSchemaQueryBuilder(parameters.query, this.getQueryPerProperty, schema)
      .getFullMongoQuery();

    const result = await this.schemaRepo.getCollection(schemaIdentifier).deleteMany(builtQuery);

    return {
      success: result !== undefined,
      affectedEntities: result.deletedCount,
    };
  }

  // eslint-disable-next-line max-lines-per-function
  public find (schemaIdentifier : string) : SchemaFindFunction {
    const collection = this.schemaRepo.getCollection(schemaIdentifier);

    const result = async (parameters) => {
      let partialResult = collection.find(parameters.query);

      if (parameters.limit) partialResult = partialResult.limit(parameters.limit ?? this.defaultLimit);
      if (parameters.offset) partialResult = partialResult.skip(parameters.offset);
      const data = await partialResult.toArray()
      const totalCount = data.length;
      const pages = parameters.limit ? Math.ceil((totalCount) / parameters.limit) : undefined;

      return {
        data: [],
        success: true,
        pages,
      }
    }

    return result;
  }

  public async count (schemaIdentifier : string, query : QueryType) : Promise<CountResponse> {
    const schema = this.schemaRepo.getSchema(schemaIdentifier);
    const builtQuery = new MongoSchemaQueryBuilder(query, this.getQueryPerProperty, schema).getFullMongoQuery();

    const result = await this.schemaRepo.getCollection(schemaIdentifier).countDocuments(builtQuery);

    return {
      success: result !== undefined,
      count: result,
    };
  }
}
