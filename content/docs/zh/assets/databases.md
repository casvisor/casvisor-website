---
title: "数据库"
seoTitle: "Casvisor：MySQL、PostgreSQL、SQL Server、Oracle、Redis、MongoDB、ClickHouse和达梦访问与审计"
description: "MySQL、PostgreSQL、SQL Server、Oracle、Redis、MongoDB、ClickHouse和达梦（DM8）资产在浏览器里的控制台中打开，MySQL和PostgreSQL还可以经数据库代理用DBeaver、Navicat、mysql、psql打开，数据库密码留在服务端。每条语句、批或命令都被记录、按命令规则检查，并按会话列出；有下载权限时可以把结果导出成CSV。"
---

数据库服务器也可以作为资产：MySQL（以及MariaDB）、PostgreSQL、SQL Server、Oracle、Redis、MongoDB、ClickHouse和达梦（DM8）。用户在浏览器标签页的控制台里打开它们，MySQL和PostgreSQL也可以经[数据库代理](./local-clients.md#数据库客户端)用自己电脑上的数据库客户端打开，数据库账号由服务端填入；用户执行的一切都经过Casvisor：每条SQL语句、每个SQL Server批、每条Redis命令或MongoDB调用都先按[命令规则](../audit/commands.md)检查，再连同结果一起记录，并按会话列出。

## 添加数据库

照常添加资产（见[资产](./assets.md)），其中：

| 字段 | 取值 |
| --- | --- |
| 协议 | `MySQL`（也适用于MariaDB）、`PostgreSQL`、`SQLServer`、`Oracle`、`Redis`、`MongoDB`、`ClickHouse`或`Dameng`（达梦）。选好后会自动填上常用端口，见下表。 |
| 主机、端口 | 数据库服务器，从Casvisor或资产的[网域网关](./network-gateways.md)能连到的地址。 |
| 用户名、密码 | 数据库账号。和其他资产一样，可以不填，让每个用户连接时自己输入。没有ACL用户的Redis只需要密码；没开认证的MongoDB两个都不用填。 |
| 数据库名 | 含义随协议不同，见下表。Oracle资产上这一项叫**服务名**，达梦资产上叫**模式**，Redis资产上叫**数据库编号**。 |
| 指纹 | 服务器公钥的SHA-256，第一次用TLS连接时自动填上，见[连接和TLS](#连接和tls)。Oracle和达梦没有指纹。 |

| 协议 | 端口 | 数据库名 |
| --- | --- | --- |
| `MySQL` | 3306 | 连接后默认打开的数据库。不填时不选中任何数据库。 |
| `PostgreSQL` | 5432 | 连接后默认打开的数据库。不填时和`psql`一样打开与用户同名的数据库。 |
| `SQLServer` | 1433 | 连接后默认打开的数据库。不填时打开该登录名的默认数据库。 |
| `Oracle` | 1521 | 数据库的服务名，例如`ORCLPDB1`、`FREEPDB1`。必须填。 |
| `Redis` | 6379 | 连接后默认打开的数据库编号。不填就是0。 |
| `MongoDB` | 27017 | 连接后默认打开的数据库。不填就是`test`。用户先在`admin`库验证，不通过再在这个库验证，用于在这个库里建的用户。 |
| `ClickHouse` | 9000 | 连接后默认打开的数据库。不填就是`default`。Casvisor用ClickHouse的原生协议连接：填原生端口9000（TLS用9440），不要填HTTP端口8123。 |
| `Dameng` | 5236 | 连接后默认的模式。不填时是和用户同名的模式。 |

资产页面上的**测试连接**用表单里的内容登录一次（不保存），显示服务器版本；服务器有TLS时还会填上**指纹**。

数据库资产同样可以有[系统账号](./accounts.md)，例如同一台服务器上的`readonly`和`admin`，由权限决定谁用哪个。Casvisor会按资产的[平台](./platforms.md)在数据库里修改它们的密码、创建MySQL和PostgreSQL用户，并为风险账号读取数据库用户，见[修改密码](./accounts.md#修改密码)。

## 连接和TLS

Casvisor用Go的MySQL驱动、PostgreSQL的pgx、微软的go-mssqldb（SQL Server）、go-ora（Oracle）、go-redis（Redis）、MongoDB官方Go驱动、clickhouse-go（ClickHouse）和达梦官方的Go驱动连接，都是纯Go实现。资产配置了网域网关时，每个连接都经由网域网关。

| 协议 | TLS |
| --- | --- |
| MySQL、PostgreSQL | 服务器支持就用，否则用明文。 |
| SQL Server | 总是用。只有服务器完全不支持加密，并且还没有固定公钥时，才用不加密的连接。 |
| Redis | 服务器有TLS就用。Casvisor先发一个不带凭据的明文`PING`；服务器应答了就说明它用明文，否则用TLS连接。 |
| MongoDB | 服务器支持就用，否则用明文。 |
| ClickHouse | 先试TLS。9000这类不带TLS的端口不会应答TLS握手，这时在还没有固定公钥的情况下改用明文；TLS端口是9440。 |
| Oracle、达梦 | 不用：Casvisor通过普通TCP连接。Casvisor（或网域网关）到服务器之间要走可信的网络。 |

数据库服务器多半用自签名证书，所以Casvisor不校验证书链，而是固定服务器的公钥：TLS连接登录成功后，把公钥的SHA-256记到资产的**指纹**里。此后连接必须用TLS，不能被降级成明文；服务器换了公钥就拒绝连接，错误信息里有新旧两个指纹。如果更换是预期的（例如服务器换了密钥），清空**指纹**再连一次即可。

MongoDB只连资产填的那台主机。Casvisor不去发现副本集的其他成员（网域网关不一定连得到它们的地址），所以资产要指向你想用的那个成员；用户要写数据时指向主节点。

## 控制台

连接后，在工作台的标签页或资产单独的页面里打开控制台。各种数据库的控制台是同一个：

- **工具栏**显示服务器版本和当前数据库，可以用下拉框切换数据库。
- **左侧**列出数据库、数据库里的内容，以及其中一项的详情。**查询这张表**（Redis是**查看这个键**，MongoDB是**查询这个集合**）会在编辑器里填入查询它前几行的语句并执行。
- **编辑器**用**执行**或Ctrl+Enter执行选中的部分，没选中就执行全部。文本按下面各类数据库的规则拆成多条语句，依次执行，每条有自己的结果。一次执行遇到第一条失败或被拦截的就停下。
- **结果**显示语句返回的行，或者影响了多少行，以及耗时。每个结果只保留前1000行，单元格超过64 KB会截断，二进制值以十六进制显示，整个结果到8 MB就不再增加。

语句在同一个连接里逐条执行，所以会话设置、事务和临时表在整个会话里都有效。关闭标签页或管理员停止会话会切断连接，正在执行的语句也随之结束。在编辑器里执行会切换数据库的语句，例如`USE`、Redis的`SELECT 2`、MongoDB的`use app`或Oracle的`ALTER SESSION SET CURRENT_SCHEMA`，工具栏里的当前数据库也会跟着变。

### MySQL和PostgreSQL

左侧列出数据库、每个库的表和视图（PostgreSQL会带上schema），以及某张表的列，并标出主键。**查询这张表**执行`SELECT * FROM <表> LIMIT 100;`。

语句用`;`隔开。拆分时会识别字符串、带引号的名称和注释，包括PostgreSQL的美元符号引用和嵌套注释，其中的`;`不会把语句拆开。

PostgreSQL的一个连接只属于一个数据库，所以只显示当前数据库的表：展开另一个数据库就会切换过去，这时会新建一个连接。

### SQL Server

左侧列出该登录名能打开的数据库、每个库的表和视图（schema不是`dbo`时写在前面），以及它们的列，并标出主键。**查询这张表**执行`SELECT TOP 100 * FROM [schema].[表];`，不是当前数据库时前面再加上库名。

编辑器的用法和SQL Server Management Studio一样：`GO`行之间的文本是一个批，每个批整体发给服务器，所以变量、`IF`块和`BEGIN TRAN ... COMMIT`在批里都能用，`CREATE PROCEDURE`按SQL Server的要求单独放一个批。没有`GO`行的脚本就是一个批。字符串或注释里的`GO`不会拆分。一个批返回的结果都会显示，最多20个：每个结果集、每次修改的行数，以及`PRINT`打印的消息（单独放在最后一个结果里）。`[方括号]`名称和嵌套注释都能识别。

### Oracle

左侧的标题是**模式**：列出拥有当前用户能看到的表或视图的那些模式、每个模式的表和视图，以及它们的列，并标出主键。切换到某个模式会设置`CURRENT_SCHEMA`，不带模式名的名称就指向它的对象。**查询这张表**执行`SELECT * FROM "模式"."表" WHERE ROWNUM <= 100`。

语句用`;`隔开，按Oracle的要求，发送时去掉这个分号。PL/SQL块，即以`BEGIN`、`DECLARE`开头，或者`CREATE`（或`CREATE OR REPLACE`）存储过程、函数、包、触发器、类型或库的语句，和SQL\*Plus里一样一直执行到只有`/`的一行为止，块里的分号保留。`/`行也能结束普通语句。字符串、带引号的名称、`q'[...]'`引用和注释都能识别。`SELECT`和`WITH`返回行，其他语句显示影响了多少行。

### ClickHouse

左侧列出数据库、每个库的表和视图（带表引擎），以及一张表的列，主键里的列有标记。**查询这张表**执行``SELECT * FROM `table` LIMIT 100;``，不是当前数据库时在表名前加上库名。

语句以`;`分隔，发送时Casvisor去掉结尾的`;`，因为原生协议一次只收一条语句。能识别带反斜杠转义的字符串和带引号的名字、`#`和`--`注释，以及嵌套的块注释。`SELECT`、`SHOW`、`DESCRIBE`、`EXPLAIN`、`WITH`、`EXISTS`和`CHECK`返回行；数组、Map和元组以JSON显示。ClickHouse不报告`INSERT`写了多少行，所以显示0。`USE db`切换当前数据库。

### 达梦

达梦（DM8）和Oracle的用法一样。左侧标题是**模式**：列出拥有用户能看到的表或视图的模式、每个模式的表和视图，以及它们的列，主键有标记。切换到某个模式时执行`SET SCHEMA`，之后不带模式名的名字都指这个模式里的对象。**查询这张表**执行`SELECT * FROM "SCHEMA"."TABLE" LIMIT 100`。

语句以`;`分隔，发送时Casvisor去掉结尾的`;`；和Oracle一样，PL/SQL块一直到只有`/`的一行为止。`SELECT`和`WITH`返回行，包括`CLOB`、`BLOB`的值；其他语句报告影响了多少行。

### Redis

左侧列出编号的数据库和当前数据库的键：最先找到的1000个，带类型。展开另一个数据库就会切换过去。展开一个键显示它的类型、以秒计的TTL（-1表示不过期）和大小：字符串的长度，列表、集合、有序集合或流的元素数，或者哈希的字段数。**查看这个键**执行显示它的值的命令：`GET`、`HGETALL`、`LRANGE key 0 99`、`SSCAN key 0 COUNT 100`、`ZRANGE key 0 99 WITHSCORES`或`XRANGE key - + COUNT 100`。

编辑器里一行一条命令，引号规则和`redis-cli`一样：用空格分隔参数，双引号里可以用`\n`、`\x41`这样的转义，也可以用单引号。空行和以`#`开头的行会跳过。列表类的回复一个元素一行；`HGETALL`、`CONFIG GET`、`ZPOPMIN`、`ZPOPMAX`、`HRANDFIELD ... WITHVALUES`以及带`WITHSCORES`的`ZRANGE`等显示成两列，`INFO`每行显示名称和值。

控制台只用一个连接，所以`MULTI ... EXEC`和`WATCH`可以跨行使用。`SELECT n`切换数据库时会新建连接，之前开始的事务或WATCH不会带过去。`BLPOP`这样的阻塞命令按指定的时间等待，或者等到关闭标签页。会改变连接身份、或把连接变成消息流的命令会被拒绝：`AUTH`、`HELLO`、`QUIT`、`RESET`、`SUBSCRIBE`一类、`MONITOR`、`SYNC`、`PSYNC`和`REPLCONF`。

### MongoDB

左侧列出用户能看到的数据库、每个库的集合，以及集合第一个文档的字段和类型。**查询这个集合**执行`db.<集合>.find({}).limit(100)`。

编辑器读的是MongoDB shell（`mongosh`）的语句，由Casvisor解析后用Go驱动执行；不执行任何JavaScript，所以没有变量、函数和循环。语句在`;`处，或在括号外的行尾结束；以`.`开头的行接着上一条，所以较长的`find`可以分几行写。支持下面这些：

| 类别 | 语句 |
| --- | --- |
| shell命令 | `show dbs`（或`show databases`）、`show collections`（或`show tables`）、`use <db>`，单独一个`db`显示当前数据库 |
| 选择 | `db.<集合>`、`db["name"]`、`db.getCollection("name")`、`db.getSiblingDB("name")` |
| 数据库 | `runCommand({...})`、`adminCommand({...})`、`getCollectionNames()`、`getCollectionInfos(filter)`、`createCollection(name)`、`dropDatabase()`、`stats()`、`serverStatus()`、`version()`、`getName()` |
| 读 | `find(filter, projection)`，后面可以接`.sort()`、`.limit()`、`.skip()`、`.projection()`、`.hint()`，或者用`.count()`改为计数；`findOne(filter, projection)`、`countDocuments(filter)`、`estimatedDocumentCount()`、`distinct(field, filter)`、`aggregate([...])` |
| 写 | `insertOne(doc)`、`insertMany([...])`，`updateOne`、`updateMany`和`replaceOne`（参数是过滤条件、更新内容和可选的`{upsert: true}`），`deleteOne(filter)`、`deleteMany(filter)`（删除全部文档用`{}`） |
| 集合 | `createIndex(keys, options)`（选项支持`name`、`unique`、`sparse`和`expireAfterSeconds`）、`dropIndex(名称或键)`、`getIndexes()`、`stats()`、`drop()` |
| 值 | 文档和数组（键可以带或不带引号）、用`'`、`"`或`` ` ``括起的字符串、数字、`true`、`false`、`null`、`/^a/i`这样的正则表达式，以及`ObjectId()`、`ISODate()`（或`new Date()`）、`NumberLong()`、`NumberInt()`、`NumberDecimal()`、`UUID()`、`BinData()`、`Timestamp()`、`RegExp()`、`MinKey`和`MaxKey` |

文档显示成行，每个顶层字段一列；嵌套文档和数组显示成JSON，ObjectId显示成`ObjectId("...")`，日期用UTC。不带limit的`find`显示前1000个文档，总数在服务器上统计。写操作显示插入、修改或删除了多少个文档。

### 复制和导出

用户的权限有**复制**时，结果旁有一个按钮，把结果复制成制表符分隔的文本，可以直接粘贴进表格。有**下载**时，**导出 CSV**把结果存成Excel能按UTF-8打开的CSV文件。导出在服务端检查，能导出当前会话里最近20个有返回行的结果。每次导出都会以`sql-export`记进[操作日志](../audit/operation-logs.md)，带上语句。

其他动作（粘贴、上传、端口转发）在控制台里不起作用；能不能打开控制台由连接动作决定。

## 记录了什么

每条语句都是会话的一条[命令记录](../audit/commands.md)，带时间、用户、资产、客户端IP、协议和结果：行数或错误信息。SQL Server的一个批是一条记录，行数是它所有结果的行数之和，错误信息合在一起。从工具栏或左侧切换数据库会记成对应的语句：

| 协议 | 记成 |
| --- | --- |
| MySQL | ``USE `db` `` |
| PostgreSQL | `\connect db` |
| SQL Server | `USE [db]` |
| Oracle | `ALTER SESSION SET CURRENT_SCHEMA = "SCHEMA"` |
| ClickHouse | ``USE `db` `` |
| 达梦 | `SET SCHEMA "SCHEMA"` |
| Redis | `SELECT 2` |
| MongoDB | `use db` |

会话列表的**命令记录**一列统计这些语句。

命令规则在语句发出之前逐条检查：

- **拦截**：语句不发给数据库。控制台显示*被命令规则拦截*和规则名，记录的动作是`Block`。
- **告警**：语句照常执行，记录带上规则和动作`Alert`。

规则先匹配原样输入的语句，再匹配几种去掉了可能藏住命令的内容后的形式：

- **SQL**：去掉注释后的语句，所以`/* note */ DROP TABLE t`照样会被`^\s*DROP`拦住。MySQL的`/*! ... */`注释里的内容服务器是会执行的，这部分保留。
- **SQL Server的批**：另外还逐行、逐个`;`分段匹配去掉注释后的批，所以`^\s*DROP`能拦住批里任何一行的`DROP`。
- **Redis**：去掉引号后的参数用单个空格连起来，所以`"flushall"`会被`^flushall`拦住，`FLUSHALL    ASYNC`会被`^FLUSHALL ASYNC`拦住。
- **MongoDB**：去掉注释和空格后的语句，所以`db.users /* x */ .drop()`会被`\.drop\(`拦住，`deleteMany( {} )`会被`deleteMany\(\{\}\)`拦住。

模式区分大小写，所以以`(?i)`开头：例如动作为拦截时，SQL用`(?i)^\s*(drop|truncate|delete)\b`，Redis用`(?i)^(flushall|flushdb)\b`，MongoDB用`\.(drop|dropDatabase)\(`。规则对它覆盖的资产的所有协议都生效，所以只针对某类数据库的规则，要配上相应的**资产**或**资产标签**。

数据库会话没有画面可[录像](../audit/recordings.md)。在[会话列表](../audit/sessions.md)里，在线数据库会话的**旁观**打开它的语句列表，每3秒刷新一次；已结束的会话，**回放**显示同样的列表（前1000条），每条有时间、结果和命中的规则。列表的标题是*SQL 语句*，Redis和MongoDB会话是*命令*。

## 本地数据库客户端

MySQL和PostgreSQL资产也可以经Casvisor的[数据库代理](./local-clients.md#数据库客户端)用DBeaver、Navicat、DataGrip、`mysql`、`psql`或任何JDBC工具打开。客户端用数据库令牌登录Casvisor，Casvisor再用资产的账号登录数据库。客户端发来的每条语句都和控制台一样经过命令规则、命令记录和会话列表，所以代理受同样的审计，只需要**连接**权限。

其他几种数据库（SQL Server、Oracle、Redis、MongoDB、ClickHouse和达梦）还没有代理。用户电脑上的客户端，例如`sqlcmd`、SQL\*Plus、`redis-cli`或`mongosh`，可以经[SSH网关的端口转发](./ssh-gateway.md#端口转发到其他资产)连这些资产，例如`ssh -p 2222 -N -L 16379:redis-01:6379 alice@casvisor.example.com`。这种连接Casvisor原样转发、不解析：用户用自己知道的账号登录，命令既不记录也不按规则检查。它需要**端口转发**动作，所以只给该有的人。
