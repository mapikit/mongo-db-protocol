# Mongo-Db-Protocol
This is a DB Protocol for [Meta-System](https://mapikit.github.io/meta-system-docs/) to be used with MongoDB.

This file contains basic instructions and the base interface of the methods and operations inlcuded.

## How to use it
In your Meta-System configuration file you should add an object to the `protocols` array like the following:

```json
{
  "protocols": [
    {
      "protocolType": "@meta-system/mongo-db-protocol",
      "protocolVersion": "latest", // Should be the version you want to use
      "configuration": {
        "databaseName": "some-db-name", // The name of the DB you want to connect to
        "dbConnectionString": "mongo://some-url-to-your-db" // URL connection - may contain user and password
      }
    }
  ]
}
```

## Interfaces
As any DB Protocol, the interface of the db operations (such as "insert", "find")  can be whatever suits the protocol the best, even though it is recommended to follow the Meta-System query model. This protocol actually respects the full model, and is compatible with any schema and operation following the MSYS query model.

[**see the query model here**](https://mapikit.github.io/meta-system-docs/docs/api-docs/functions/schema-functions/queries)
