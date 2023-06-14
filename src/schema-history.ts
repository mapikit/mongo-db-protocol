import { SchemaType } from "./schema-repo.js";

export interface SchemaHistoryEntry {
  creationDate : string; // ISO Date
  schemaList : SchemaType[]
}

export class SchemaHistory {
  private creationDate = new Date().toISOString();
  private timeSet = false;

  public constructor (
    public readonly schemaList : SchemaType[],
  ) {}

  public getHistoryEntry () : SchemaHistoryEntry {
    return {
      creationDate: this.creationDate,
      schemaList: this.schemaList,
    };
  }

  public setTime (isoDate : string) : void {
    if (this.timeSet === true) {
      throw Error("Cannot modify time already set on schema history");
    }

    this.creationDate = isoDate;
    this.timeSet = true;
  }

  public static fromDB (data : SchemaHistoryEntry) : SchemaHistory {
    const result = new SchemaHistory(data.schemaList);

    result.setTime(data.creationDate);
    return result;
  }
}
