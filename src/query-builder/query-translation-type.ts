/* eslint-disable max-len */
import { QueryTypesEnum } from "@meta-system/meta-protocol-helper";
import { FilterOperators } from "mongodb";
import { TypeStringQuery,
  TypeNumberQuery,
  TypeBooleanQuery,
  TypeDateQuery,
  TypeStringArrayQuery,
  TypeNumberArrayQuery,
  TypeBooleanArrayQuery,
  TypeDateArrayQuery,
  TypeObjectArrayQuery,
  QueryType } from "./query-type";

export const valueToReplaceString = "__value__";
export const valueToReplaceStringArray = [valueToReplaceString];
export const valueToReplaceBoolean = Boolean();
export const valueToReplaceNumber = Number.NaN;
export const valueToReplaceNumberArray = [valueToReplaceNumber];
export const valueToReplaceDate = new Date(- Math.PI * 1000000000000);
export const valueToReplaceDateArray = [valueToReplaceDate];
export const valueToReplaceBooleanArray = [valueToReplaceBoolean];
export const valueToReplaceObject = { 0: null };
export const valueToReplaceObjectArray = [valueToReplaceObject];

export const stringQueryTranslationMap : Map<keyof TypeStringQuery, FilterOperators<string>> = new Map();
stringQueryTranslationMap.set("equal_to", Object.freeze({ "$eq": valueToReplaceString }));
stringQueryTranslationMap.set("not_equal_to", Object.freeze({ "$ne": valueToReplaceString }));
stringQueryTranslationMap.set("one_of", Object.freeze({ "$in": valueToReplaceStringArray }));
stringQueryTranslationMap.set("not_one_of", Object.freeze({ "$nin": valueToReplaceStringArray }));
stringQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));
stringQueryTranslationMap.set("regexp", Object.freeze({ "$regex": valueToReplaceString }));

export const numberQueryTranslationMap : Map<keyof TypeNumberQuery, FilterOperators<number>> = new Map();
numberQueryTranslationMap.set("equal_to", Object.freeze({ "$eq": valueToReplaceNumber }));
numberQueryTranslationMap.set("not_equal_to", Object.freeze({ "$ne": valueToReplaceNumber }));
numberQueryTranslationMap.set("greater_than", Object.freeze({ "$gt": valueToReplaceNumber }));
numberQueryTranslationMap.set("greater_or_equal_to", Object.freeze({ "$gte": valueToReplaceNumber }));
numberQueryTranslationMap.set("less_than", Object.freeze({ "$lt": valueToReplaceNumber }));
numberQueryTranslationMap.set("less_or_equal_to", Object.freeze({ "$lte": valueToReplaceNumber }));
numberQueryTranslationMap.set("one_of", Object.freeze({ "$in": valueToReplaceNumberArray }));
numberQueryTranslationMap.set("not_one_of", Object.freeze({ "$nin": valueToReplaceNumberArray }));
numberQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));

export const booleanQueryTranslationMap : Map<keyof TypeBooleanQuery, FilterOperators<boolean>> = new Map();
booleanQueryTranslationMap.set("equal_to", Object.freeze({ "$eq": valueToReplaceBoolean }));
booleanQueryTranslationMap.set("not_equal_to", Object.freeze({ "$ne": valueToReplaceBoolean }));
booleanQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));

export const dateQueryTranslationMap : Map<keyof TypeDateQuery, FilterOperators<Date>> = new Map();
dateQueryTranslationMap.set("equal_to", Object.freeze({ "$eq": valueToReplaceDate }));
dateQueryTranslationMap.set("not_equal_to", Object.freeze({ "$ne": valueToReplaceDate }));
dateQueryTranslationMap.set("greater_than", Object.freeze({ "$gt": valueToReplaceDate }));
dateQueryTranslationMap.set("greater_or_equal_to", Object.freeze({ "$gte": valueToReplaceDate }));
dateQueryTranslationMap.set("less_than", Object.freeze({ "$lt": valueToReplaceDate }));
dateQueryTranslationMap.set("less_or_equal_to", Object.freeze({ "$lte": valueToReplaceDate }));
dateQueryTranslationMap.set("one_of", Object.freeze({ "$in": valueToReplaceDateArray }));
dateQueryTranslationMap.set("not_one_of", Object.freeze({ "$nin": valueToReplaceDateArray }));
dateQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));

export const stringArrayQueryTranslationMap :
Map<keyof TypeStringArrayQuery, FilterOperators<Array<string>>> = new Map();
stringArrayQueryTranslationMap.set("contains", Object.freeze({ "$all": [valueToReplaceString] }));
stringArrayQueryTranslationMap.set("contains_all", Object.freeze({ "$all": valueToReplaceStringArray }));
stringArrayQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));
stringArrayQueryTranslationMap.set("identical_to", Object.freeze({ "$eq": valueToReplaceStringArray }));
stringArrayQueryTranslationMap.set("contains_one_of", Object.freeze({ "$elemMatch": { "$in": valueToReplaceStringArray } }));
stringArrayQueryTranslationMap.set("contains_none_of", Object.freeze({ "$nin": valueToReplaceStringArray as unknown as string[][] }));
stringArrayQueryTranslationMap.set("not_contains", Object.freeze({ "$nin": [valueToReplaceString] as unknown as string[][] }));
stringArrayQueryTranslationMap.set("size", Object.freeze({ "$size": valueToReplaceNumber }));
stringArrayQueryTranslationMap.set("contains_regexp", Object.freeze({ "$elemMatch": { "$regex": valueToReplaceString } }));

export const numberArrayQueryTranslationMap :
Map<keyof TypeNumberArrayQuery, FilterOperators<Array<number>>> = new Map();
numberArrayQueryTranslationMap.set("contains", Object.freeze({ "$all": [valueToReplaceNumber] }));
numberArrayQueryTranslationMap.set("contains_all", Object.freeze({ "$all": valueToReplaceNumberArray }));
numberArrayQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));
numberArrayQueryTranslationMap.set("identical_to", Object.freeze({ "$eq": valueToReplaceNumberArray }));
numberArrayQueryTranslationMap.set("contains_one_of", Object.freeze({ "$elemMatch": { "$in": valueToReplaceNumberArray } }));
numberArrayQueryTranslationMap.set("contains_none_of", Object.freeze({ "$nin": valueToReplaceNumberArray as unknown as number[][] }));
numberArrayQueryTranslationMap.set("not_contains", Object.freeze({ "$nin": [valueToReplaceNumber] as unknown as number[][] }));
numberArrayQueryTranslationMap.set("size", Object.freeze({ "$size": valueToReplaceNumber }));
numberArrayQueryTranslationMap.set("contains_greater_than", Object.freeze({ "$elemMatch": { "$gt": valueToReplaceNumber } }));
numberArrayQueryTranslationMap.set("contains_greater_or_equal_to", Object.freeze({ "$elemMatch": { "$gte": valueToReplaceNumber } }));
numberArrayQueryTranslationMap.set("contains_less_than", Object.freeze({ "$elemMatch": { "$lt": valueToReplaceNumber } }));
numberArrayQueryTranslationMap.set("contains_less_or_equal_to", Object.freeze({ "$elemMatch": { "$lte": valueToReplaceNumber } }));

export const booleanArrayQueryTranslationMap :
Map<keyof TypeBooleanArrayQuery, FilterOperators<Array<boolean>>> = new Map();
booleanArrayQueryTranslationMap.set("contains", Object.freeze({ "$all": [valueToReplaceBoolean] }));
booleanArrayQueryTranslationMap.set("contains_all", Object.freeze({ "$all": valueToReplaceBooleanArray }));
booleanArrayQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));
booleanArrayQueryTranslationMap.set("identical_to", Object.freeze({ "$eq": valueToReplaceBooleanArray }));
booleanArrayQueryTranslationMap.set("contains_one_of", Object.freeze({ "$elemMatch": { "$in": valueToReplaceBooleanArray } }));
booleanArrayQueryTranslationMap.set("contains_none_of", Object.freeze({ "$nin": valueToReplaceBooleanArray as unknown as boolean[][] }));
booleanArrayQueryTranslationMap.set("not_contains", Object.freeze({ "$nin": [valueToReplaceBoolean] as unknown as boolean[][] }));
booleanArrayQueryTranslationMap.set("size", Object.freeze({ "$size": valueToReplaceNumber }));

export const dateArrayQueryTranslationMap :
Map<keyof TypeDateArrayQuery, FilterOperators<Array<Date>>> = new Map();
dateArrayQueryTranslationMap.set("contains", Object.freeze({ "$all": [valueToReplaceDate] }));
dateArrayQueryTranslationMap.set("contains_all", Object.freeze({ "$all": valueToReplaceDateArray }));
dateArrayQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));
dateArrayQueryTranslationMap.set("identical_to", Object.freeze({ "$eq": valueToReplaceDateArray }));
dateArrayQueryTranslationMap.set("contains_one_of", Object.freeze({ "$elemMatch": { "$in": valueToReplaceDateArray } }));
dateArrayQueryTranslationMap.set("contains_none_of", Object.freeze({ "$nin": valueToReplaceDateArray as unknown as Date[][] }));
dateArrayQueryTranslationMap.set("not_contains", Object.freeze({ "$nin": [valueToReplaceDate] as unknown as Date[][] }));
dateArrayQueryTranslationMap.set("size", Object.freeze({ "$size": valueToReplaceNumber }));
dateArrayQueryTranslationMap.set("contains_greater_than", Object.freeze({ "$elemMatch": { "$gt": valueToReplaceDate } }));
dateArrayQueryTranslationMap.set("contains_greater_or_equal_to", Object.freeze({ "$elemMatch": { "$gte": valueToReplaceDate } }));
dateArrayQueryTranslationMap.set("contains_less_than", Object.freeze({ "$elemMatch": { "$lt": valueToReplaceDate } }));
dateArrayQueryTranslationMap.set("contains_less_or_equal_to", Object.freeze({ "$elemMatch": { "$lte": valueToReplaceDate } }));

export const objectArrayQueryTranslationMap :
Map<keyof TypeObjectArrayQuery, FilterOperators<Array<object>>> = new Map();
objectArrayQueryTranslationMap.set("contains", Object.freeze({ "$all": [{ "$elemMatch": valueToReplaceObject }] }));
objectArrayQueryTranslationMap.set("contains_all", Object.freeze({ "$all": valueToReplaceObjectArray }));
objectArrayQueryTranslationMap.set("exists", Object.freeze({ "$exists": valueToReplaceBoolean }));
objectArrayQueryTranslationMap.set("identical_to", Object.freeze({ "$eq": valueToReplaceObjectArray }));
objectArrayQueryTranslationMap.set("contains_one_of", Object.freeze({ "$elemMatch": { "$in": valueToReplaceObjectArray } }));
objectArrayQueryTranslationMap.set("contains_none_of", Object.freeze({ "$nin": valueToReplaceObjectArray as unknown as object[][] }));
objectArrayQueryTranslationMap.set("not_contains", Object.freeze({ "$nin": [valueToReplaceObject] as unknown as object[][] }));
objectArrayQueryTranslationMap.set("size", Object.freeze({ "$size": valueToReplaceNumber }));

export const queryTranslationMap : Map<QueryTypesEnum, Map<keyof QueryType, FilterOperators<unknown>>> = new Map();
queryTranslationMap.set(QueryTypesEnum.string, stringQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.number, numberQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.date, dateQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.boolean, booleanQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.stringArray, stringArrayQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.numberArray, numberArrayQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.booleanArray, booleanArrayQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.dateArray, dateArrayQueryTranslationMap);
queryTranslationMap.set(QueryTypesEnum.objectArray, objectArrayQueryTranslationMap);
