import {
  DBProtocol,
  BaseDBProtocolResponse,
  QueryType,
  CountResponse,
  FindByIdResponse,
  FindResponse,
  QueryOperationResponse } from "@meta-system/meta-protocol-helper";

import * as Mongo from "mongodb";
import { SchemaType } from "@meta-system/meta-protocol-helper/dist/src/type/schema-types";
import { SchemaRepo } from "./schema-repo";
import { MongoSchemaQueryBuilder } from "./query-builder/query-builder";

export interface ProtocolConfigParams {
  dbConnectionString : string;
  databaseName : string;
}

export class MongoDbProtocol extends DBProtocol<ProtocolConfigParams> {
  private connection : Mongo.MongoClient;
  private db : Mongo.Db;
  private schemaRepo : SchemaRepo;

  constructor (config : ProtocolConfigParams, schemaList : SchemaType[]) {
    super(config, schemaList);


    this.verifySchemaSupport = this.verifySchemaSupport.bind(this);
    this.validateConfiguration = this.validateConfiguration.bind(this);
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

  public verifySchemaSupport () : void {
    this.schemaList;
  }

  public validateConfiguration () : void {
    const dbName = this.protocolConfiguration.databaseName;
    if (typeof dbName !== "string" || dbName.length < 1) {
      throw Error("The provided database name is not a valid string");
    }

    if (this.protocolConfiguration.dbConnectionString === undefined) {
      throw Error("The db connection string was not provided, aborting!");
    }
  }

  public async initialize () : Promise<void> {
    const connection = new Mongo.MongoClient(this.protocolConfiguration.dbConnectionString);
    this.connection = await connection.connect();

    this.db = this.connection.db(this.protocolConfiguration.databaseName);

    await this.db.command({ ping: 1 });
    console.log(`[Mongo DB Protocol] Success connnecting to "${this.protocolConfiguration.databaseName}"`);

    this.schemaRepo = new SchemaRepo(this.schemaList, this.db, this.checkSchemaDiff);
    await this.schemaRepo.bootDb();
  }

  public async shutdown () : Promise<void> {
    await this.connection.close();

    delete this.schemaRepo;
    delete this.connection;
    delete this.db;
  }

  getProtocolPublicMethods () : Record<string, Function> {
    return {};
  }

  public async insert (schemaId : string, parameters : { data : unknown })
    : Promise<BaseDBProtocolResponse & { insertedId : string }> {
    const result = await this.schemaRepo.getCollection(schemaId).insertOne(parameters.data);

    return {
      success: result.insertedId !== undefined,
      insertedId: result.insertedId.toString(),
    };
  }

  public async deleteById (schemaId : string, parameters : { id : string }) : Promise<BaseDBProtocolResponse> {
    await this.schemaRepo.getCollection(schemaId).deleteOne({ _id: new Mongo.ObjectId(parameters.id) });

    return {
      success: true,
    };
  }

  public async updateById (schemaId : string, parameters : { data : unknown, id : string })
    : Promise<BaseDBProtocolResponse> {
    const result = await this.schemaRepo.getCollection(schemaId)
      .updateOne({ _id: new Mongo.ObjectId(parameters.id) }, parameters.data);

    return {
      success: result.modifiedCount > 0,
    };
  }

  public async update (schemaId : string, parameters : { data : unknown, query : QueryType })
    : Promise<QueryOperationResponse> {
    const schema = this.schemaRepo.getSchema(schemaId);
    const builtQuery = new MongoSchemaQueryBuilder(parameters.query, this.getQueryPerProperty, schema)
      .getFullMongoQuery();

    const result = await this.schemaRepo.getCollection(schemaId).updateMany(builtQuery, parameters.data);

    return {
      success: result !== undefined,
      affectedEntities: result.modifiedCount,
    };
  }

  public async delete (schemaId : string, parameters : { query : QueryType }) : Promise<QueryOperationResponse> {
    const schema = this.schemaRepo.getSchema(schemaId);
    const builtQuery = new MongoSchemaQueryBuilder(parameters.query, this.getQueryPerProperty, schema)
      .getFullMongoQuery();

    const result = await this.schemaRepo.getCollection(schemaId).deleteMany(builtQuery);

    return {
      success: result !== undefined,
      affectedEntities: result.deletedCount,
    };
  }

  public async findById (schemaId : string, parameters : { id : string }) : Promise<FindByIdResponse> {
    const result = await this.schemaRepo.getCollection(schemaId).findOne({ _id: new Mongo.ObjectId(parameters.id) });

    return {
      success: true,
      data: result,
    };
  }

  // eslint-disable-next-line max-lines-per-function
  public async find (schemaId : string, parameters : { query : QueryType, limit ?: number, offset ?: number })
    : Promise<FindResponse> {
    const schema = this.schemaRepo.getSchema(schemaId);
    const builtQuery = new MongoSchemaQueryBuilder(parameters.query, this.getQueryPerProperty, schema)
      .getFullMongoQuery();

    let partialResult = this.schemaRepo.getCollection(schemaId).find(builtQuery);

    if (parameters.limit) partialResult = partialResult.limit(parameters.limit);
    if (parameters.offset) partialResult = partialResult.skip(parameters.offset);

    const result = [];
    await partialResult.forEach((element) => { result.push(element); });

    return {
      success: partialResult !== undefined,
      data: result,
    };
  }

  public async count (schemaId : string, query : QueryType) : Promise<CountResponse> {
    const schema = this.schemaRepo.getSchema(schemaId);
    const builtQuery = new MongoSchemaQueryBuilder(query, this.getQueryPerProperty, schema).getFullMongoQuery();

    const result = await this.schemaRepo.getCollection(schemaId).countDocuments(builtQuery);

    return {
      success: result !== undefined,
      count: result,
    };
  }
}
