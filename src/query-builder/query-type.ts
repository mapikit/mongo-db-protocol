export type QueryType = {
  [K : string] : PropertyQuery;
}

export type PropertyQuery = TypeStringQuery | TypeNumberQuery
| TypeDateQuery | TypeBooleanQuery | TypeStringArrayQuery | QueryType
| TypeNumberArrayQuery | TypeBooleanArrayQuery | TypeDateArrayQuery
| TypeObjectArrayQuery;

export type FlatPropertyQuery = TypeStringQuery | TypeNumberQuery
| TypeDateQuery | TypeBooleanQuery;

export enum QueryTypes {
  string,
  number,
  date,
  boolean,
  stringArray,
  numberArray,
  booleanArray,
  dateArray,
  object,
  objectArray,
}

export interface TypeStringQuery {
  equal_to ?: string;
  not_equal_to ?: string;
  one_of ?: string[];
  not_one_of ?: string[];
  exists ?: boolean;
  regexp ?: string;
}

export interface TypeNumberQuery {
  equal_to ?: number;
  not_equal_to ?: number;
  greater_than ?: number;
  greater_or_equal_to ?: number;
  less_than ?: number;
  less_or_equal_to ?: number;
  one_of ?: number[];
  not_one_of ?: number[];
  exists ?: boolean;
}

export interface TypeDateQuery {
  equal_to ?: Date;
  not_equal_to ?: Date;
  greater_than ?: Date;
  greater_or_equal_to ?: Date;
  less_than ?: Date;
  less_or_equal_to ?: Date;
  one_of ?: Date[];
  not_one_of ?: Date[];
  exists ?: boolean;
}

export interface TypeBooleanQuery {
  equal_to ?: boolean;
  not_equal_to ?: boolean;
  exists ?: boolean;
}

// Base class - Don't put it in PropertyQuery
interface TypeArrayQuery<T> {
  identical_to ?: T[];
  contains_all ?: T[];
  contains ?: T;
  not_contains ?: T;
  contains_one_of ?: T[];
  contains_none_of ?: T[];
  size ?: number;
  exists ?: boolean;
  one_fulfills ?: FlatPropertyQuery;
}

export interface TypeStringArrayQuery extends TypeArrayQuery<string>, TypeStringQuery{
  contains_regexp ?: string;
}

export interface TypeNumberArrayQuery extends TypeArrayQuery<number>, TypeNumberQuery {
  contains_greater_than ?: number;
  contains_greater_or_equal_to ?: number;
  contains_less_than ?: number;
  contains_less_or_equal_to ?: number;
}

export interface TypeBooleanArrayQuery extends TypeArrayQuery<boolean>, TypeBooleanQuery {};

export interface TypeDateArrayQuery extends TypeArrayQuery<Date>, TypeDateQuery {
  contains_greater_than ?: Date;
  contains_greater_or_equal_to ?: Date;
  contains_less_than ?: Date;
  contains_less_or_equal_to ?: Date;
}

export interface TypeObjectQuery {
  equal_to ?: object;
  not_equal_to ?: object;
  one_of ?: object[];
  not_one_of ?: object[];
  exists ?: boolean;
}

export type TypeObjectArrayQuery = TypeArrayQuery<object>;
