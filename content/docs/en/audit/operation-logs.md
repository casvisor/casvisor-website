---
title: "Operation logs"
description: "Casvisor keeps an operation log of the calls made to its API: who did what, from where, on which object, and whether it worked. By default only changes are logged."
---

The operation log, under **Records**, answers questions such as who added this asset, who widened that permission, and who stopped a session. Every call to Casvisor's API is a candidate, from the web UI or from a script.

## What each entry holds

| Field | Meaning |
| --- | --- |
| Created time | When the call was made |
| Organization, User | Who made it |
| Client IP, User agent | From where and with what |
| Method, Request URI | The HTTP call, such as `POST /api/update-permission` |
| Action | The API action, such as `update-permission` or `stop-session` |
| Object | The request body: the asset, permission or session as sent |
| Response | Whether it succeeded, and the error if not |

Passwords and private keys in the request body are replaced by `***` before the entry is stored.

## What is logged

With `logPostOnly = true`, the default, only `POST` calls are logged, which are the ones that change something: adding, updating and deleting assets and permissions, starting and stopping sessions, signing in and out. Set it to `false` to log reads too, which makes the log far larger. Calls on the log itself are never logged.

Entries are kept until you delete them. There is no retention setting yet; trim the `record` table from the database if it grows too large.
