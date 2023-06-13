import * as Mongo from "mongodb";
import { SchemaRepo, SchemaType } from "./schema-repo.js";
import { MongoSchemaQueryBuilder } from "./query-builder/query-builder.js";

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
}

export class MongoDbProtocol {
  private connection : Mongo.MongoClient;
  private db : Mongo.Db;
  private schemaRepo : SchemaRepo;

  constructor (
    private readonly protocolConfiguration : ProtocolConfigParams,
    public readonly logger : Logger,
    private readonly schemaList : SchemaType[]
  ) {
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.insert = this.insert.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.updateById = this.updateById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.findById = this.findById.bind(this);
    this.find = this.find.bind(this);
    this.count = this.count.bind(this);
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

  public async insert (schemaIdentifier : string, parameters : { data : unknown })
    : Promise<{success : boolean; insertedId : string }> {
    const result = await this.schemaRepo.getCollection(schemaIdentifier).insertOne(parameters.data);

    return {
      success: result.insertedId !== undefined,
      insertedId: result.insertedId.toString(),
    };
  }

  public async deleteById (schemaIdentifier : string, parameters : { id : string }) : Promise<BaseDBProtocolResponse> {
    await this.schemaRepo.getCollection(schemaIdentifier).deleteOne({ _id: new Mongo.ObjectId(parameters.id) });

    return {
      success: true,
    };
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
