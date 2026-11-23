---
title: "Audit reports"
seoTitle: "Casvisor: bastion host audit reports to print, export to Excel and email"
description: "A report of an organization's sign-ins, sessions, commands, file transfers, approvals, account changes and asset and permission changes over a week, a month or any dates, printed to PDF, downloaded as an Excel workbook, or emailed on a schedule."
---

The lists under **Auditing** show one event at a time. A report counts them over a period: how many sign-ins failed last week and from where, who opened the most sessions, which command rules fired, what was uploaded, which access requests were approved, which passwords failed to change, and what changed in the assets and permissions. It is what an auditor asks for, and what MLPS (等保) checks expect to see regularly.

Reports are for administrators and cover their own organization. Open **Auditing → Reports**.

## Choosing the period

| Setting | Meaning |
| --- | --- |
| Period | This week, last week, this month, last month, today, yesterday, the last 7 or 30 days, or custom dates, the first and the last day included, a year at most. Weeks start on Monday. |
| Working days and working hours | The office hours, Monday to Friday 09:00 to 18:00 by default. A successful sign-in outside them counts as an off-hours sign-in. A range such as 22:00 to 06:00 crosses midnight. |
| Time zone | The time zone of the period and the working hours, the browser's by default. |

The settings are in the address of the page, so a bookmark or a link opens the same report again, counted anew.

## What it counts

| Part | Counts | Lists |
| --- | --- | --- |
| Logins | Successful and failed sign-ins, off-hours sign-ins, sign-ins rejected or held for review by [login rules](../access-control/login-rules.md), sign-ins asked for two-step verification | By user and by client IP, with successes and failures; every failed, off-hours or rejected sign-in |
| Sessions | Sessions started, their total time, users and assets | By user, by asset and by protocol, with the count and the time; the 10 longest sessions |
| Commands | Commands and database statements, and those blocked, flagged or held for review by [command rules](./commands.md) | The rules hit most; by user, with blocked commands; every blocked, flagged or held command |
| File transfers | Uploads and downloads in the file panel, over SFTP and through the SSH gateway, and database results exported | By user and by asset; every transfer with its path |
| Access requests and reviews | [Access requests](../access-control/access-requests.md), [login reviews](../access-control/login-rules.md) and [command reviews](./commands.md#review) made in the period, by their outcome: approved, rejected, pending, withdrawn, expired or revoked | Requesters and reviewers; every access request |
| Accounts | [Password changes and pushes](../assets/accounts.md) that succeeded and failed; [account risks](../assets/accounts.md#account-risks) found and resolved in the period, and those open or ignored now | New risks by kind; every password change and push |
| Assets and permissions | Assets now, added and deleted; permissions now, added, updated and deleted or revoked | Assets by protocol; every asset added or deleted; every permission change, with who made it |

Lists of events show the first 200 rows, and lists by user, IP, asset or rule the top 20.

The numbers come from what Casvisor already keeps: the [operation log](./operation-logs.md) for sign-ins, file transfers, password changes and the changes made through the API, and the sessions, commands, access requests, reviews, account risks, assets and permissions themselves. So a report reaches as far back as those do, and deleting operation log entries or sessions takes them out of the reports too.

A few things to know:

- Sign-ins are those on the web page. With built-in accounts, a failed sign-in is counted under the username that was typed, even one that does not exist. With Casdoor, wrong passwords are turned away by Casdoor and never reach Casvisor; the report has the sign-ins that Casvisor rejected, such as by login rules. Signing in through the SSH gateway counts as a session, not as a sign-in.
- An asset counts as added by its creation time, so an asset added and deleted in the same period is only in the deleted count. Deleted assets and permission changes come from the operation log, including those made by administrators of `built-in`.
- A password change counts as failed when Casvisor tried it and the asset refused, for example because the account cannot run `sudo`.
- A session that is still open counts its time up to now.

## Printing and PDF

**Print or save as PDF** opens the report on a page of its own, without the menus and always in light colors, and opens the browser's print dialog. Choose **Save as PDF** as the printer to keep it as a file. The page has a button to print it again.

## Excel

**Export Excel** downloads the report as a workbook (`.xlsx`): a summary sheet with the organization, the period, the time zone, the working hours and the main numbers, then one sheet for each part, with its numbers, lists and events. The workbook is in Chinese when the console is, and in English otherwise. Numbers are number cells, so they can be summed and charted; text is text, never a formula.

Each download is written to the operation log as `export-report`.

## Scheduled reports

**Scheduled reports** keeps reports that are emailed on a schedule, with the Excel workbook attached, for example last week's report every Monday at 08:00, or last month's on the 1st.

| Field | Meaning |
| --- | --- |
| Period | The period counted back from when the report is made: last week for a report sent every Monday, last month for one sent on the 1st. Custom dates are not offered, as the report is made again each time. |
| Sections | The parts to include, each a sheet of the workbook; all of them when none is chosen. |
| Language | The language of the workbook and the email, English or Chinese. |
| Working days, working hours | As on the report page. |
| Send with | [Webhooks of the Email type](./notifications.md#email), each with its SMTP server and recipients. |
| Schedule | A crontab line, such as `0 8 * * 1` for every Monday at 08:00, in the time zone. Empty sends it only by hand. |
| Time zone | The time zone of the schedule, the period and the working hours; the server's when empty. |

The email has the main numbers in its text and the workbook attached as `casvisor-report-<organization>-<first day>-<last day>.xlsx`. **Send now** sends it at once, and **Download** gets the same workbook without sending it. The list shows the next run, and the time, result and message of the last one. When sending fails, the report records why, and the `report.failed` [webhook event](./notifications.md) is sent, for example to a chat group.

## API

- `GET /api/get-report-data` counts a report and returns it as JSON. It takes `owner` and `period`, `startDate` and `endDate` such as `2026-11-01` for custom dates, and optionally `timeZone`, `weekdays` (such as `1,2,3,4,5`, 0 being Sunday), `workStartTime`, `workEndTime` and `sections` (`login`, `session`, `command`, `file`, `approval`, `account`, `asset`); or `id` for a scheduled report.
- `GET /api/download-report` takes the same and `lang` (`en` or `zh`), and returns the workbook.
- `get-reports`, `get-report`, `add-report`, `update-report`, `delete-report` and `run-report` manage the scheduled reports.
