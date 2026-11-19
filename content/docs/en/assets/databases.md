---
title: "Databases"
seoTitle: "Casvisor: MySQL and PostgreSQL access with SQL audit"
description: "MySQL and PostgreSQL assets open in a SQL console in the browser, with the database password kept on the server. Every statement is recorded, checked against command rules, and listed for the session; results can be exported as CSV with the Download action."
---

MySQL and PostgreSQL servers can be assets too. Users open them in a SQL console in a browser tab, with the database account filled in on the server, and every statement they run goes through Casvisor: it is checked against the [command rules](../audit/commands.md), recorded with its result, and listed for the session.

## Adding a database

Add an asset as usual (see [Assets](./assets.md)), with:

| Field | Value |
| --- | --- |
| Protocol | `MySQL` (MariaDB too) or `PostgreSQL`. The port becomes 3306 or 5432. |
| Host, Port | The database server, as reached from Casvisor or from the asset's [network gateway](./network-gateways.md). |
| Username, Password | The database account. Leave them empty to let each user type their own when connecting, as for other assets. |
| Database | The database to open after connecting. It can be left empty: MySQL then starts with no database chosen, and PostgreSQL opens the database named after the user, as `psql` does. |

[System accounts](./accounts.md) work for database assets as well, for example a `readonly` and an `admin` account on one server, with permissions saying who uses which. Their passwords cannot be changed by Casvisor, which only does that over SSH.

Casvisor connects with Go's MySQL driver and with pgx, and uses TLS when the server offers it, without checking the server's certificate; otherwise the connection is plain. Every connection goes through the asset's network gateway when it has one.

## The SQL console

Connecting opens the console in a tab of the workbench or on the asset's page:

- **The left side** lists the databases, the tables of the current one (with their schemas for PostgreSQL), and the columns of a table, with the primary key marked. **Switch to this database** makes a database the current one. **Query this table** puts `SELECT * FROM <table> LIMIT 100;` in the editor.
- **The editor** runs what is selected, or everything when nothing is, with **Run** or Ctrl+Enter. Several statements separated by `;` run one after another, each with its own result. The splitting knows about strings, quoted names and comments, so a `;` inside them does not split. A batch stops at the first statement that fails or is blocked.
- **The results** show the rows a statement returned, or how many rows it changed, with how long it took. Only the first 1,000 rows of a result are kept, a cell is cut at 64 KB, a binary value is shown in hex, and a result stops growing at 8 MB.

Statements run in the same connection, one at a time, so `SET`, transactions and temporary tables last for the session; in PostgreSQL, switching databases opens a new connection. Closing the tab, or an administrator stopping the session, cuts the connection, which also ends a statement still running.

### Copying and exporting

With **Copy** in the user's permission, a result has a button that copies it as tab-separated text, which pastes into a spreadsheet. With **Download**, **Export CSV** saves it as a CSV file that Excel opens as UTF-8. Exporting is checked on the server, and works for the last 20 results with rows in the open session. Each export goes into the [operation log](../audit/operation-logs.md) as `sql-export`, with the statement.

The other actions, Paste, Upload and Forward, do nothing in the console; Connect is what lets a user open it.

## What is recorded

Every statement is a [command record](../audit/commands.md) of the session, with the time, the user, the asset, the client IP, the protocol, and its result: the number of rows, or the error. Switching databases is recorded as the statement it amounts to, ``USE `db` `` for MySQL and `\connect db` for PostgreSQL. The session's **Commands** column counts them.

Command rules apply to each statement before it is sent:

- **Block**: the statement is not sent to the database. The console shows *Blocked by the command rule* with the rule's name, and the record has the action `Block`.
- **Alert**: the statement runs, and the record carries the rule and the action `Alert`.

A rule is matched against the statement as typed, and again with its comments taken out, so `/* note */ DROP TABLE t` is still caught by `^\s*DROP`. MySQL's `/*! ... */` comments, whose content the server does run, are kept in. Patterns are case-sensitive, so start them with `(?i)` for SQL: `(?i)^\s*(drop|truncate|delete)\b` with the action Block stops dropping, emptying and deleting from tables.

Database sessions have no screen to [record](../audit/recordings.md). In the [session list](../audit/sessions.md), **Monitor** on an online database session opens the list of its statements, which refreshes every 3 seconds, and **Replay** on a finished one shows the same list, the first 1,000 statements, with each one's time, result and rule.

## Native clients

The SQL console is the audited way in. A database client on the user's own machine, such as `mysql`, `psql` or DBeaver, can reach a database asset through the [SSH gateway's port forwarding](./ssh-gateway.md#port-forwarding-to-other-assets), for example `ssh -p 2222 -N -L 13306:db-01:3306 alice@casvisor.example.com`. Casvisor passes those bytes through without reading them: the user logs in with an account they know, and the statements are neither recorded nor checked against rules. That needs the **Forward** action, so give it only to the people who should have it.
