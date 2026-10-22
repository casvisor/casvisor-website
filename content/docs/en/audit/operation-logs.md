---
title: "Operation logs"
description: "Casvisor keeps an operation log of the calls made to its API: who did what, from where, on which object, and whether it worked. By default only changes are logged."
---

The operation log, under **Records**, answers questions such as who added this asset, who widened that permission, and who stopped a session. Every call to Casvisor's API is a candidate, from the web UI or from a script, and so are some things done inside sessions, such as files moved over SFTP.

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

## SSH and file events

Some things happen inside a session rather than through an API call, so Casvisor writes an entry for them itself. In these entries **Method** is `SSH`, `SFTP` or `RDP` (`GET` for replays), **Request URI** holds the detail, such as a path, and **Object** holds the asset.

| Action | When | Detail |
| --- | --- | --- |
| `ssh-connect` | A connection through the [SSH gateway](../assets/ssh-gateway.md) logs in to the asset | |
| `ssh-forward` | A gateway connection forwards to a destination for the first time | `host:port`, or the socket path |
| `sftp-download` | A file is opened for reading over SFTP, or downloaded in the [file panel](../assets/file-transfer.md) | The path |
| `sftp-upload` | A file is opened for writing over SFTP, or uploaded in the file panel | The path |
| `sftp-mkdir`, `sftp-rmdir`, `sftp-remove` | A folder is created or removed, or a file removed, over SFTP, or a folder created in the file panel | The path |
| `sftp-delete` | A file or folder is deleted in the file panel of an SSH session | The path |
| `sftp-rename` | A file or folder is renamed over SFTP or in the file panel | `old -> new` |
| `sftp-symlink`, `sftp-link` | A link is created over SFTP | `link -> target` |
| `file-upload`, `file-download`, `file-mkdir`, `file-rename`, `file-delete` | The same in the file panel of an [RDP session](../assets/file-transfer.md#rdp) | The path, or `old -> new` |
| `file-create`, `file-mkdir`, `file-read`, `file-write`, `file-rename`, `file-delete` | The remote desktop uses the redirected drive of an RDP session; `file-write` once the file is closed | The path, with the bytes written for `file-write` |
| `clipboard-copy`, `clipboard-paste` | Text is copied out of or pasted into an [RDP session](../assets/protocols.md#clipboard) | The text, up to 1000 bytes |
| `session-monitor` | An administrator opens the [live view](./sessions.md#watching-a-session-live) of a session | The session |
| `session-replay` | An administrator replays or downloads a [recording](./recordings.md) | The recording file |

These entries are written whatever `logPostOnly` says. The commands run in SSH and Telnet sessions are not here but on the [Commands](./commands.md) page.

## Retention

Entries are kept until you delete them. There is no retention setting yet; trim the `record` table from the database if it grows too large.
