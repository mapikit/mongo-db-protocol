import * as Mongo from "mongodb";
import { SchemaRepo, SchemaType } from "./schema-repo.js";
import { MongoSchemaQueryBuilder } from "./query-builder/query-builder.js";
import { SchemaDeleteByKeyFunction, SchemaInsertFunction } from "./main-types.js";

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
}

export class MongoDbProtocol {
  private connection : Mongo.MongoClient;
  private db : Mongo.Db;
  private schemaRepo : SchemaRepo;
  private schemaKeyMap = new Map();

  constructor (
    private readonly protocolConfiguration : ProtocolConfigParams,
    public readonly logger : Logger,
    private readonly schemaList : SchemaType[]
  ) {
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.getSchemaInsertFunction = this.getSchemaInsertFunction.bind(this);
    this.getSchemaDeleteByKeyFunction = this.getSchemaDeleteByKeyFunction.bind(this);
    this.updateById = this.updateById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.findById = this.findById.bind(this);
    this.find = this.find.bind(this);
    this.count = this.count.bind(this);

    this.schemaList.forEach((schema) => {
      const defaultKey = "_id";
      const schemaKey = this.protocolConfiguration.usedSchemas
        ?.find((usedSchema) => usedSchema.identifier === schema.identifier).keyField ?? defaultKey
      this.schemaKeyMap.set(schema.identifier, schemaKey)
    })
  }

  public async initialize () : Promise<void> {
    const connection = new Mongo.MongoClient(this.protocolConfiguration.dbConnectionString);
    this.connection = await connection.connect();

    this.db = this.connection.db(this.protocolConfiguration.databaseName);

    await this.db.command({ ping: 1 });
    this.logger.info(`[Mongo DB Protocol] Success connecting to "${this.protocolConfiguration.databaseName}"`);

    this.schemaRepo = new SchemaRepo(this.schemaList, this.db, this.schemaKeyMap);
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

  public getSchemaDeleteByKeyFunction (schemaIdentifier : string) : SchemaDeleteByKeyFunction {
    const schemaCollection = this.schemaRepo.getCollection(schemaIdentifier);
    return async (parameters) => {
      await schemaCollection.deleteOne({ _id: new Mongo.ObjectId(parameters.key) });

      return {
        deleted: true,
      };
    }
  }

  public async updateById (schemaIdentifier : string, parameters : { data : unknown, id : string })
    : Promise<BaseDBProtocolResponse> {
    const result = await this.schemaRepo.getCollection(schemaIdentifier)
      .updateOne({ _id: new Mongo.ObjectId(parameters.id) }, { $set: parameters.data });

    return {
      success: result.matchedCount > 0,
    };
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

  public async findById (schemaIdentifier : string, parameters : { id : string }) : Promise<FindByIdResponse> {
    const result = await this.schemaRepo.getCollection(schemaIdentifier).findOne({ _id: new Mongo.ObjectId(parameters.id) });

    return {
      success: true,
      data: result,
    };
  }

  // eslint-disable-next-line max-lines-per-function
  public async find (schemaIdentifier : string, parameters : { query : QueryType, limit ?: number, offset ?: number })
    : Promise<FindResponse> {
    const schema = this.schemaRepo.getSchema(schemaIdentifier);
    const builtQuery = new MongoSchemaQueryBuilder(parameters.query, this.getQueryPerProperty, schema)
      .getFullMongoQuery();

    let partialResult = this.schemaRepo.getCollection(schemaIdentifier).find(builtQuery);

    if (parameters.limit) partialResult = partialResult.limit(parameters.limit);
    if (parameters.offset) partialResult = partialResult.skip(parameters.offset);

    const totalCount = await partialResult.count();
    const pages = parameters.limit ? Math.ceil((totalCount) / parameters.limit) : undefined;
    const result = [];
    await partialResult.forEach((element) => { result.push(element); });

    return {
      success: partialResult !== undefined,
      data: result,
      pages,
    };
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
