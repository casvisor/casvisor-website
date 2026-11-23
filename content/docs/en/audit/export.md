---
title: "Export and syslog"
seoTitle: "Casvisor: export audit logs to CSV or Excel and forward them to syslog or a SIEM"
description: "Download sessions, commands and the operation log as CSV files or Excel workbooks, filtered as the list is, and forward sessions, commands and operation log entries to a syslog server as RFC 5424 with a JSON body or as CEF, for a SIEM."
---

The audit trail lives in Casvisor's database. Two ways get it out: CSV files and Excel workbooks downloaded from the lists, and a live feed to a syslog server, from which a SIEM such as Splunk, Elastic, QRadar or ArcSight can take it.

## CSV and Excel export

**Sessions**, **Commands** and **Records** (the [operation log](./operation-logs.md)) each have an **Export** button, with a choice of CSV (`.csv`) or Excel (`.xlsx`). It downloads every row that matches what the list shows, across all its pages: the current search and sort, and on **Sessions** the tab, Online or History. A file holds at most 100,000 rows.

| List | Columns |
| --- | --- |
| Sessions | ID, Asset, Protocol, Mode, User, Client IP, Client IP location, User agent, Status, Start time, End time, Duration (s), Commands, Code, Message |
| Commands | Time, Command, Action, Rule, Reviewer, Error, User, Operator, Asset, Client IP, Session |
| Records | ID, Name, Time, Organization, User, Client IP, User agent, Method, Request URI, Action, Language, Object, Response |

The file is UTF-8 with a byte order mark, so Excel shows Chinese and other text correctly, and is named after the list and the time, such as `commands-20261120-153000.csv`. A cell that starts with `=`, `+`, `-` or `@` gets a `'` in front, so a spreadsheet does not run it as a formula.

The Excel file has the same columns on one sheet named after the list, with the header row frozen, and is named the same way, such as `commands-20261120-153000.xlsx`. Every cell is written as text, so a command such as `=1+1` shows as it was typed, with no `'` and without running. The **Assets** list exports the same way; see [Assets](../assets/assets.md#import-and-export).

For counts over a period rather than rows, such as failed sign-ins last week or the rules hit most, see [Audit reports](./reports.md).

Exporting is for administrators, and covers their own organization. Each export is itself written to the operation log, as `export-sessions`, `export-commands` or `export-records`, with the number of rows, the file name and the filter used.

The results of a [database session](../assets/databases.md#copying-and-exporting) are exported from the database console instead.

## Syslog forwarding

Set `syslogAddress` and Casvisor sends three kinds of events to that syslog server as they happen:

| Event | Sent when | Type |
| --- | --- | --- |
| Operation log entry | An entry is written to the [operation log](./operation-logs.md), including the session events such as SFTP transfers | `record` |
| Command | A command or database statement is recorded, including blocked ones and those run by [jobs](../assets/jobs.md) | `command` |
| Session | A session connects, and when it ends | `session-start`, `session-end` |

```ini
syslogAddress = udp://10.0.0.5:514
syslogFormat = rfc5424
```

`syslogAddress` is `udp://host:port` or `tcp://host:port`; without a scheme it is UDP. Empty, the default, turns forwarding off. Over TCP each message ends with a newline. TLS is not supported; to send over an untrusted network, forward to a local relay such as rsyslog and let it encrypt. See [Configuration](../operations/configuration.md#audit-forwarding).

### RFC 5424 with a JSON body

`syslogFormat = rfc5424`, the default, sends RFC 5424 messages with the app name `casvisor`, the event type as the message ID and the event as JSON:

```text
<110>1 2026-11-20T15:30:00.000+08:00 bastion casvisor 1234 command - {"type":"command","time":"2026-11-20T15:30:00+08:00","organization":"casvisor","user":"casvisor/alice","clientIp":"203.0.113.7","asset":"casvisor/web-01","session":"casvisor/2f1c...","command":"systemctl restart nginx","action":"","rule":""}
```

| Type | Fields |
| --- | --- |
| `record` | id, organization, user, clientIp, userAgent, method, requestUri, action, object, status, message |
| `command` | organization, user, clientIp, asset, session, command, action, rule |
| `session-start` | organization, session, user, clientIp, userAgent, asset, protocol, mode, startTime |
| `session-end` | the same, and endTime, duration (seconds), commandCount, code, message |

### CEF

`syslogFormat = cef` sends ArcSight's Common Event Format behind a BSD-style syslog header, with the vendor `Casbin` and the product `Casvisor`:

```text
<110>Nov 20 15:30:00 bastion CEF:0|Casbin|Casvisor|1.0|command|Command|3|rt=1795159800000 cs1=casvisor cs1Label=organization suser=casvisor/alice src=203.0.113.7 dhost=casvisor/web-01 cs2=casvisor/2f1c... cs2Label=session msg=systemctl restart nginx
```

The fields use the standard CEF keys where there is one (`suser`, `src`, `dhost`, `act`, `msg`, `request`, `requestMethod`, `requestClientApplication`, `app`, `start`, `end`, `outcome`, `externalId`), and `cs1` to `cs3` and `cn1` to `cn3` with a label for the rest, such as `cs1Label=organization`. Times in `rt`, `start` and `end` are in milliseconds.

### Severity

All events use the facility *log audit* (13).

| Event | Syslog severity | CEF severity |
| --- | --- | --- |
| Most events | Informational (6) | 3 |
| A failed API call, a command that matched an Alert rule | Notice (5) | 5 |
| A command stopped by a Block rule | Warning (4) | 8 |

### When the server is down

Events wait in a queue of 10,000 in memory and are sent one by one. When the server cannot be reached, Casvisor reconnects, waiting up to 30 seconds between tries, and logs a warning at most once a minute. When the queue is full, new events are dropped, and the number dropped is logged every minute. A UDP message is tried at most twice. The events stay in Casvisor's database either way; the feed is a copy. A value longer than 2,000 bytes is cut.
