import { SchemaType } from "./schema-repo.js";

export interface SchemaHistoryEntry {
  creationDate : Date; // ISO Date
  schemaList : SchemaType[]
}

export class SchemaHistory {
  private creationDate = new Date();
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

  public setTime (date : Date) : void {
    if (this.timeSet === true) {
      throw Error("Cannot modify time already set on schema history");
    }

    this.creationDate = date;
    this.timeSet = true;
  }

  public static fromDB (data : SchemaHistoryEntry) : SchemaHistory {
    const result = new SchemaHistory(data.schemaList);

    result.setTime(data.creationDate);
    return result;
  }
}
