import { Filter, FilterOperators } from "mongodb";
import { getObjectProperty } from "./get-object-property";
import { queryTranslationMap } from "./query-translation-type";
import { queryValueReplace } from "./query-value-replace";
import { ObjectDefinition } from "@meta-system/object-definition";
import { SchemaType } from "@meta-system/meta-protocol-helper/dist/src/type/schema-types";
import { ComplexQuery, DBProtocol, QueryType, QueryTypesEnum } from "@meta-system/meta-protocol-helper";

export class MongoSchemaQueryBuilder {
  private readonly schemaFormat : ObjectDefinition;
  private readonly availableQueryPaths : Map<string, QueryTypesEnum> = new Map();

  public constructor (
    private readonly queryInput : QueryType,
    private readonly queryMapperTool : DBProtocol<unknown>["getQueryPerProperty"],
    schema : SchemaType,
  ) {
    this.schemaFormat = schema.format;

    this.getKeyTypeMap();
  }

  // eslint-disable-next-line max-lines-per-function
  public getFullMongoQuery () : Filter<unknown> {
    const complexKeyMap = { "$and": "$and", "$or": "$or", "$either": "$or" };

    const result : Record<string, FilterOperators<unknown>[]> = {
      "$and": [],
      "$or": [],
    };

    const queryPaths = this.queryMapperTool(this.queryInput);

    // eslint-disable-next-line max-lines-per-function
    Object.keys(queryPaths).forEach((path) => {
      let usingPath = path;
      let isArrayFulfilling = false;
      if (path.endsWith(".one_fulfills")) {
        isArrayFulfilling = true;
        usingPath = path.slice(0, -".one_fulfills".length);
      }

      const type = this.availableQueryPaths.get(usingPath);
      const prop = getObjectProperty(this.queryInput, path);
      const complexKey = this.getComplexKeyFromProp(prop as Record<string, unknown>);

      if (complexKey !== undefined) {
        const complexKeyMapped = complexKeyMap[complexKey];
        const remappedQuery = this.translateComplexQuery(path, complexKey, prop);

        result[complexKeyMapped].push(...remappedQuery);
        return;
      }

      const queried = {};
      if (isArrayFulfilling) {
        const outerProp = getObjectProperty(this.queryInput, usingPath);
        const innerProp = getObjectProperty(this.queryInput, path);
        outerProp["one_fulfills"] = this.buildQuery(innerProp, type);

        queried[usingPath] = this.buildQuery(outerProp, type);
      } else {
        queried[usingPath] = this.buildQuery(prop, type);
      }

      result["$and"].push(queried);
    });

    if (result["$and"].length === 0) delete result["$and"];
    if (result["$or"].length === 0) delete result["$or"];

    return result;
  }

  /** Translates the inner queries of an $and or $or statements */
  private translateComplexQuery (path : string, complexKey : string, prop : unknown) : QueryType[] {
    const remappedQuery = prop[complexKey].map((queryDetails) => {
      const type = this.availableQueryPaths.get(path);
      const queried = {};
      queried[path] = this.buildQuery(queryDetails, type);

      return queried;
    });

    return remappedQuery;
  }

  private getComplexKeyFromProp (prop : Record<string, unknown>) : string {
    const complexQueryStatements = ["$and", "$or", "$either"];
    let complexKey;
    Object.keys(prop).forEach((key) => {
      if (complexQueryStatements.includes(key)) {
        complexKey = key;
      }
    });

    return complexKey;
  }

  // eslint-disable-next-line max-lines-per-function
  private getKeyTypeMap () : void {
    const mapSchemaProperties = (schemaFormat : ObjectDefinition, propertyPath ?: string) : void => {
      Object.keys(schemaFormat).forEach((key) => {
        if (schemaFormat[key].type === "object") {
          mapSchemaProperties(schemaFormat[key]["subtype"], key);
          return;
        }

        const mapKey = [propertyPath, key]
          .filter((value) => value !== undefined)
          .join(".");

        this.availableQueryPaths.set(mapKey, this.convertSchemaTypeToQueryTypes(
          schemaFormat[key].type,
          schemaFormat[key]["subtype"],
        ));
      });
    };

    mapSchemaProperties(this.schemaFormat);
  }

  // eslint-disable-next-line max-lines-per-function
  private convertSchemaTypeToQueryTypes (type : ObjectDefinition[""]["type"], subtype ?: string | object)
    : QueryTypesEnum {
    const typeConversionMap = {
      "number": QueryTypesEnum.number,
      "string": QueryTypesEnum.string,
      "boolean": QueryTypesEnum.booleanArray,
      "date": QueryTypesEnum.date,
      "object": QueryTypesEnum.object,
      "cloudedObject": QueryTypesEnum.object,
      "array.number": QueryTypesEnum.numberArray,
      "array.string": QueryTypesEnum.stringArray,
      "array.boolean": QueryTypesEnum.booleanArray,
      "array.date": QueryTypesEnum.dateArray,
      "array.object": QueryTypesEnum.objectArray,
    };

    const dataValue = (typeof subtype === "object" ? "object" : subtype) ?? "";

    const typeValue = type === "array" ?
      `array.${dataValue}` : type;

    return typeConversionMap[typeValue];
  }

  // eslint-disable-next-line max-lines-per-function
  private buildQuery<T> (queryInput : ComplexQuery, type : QueryTypesEnum) : FilterOperators<T> {
    const currentTypeQueryTranslationMap = queryTranslationMap.get(type);
    const result : FilterOperators<T> = {};

    Object.keys(queryInput).forEach((key) => {
      if (currentTypeQueryTranslationMap === undefined) return; // Key does not exist in schema

      const translatedQuery = currentTypeQueryTranslationMap.get(key);
      if (translatedQuery === undefined) {
        throw Error("[Schemas] Failed to build a query due to having an unknown query key" + ` "${key}" - @${type}`);
      }

      const query = queryValueReplace(translatedQuery, queryInput[key]);

      if (query["$elemMatch"] !== undefined) {
        if (result["$elemMatch"] === undefined) result["$elemMatch"] = {};
        Object.assign(result["$elemMatch"], query["$elemMatch"]);
        return;
      }

      Object.assign(result, query);
    });

    return result;
  }
}
