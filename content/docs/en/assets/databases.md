---
title: "Databases"
seoTitle: "Casvisor: MySQL, PostgreSQL, SQL Server, Oracle, Redis, MongoDB, ClickHouse and Dameng access with audit"
description: "MySQL, PostgreSQL, SQL Server, Oracle, Redis, MongoDB, ClickHouse and Dameng (DM8) assets open in a console in the browser, and MySQL and PostgreSQL also in DBeaver, Navicat, mysql and psql through the database proxy, with the database password kept on the server. Every statement, batch or command is recorded, checked against command rules, and listed for the session; results can be exported as CSV with the Download action."
---

Database servers can be assets too: MySQL (and MariaDB), PostgreSQL, SQL Server, Oracle, Redis, MongoDB, ClickHouse and Dameng (DM8). Users open them in a console in a browser tab, or MySQL and PostgreSQL in a database client on their own machine through the [database proxy](./local-clients.md#database-clients), with the database account filled in on the server, and everything they run goes through Casvisor: each SQL statement, SQL Server batch, Redis command or MongoDB call is checked against the [command rules](../audit/commands.md), recorded with its result, and listed for the session.

## Adding a database

Add an asset as usual (see [Assets](./assets.md)), with:

| Field | Value |
| --- | --- |
| Protocol | `MySQL` (MariaDB too), `PostgreSQL`, `SQLServer`, `Oracle`, `Redis`, `MongoDB`, `ClickHouse` or `Dameng`. Choosing one fills in its usual port, shown below. |
| Host, Port | The database server, as reached from Casvisor or from the asset's [network gateway](./network-gateways.md). |
| Username, Password | The database account. Leave them empty to let each user type their own when connecting, as for other assets. A Redis server without ACL users needs only the password; a MongoDB server without authentication needs neither. |
| Database | What it means depends on the protocol, below. The field is called **Service name** for Oracle, **Schema** for Dameng and **Database number** for Redis. |
| Fingerprint | The SHA-256 of the server's public key, filled in on the first TLS connection. See [Connections and TLS](#connections-and-tls). There is no fingerprint for Oracle and Dameng. |

| Protocol | Port | Database |
| --- | --- | --- |
| `MySQL` | 3306 | The database to open after connecting. Empty starts with no database chosen. |
| `PostgreSQL` | 5432 | The database to open. Empty opens the database named after the user, as `psql` does. |
| `SQLServer` | 1433 | The database to open. Empty opens the login's default database. |
| `Oracle` | 1521 | The service name of the database, such as `ORCLPDB1` or `FREEPDB1`. It is required. |
| `Redis` | 6379 | The number of the database to open. Empty means 0. |
| `MongoDB` | 27017 | The database to open. Empty means `test`. The user is checked in `admin` first, and when that fails, in this database, for users created there. |
| `ClickHouse` | 9000 | The database to open. Empty means `default`. Casvisor speaks ClickHouse's native protocol: use the native port, 9000, or 9440 for TLS, not the HTTP port 8123. |
| `Dameng` | 5236 | The schema to start in. Empty is the schema named after the user. |

**Test connection** on the asset's page logs in with what is in the form, without saving it, and shows the server's version; for a server with TLS it also fills in **Fingerprint**.

[System accounts](./accounts.md) work for database assets as well, for example a `readonly` and an `admin` account on one server, with permissions saying who uses which. Casvisor changes their passwords in the database, creates MySQL and PostgreSQL users, and reads the users for the account risks, as the asset's [platform](./platforms.md) says; see [Changing passwords](./accounts.md#changing-passwords).

## Connections and TLS

Casvisor connects with Go's MySQL driver, pgx for PostgreSQL, Microsoft's go-mssqldb for SQL Server, go-ora for Oracle, go-redis for Redis, the official MongoDB Go driver, clickhouse-go for ClickHouse and Dameng's official Go driver, all written in Go. Every connection goes through the asset's network gateway when it has one.

| Protocol | TLS |
| --- | --- |
| MySQL, PostgreSQL | Used when the server offers it, plain otherwise. |
| SQL Server | Always used. A connection without encryption is made only to a server that supports none at all, and only while no public key is pinned. |
| Redis | Used when the server has it. Casvisor first sends a plain `PING`, with no credentials; a server that answers it speaks plain text, and any other is reached with TLS. |
| MongoDB | Used when the server has it, plain otherwise. |
| ClickHouse | Tried first. A port without TLS, such as 9000, does not answer the TLS handshake and is then reached in plain text, while no public key is pinned; the TLS port is 9440. |
| Oracle, Dameng | Not used: Casvisor connects over plain TCP. Keep the path between Casvisor, or the network gateway, and the server on a network you trust. |

Database servers mostly have self-signed certificates, so Casvisor does not check the certificate chain. It pins the server's public key instead: once a TLS connection has logged in, the SHA-256 of the key goes into the asset's **Fingerprint**. From then on the connection must use TLS, so it cannot be downgraded to plain text, and a server presenting another key is refused, with both fingerprints in the error. If the change is expected, because the server got a new key for example, clear **Fingerprint** and connect again.

MongoDB is reached at the given host only. Casvisor does not discover the other members of a replica set, whose addresses the network gateway might not reach, so point the asset at the member you want, the primary when users should write.

## The console

Connecting opens the console in a tab of the workbench or on the asset's page. It is the same for every kind of database:

- **The toolbar** shows the server's version and the current database, which a drop-down switches.
- **The left side** lists the databases, what is in them, and the details of one item. **Query this table** (**Query this key** for Redis, **Query this collection** for MongoDB) puts a query for its first rows in the editor and runs it.
- **The editor** runs what is selected, or everything when nothing is, with **Run** or Ctrl+Enter. The text is split into statements as described for each kind below, and they run one after another, each with its own result. A run stops at the first statement that fails or is blocked.
- **The results** show the rows a statement returned, or how many rows it changed, with how long it took. Only the first 1,000 rows of a result are kept, a cell is cut at 64 KB, a binary value is shown in hex, and a result stops growing at 8 MB.

Statements run in the same connection, one at a time, so session settings, transactions and temporary tables last for the session. Closing the tab, or an administrator stopping the session, cuts the connection, which also ends a statement still running. A statement typed in the editor that changes the database, such as `USE`, Redis `SELECT 2`, MongoDB `use app` or Oracle `ALTER SESSION SET CURRENT_SCHEMA`, also changes the current database in the toolbar.

### MySQL and PostgreSQL

The left side lists the databases, the tables and views of each (with their schemas for PostgreSQL), and the columns of a table, with the primary key marked. **Query this table** runs `SELECT * FROM <table> LIMIT 100;`.

Statements are separated by `;`. The splitting knows about strings, quoted names and comments, including PostgreSQL's dollar quoting and nested comments, so a `;` inside them does not split.

PostgreSQL shows the tables of the current database only, since a connection belongs to one database: opening another database switches to it, which opens a new connection.

### SQL Server

The left side lists the databases the login can open, the tables and views of each, with the schema in front when it is not `dbo`, and their columns, with the primary key marked. **Query this table** runs `SELECT TOP 100 * FROM [schema].[table];`, with the database in front when it is not the current one.

The editor works as SQL Server Management Studio does: the text between `GO` lines is a batch, and each batch goes to the server as a whole, so variables, `IF` blocks and `BEGIN TRAN ... COMMIT` work inside it, and a `CREATE PROCEDURE` goes in a batch of its own, as SQL Server requires. A script with no `GO` line is one batch. A `GO` inside a string or a comment does not split. A batch shows every result it returns, up to 20: each result set, the row count of each change, and the messages printed by `PRINT` in a last result of its own. `[bracketed]` names and nested comments are understood.

### Oracle

The left side is headed **Schemas**: it lists the schemas that own tables or views the user can see, the tables and views of each, and their columns, with the primary key marked. Switching to a schema sets `CURRENT_SCHEMA`, so unqualified names refer to its objects. **Query this table** runs `SELECT * FROM "SCHEMA"."TABLE" WHERE ROWNUM <= 100`.

Statements are separated by `;`, which Casvisor leaves out when sending, as Oracle wants. A PL/SQL block, one starting with `BEGIN` or `DECLARE`, or `CREATE` (or `CREATE OR REPLACE`) of a procedure, function, package, trigger, type or library, runs up to a line holding only `/`, as in SQL\*Plus, with the semicolons inside it kept. A `/` line also ends an ordinary statement. Strings, quoted names, `q'[...]'` quoting and comments are understood. `SELECT` and `WITH` return rows; other statements report how many rows they changed.

### ClickHouse

The left side lists the databases, the tables and views of each with their engines, and the columns of a table, with the columns of the primary key marked. **Query this table** runs ``SELECT * FROM `table` LIMIT 100;``, with the database in front when it is not the current one.

Statements are separated by `;`, which Casvisor leaves out when sending, as the native protocol takes one statement at a time. Strings and quoted names with backslash escapes, `#` and `--` comments and nested block comments are understood. `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, `WITH`, `EXISTS` and `CHECK` return rows; arrays, maps and tuples are shown as JSON. ClickHouse does not report how many rows an `INSERT` wrote, so it shows 0. `USE db` switches the current database.

### Dameng

Dameng (DM8) works like Oracle. The left side is headed **Schemas**: it lists the schemas that own tables or views the user can see, the tables and views of each, and their columns, with the primary key marked. Switching to a schema runs `SET SCHEMA`, so unqualified names refer to its objects. **Query this table** runs `SELECT * FROM "SCHEMA"."TABLE" LIMIT 100`.

Statements are separated by `;`, which Casvisor leaves out when sending, and a PL/SQL block runs up to a line holding only `/`, as for Oracle. `SELECT` and `WITH` return rows, `CLOB` and `BLOB` values included; other statements report how many rows they changed.

### Redis

The left side lists the numbered databases and the keys of the current one: the first 1,000 found, with their types. Opening another database switches to it. Opening a key shows its type, its TTL in seconds (-1 for none) and its size: the length of a string, the number of elements of a list, set, sorted set or stream, or of fields of a hash. **Query this key** runs the command that shows its value: `GET`, `HGETALL`, `LRANGE key 0 99`, `SSCAN key 0 COUNT 100`, `ZRANGE key 0 99 WITHSCORES` or `XRANGE key - + COUNT 100`.

The editor takes one command per line, quoted as in `redis-cli`: words separated by spaces, double quotes with escapes such as `\n` and `\x41`, and single quotes. Empty lines and lines starting with `#` are skipped. A list reply is shown one element per row; `HGETALL`, `CONFIG GET`, `ZPOPMIN`, `ZPOPMAX`, `HRANDFIELD ... WITHVALUES` and `ZRANGE` and the like with `WITHSCORES` show two columns, and `INFO` shows a name and a value per line.

The console keeps one connection, so `MULTI ... EXEC` and `WATCH` work across lines. `SELECT n` switches the database, which opens a new connection, so a transaction or watch started before it does not carry over. A blocking command such as `BLPOP` waits as long as it was told to, or until the tab is closed. The commands that would change who the connection is or turn it into a stream of messages are refused: `AUTH`, `HELLO`, `QUIT`, `RESET`, the `SUBSCRIBE` family, `MONITOR`, `SYNC`, `PSYNC` and `REPLCONF`.

### MongoDB

The left side lists the databases the user may see, the collections of each, and the fields of a collection's first document, with their types. **Query this collection** runs `db.<collection>.find({}).limit(100)`.

The editor reads the statements of the MongoDB shell, `mongosh`. They are parsed by Casvisor and run with the Go driver; no JavaScript runs, so there are no variables, functions or loops. A statement ends at a `;` or at the end of a line outside brackets, and a line starting with `.` continues the one before, so a long `find` can be split over lines. These are understood:

| Kind | Statements |
| --- | --- |
| Shell commands | `show dbs` (or `show databases`), `show collections` (or `show tables`), `use <db>`, and `db` alone for the current database |
| Choosing | `db.<collection>`, `db["name"]`, `db.getCollection("name")`, `db.getSiblingDB("name")` |
| Database | `runCommand({...})`, `adminCommand({...})`, `getCollectionNames()`, `getCollectionInfos(filter)`, `createCollection(name)`, `dropDatabase()`, `stats()`, `serverStatus()`, `version()`, `getName()` |
| Reading | `find(filter, projection)` followed by `.sort()`, `.limit()`, `.skip()`, `.projection()`, `.hint()`, or `.count()` to count instead; `findOne(filter, projection)`, `countDocuments(filter)`, `estimatedDocumentCount()`, `distinct(field, filter)`, `aggregate([...])` |
| Writing | `insertOne(doc)`, `insertMany([...])`, `updateOne`, `updateMany` and `replaceOne` with a filter, an update and optionally `{upsert: true}`, `deleteOne(filter)`, `deleteMany(filter)` (with `{}` for every document) |
| Collection | `createIndex(keys, options)` with the options `name`, `unique`, `sparse` and `expireAfterSeconds`, `dropIndex(name or keys)`, `getIndexes()`, `stats()`, `drop()` |
| Values | Documents and arrays with quoted or unquoted keys, strings in `'`, `"` or `` ` ``, numbers, `true`, `false`, `null`, regular expressions such as `/^a/i`, and `ObjectId()`, `ISODate()` (or `new Date()`), `NumberLong()`, `NumberInt()`, `NumberDecimal()`, `UUID()`, `BinData()`, `Timestamp()`, `RegExp()`, `MinKey` and `MaxKey` |

Documents are shown as rows, with a column for each top-level field; embedded documents and arrays are shown as JSON, object IDs as `ObjectId("...")` and dates in UTC. A `find` without a limit shows the first 1,000 documents, and the total is counted on the server. A write shows how many documents it inserted, changed or deleted.

### Copying and exporting

With **Copy** in the user's permission, a result has a button that copies it as tab-separated text, which pastes into a spreadsheet. With **Download**, **Export CSV** saves it as a CSV file that Excel opens as UTF-8. Exporting is checked on the server, and works for the last 20 results with rows in the open session. Each export goes into the [operation log](../audit/operation-logs.md) as `sql-export`, with the statement.

The other actions, Paste, Upload and Forward, do nothing in the console; Connect is what lets a user open it.

## What is recorded

Every statement is a [command record](../audit/commands.md) of the session, with the time, the user, the asset, the client IP, the protocol, and its result: the number of rows, or the error. A SQL Server batch is one record, with the rows of all its results added up and its errors together. Switching databases from the toolbar or the left side is recorded as the statement it amounts to:

| Protocol | Recorded as |
| --- | --- |
| MySQL | ``USE `db` `` |
| PostgreSQL | `\connect db` |
| SQL Server | `USE [db]` |
| Oracle | `ALTER SESSION SET CURRENT_SCHEMA = "SCHEMA"` |
| ClickHouse | ``USE `db` `` |
| Dameng | `SET SCHEMA "SCHEMA"` |
| Redis | `SELECT 2` |
| MongoDB | `use db` |

The session's **Commands** column counts them.

Command rules apply to each statement before it is sent:

- **Block**: the statement is not sent to the database. The console shows *Blocked by the command rule* with the rule's name, and the record has the action `Block`.
- **Alert**: the statement runs, and the record carries the rule and the action `Alert`.

A rule is matched against the statement as typed, and again in forms that take out what could hide a command from it:

- **SQL**: the statement with its comments taken out, so `/* note */ DROP TABLE t` is still caught by `^\s*DROP`. MySQL's `/*! ... */` comments, whose content the server does run, are kept in.
- **A SQL Server batch**: also each line of the batch and each part between `;`, without comments, so `^\s*DROP` catches a `DROP` on any line of a batch.
- **Redis**: the arguments after their quotes are read, joined by single spaces, so `"flushall"` is caught by `^flushall` and `FLUSHALL    ASYNC` by `^FLUSHALL ASYNC`.
- **MongoDB**: the statement without comments and spaces, so `db.users /* x */ .drop()` is caught by `\.drop\(`, and `deleteMany( {} )` by `deleteMany\(\{\}\)`.

Patterns are case-sensitive, so start them with `(?i)`: for example, with the action Block, `(?i)^\s*(drop|truncate|delete)\b` for SQL, `(?i)^(flushall|flushdb)\b` for Redis, and `\.(drop|dropDatabase)\(` for MongoDB. A rule applies to every protocol of the assets it covers, so give rules meant for one kind of database the matching **Assets** or **Asset tags**.

Database sessions have no screen to [record](../audit/recordings.md). In the [session list](../audit/sessions.md), **Monitor** on an online database session opens the list of its statements, which refreshes every 3 seconds, and **Replay** on a finished one shows the same list, the first 1,000 statements, with each one's time, result and rule. The list is headed *SQL statements*, or *Commands* for Redis and MongoDB.

## Database clients on your own machine

MySQL and PostgreSQL assets can also be opened in DBeaver, Navicat, DataGrip, `mysql`, `psql` or any JDBC tool, through Casvisor's [database proxy](./local-clients.md#database-clients). The client signs in to Casvisor with a database token, and Casvisor signs in to the database with the asset's account. Every statement the client sends goes through the same command rules, records and session list as the console, so the proxy is audited the same way, and needs only the **Connect** action.

The other kinds of database, SQL Server, Oracle, Redis, MongoDB, ClickHouse and Dameng, are not proxied yet. A client on the user's own machine, such as `sqlcmd`, SQL\*Plus, `redis-cli` or `mongosh`, can reach them through the [SSH gateway's port forwarding](./ssh-gateway.md#port-forwarding-to-other-assets), for example `ssh -p 2222 -N -L 16379:redis-01:6379 alice@casvisor.example.com`. Casvisor passes those bytes through without reading them: the user logs in with an account they know, and the commands are neither recorded nor checked against rules. That needs the **Forward** action, so give it only to the people who should have it.
