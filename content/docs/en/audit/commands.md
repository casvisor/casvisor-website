---
title: "Commands and command rules"
description: "Casvisor records the commands run in SSH and Telnet sessions, from the web terminal, the SSH gateway and jobs, and the SQL statements, Redis commands and MongoDB calls run in database sessions; command rules block, hold for review or flag the ones that match a regular expression, for chosen users, groups, assets and asset tags."
---

Casvisor keeps the commands people run on SSH and Telnet assets, whether from the web terminal or, for SSH, through the [SSH gateway](../assets/ssh-gateway.md) and [jobs](../assets/jobs.md), and what they run on [database assets](../assets/databases.md), the SQL statements of MySQL, PostgreSQL, SQL Server and Oracle, Redis commands and MongoDB shell calls, and the shells and kubectl requests of [Kubernetes assets](../assets/kubernetes.md), and can stop the ones you name before they run, or hold them until an administrator approves them. RDP and VNC sessions have no command records; their screens are in the [recordings](./recordings.md).

These pages are for administrators: **Commands** (`/commands`), **Command rules** (`/command-rules`) and **Command reviews** (`/command-reviews`).

## How commands are read

**In an interactive shell**, Casvisor follows the session on a virtual screen of its own, the same size as the user's terminal. When the user presses Enter, it reads the line from the end of the prompt to the cursor, as it is shown at that moment. So the command recorded is the one that runs:

- Tab completion, a line recalled from history with the arrow keys, and edits in the middle of the line are all in it.
- Long lines that wrap, and characters such as Chinese, are read correctly.
- Nothing is recorded while a full-screen program such as `vim`, `top` or `less` is open.
- Input the shell does not echo, such as a password typed for `sudo`, is not on the screen and is not recorded.

**For a command given on the `ssh` command line**, such as `ssh web-01 'systemctl restart nginx'`, the command is recorded as the client sent it. This includes the commands that `scp -O` and `rsync` run on the asset.

**For a job**, the command or the whole script is recorded once for each asset it runs on, and a file transfer as `sftp put <file> <target path>`.

**In a database session**, each statement is recorded as it was sent, one record per statement, even when several were run together: a SQL statement, a SQL Server batch between `GO` lines, a line of Redis commands, or a MongoDB shell statement. Switching databases is recorded as the statement it amounts to, such as ``USE `db` ``, `\connect db`, `USE [db]`, `SELECT 2` or `use db`; see [Databases](../assets/databases.md#what-is-recorded).

## The Commands page

Each line is one command: the time, the command, the user, the asset, the client IP, the session, and, when a rule matched, the rule and its action. For a database statement, a **Result** column shows the number of rows it returned or changed, or its error. The list can be searched by command, user, asset, client IP and session, and exported as CSV or Excel; see [Export and syslog](./export.md). In the [session list](./sessions.md), the **Commands** column counts the commands of each SSH, Telnet and database session and links to them. The player of a [recording](./recordings.md) lists the commands of SSH and Telnet sessions beside the screen; clicking one jumps to it. A database session has no recording, and its **Replay** is the list of its statements.

## Command rules

A command rule names a pattern and what to do when a command matches it.

| Field | Meaning |
| --- | --- |
| Organization, Name | The rule belongs to one organization and applies to its assets. |
| Pattern | A regular expression in Go's syntax (RE2). It matches when it is found anywhere in the command, so anchor it with `^` and `$` to match the whole command. It is case-sensitive; start it with `(?i)` to ignore case. In database sessions it is matched against each SQL statement, SQL Server batch, Redis command or MongoDB call. |
| Action | `Block`, `Review` or `Alert`. |
| Reviewers | For a `Review` rule, the administrators who may approve or reject what it holds. Leave it empty for every administrator of the organization. |
| Users, Groups | Who it applies to. Leave both empty, or use `*`, for everyone. |
| Assets, Asset tags | Which assets it applies to. Leave both empty, or use `*`, for every asset of the organization. |
| Enabled | Off means the rule is ignored. |

Rules apply to administrators as well. When several rules match, `Block` wins over `Review`, and `Review` over `Alert`.

Some patterns:

| Pattern | Matches |
| --- | --- |
| `^\s*rm\s+-rf\s+/\s*$` | `rm -rf /`, but not `rm -rf /tmp/x` |
| `\b(shutdown\|reboot\|halt\|poweroff)\b` | Any command that mentions these |
| `^\s*(mkfs\|fdisk\|parted)\b` | Commands that start with these |
| `(?i)^\s*(drop\|truncate\|delete)\b` | SQL statements that drop, empty or delete from tables, in any letter case |
| `(?i)^(flushall\|flushdb)\b` | Redis commands that empty a database or all of them |
| `\.(drop\|dropDatabase)\(` | MongoDB calls that drop a collection or a database |

### Block

In an interactive shell, Casvisor does not pass on the Enter key. It sends Ctrl+C instead, so the line is cleared without running, and shows a red line in the user's terminal: *[Casvisor] The command is blocked by the rule: ...*. For a command on the `ssh` command line, the gateway refuses it with *casvisor: the command is blocked by the rule: ...* and exit status 1.

In a database session, the statement is not sent to the database, the console shows that the command rule blocked it, and the statements after it in the same run are not run either. A rule is checked against the statement as typed and again with its comments taken out, and for a SQL Server batch line by line, for Redis with the quotes read and for MongoDB without spaces, so a comment in front or quotes do not hide it; see [Databases](../assets/databases.md#what-is-recorded). In a [job](../assets/jobs.md), each line of the command or script is checked, and a match stops the job on that asset before anything runs, with the status *Blocked*.

The command is recorded with the action `Block`.

### Review

The command waits until another administrator approves it, for up to 10 minutes. This is for commands that are sometimes needed but should not run on one person's word, such as restarting a database or deleting data.

In an interactive shell, Casvisor holds the Enter key and shows a yellow line in the user's terminal: *[Casvisor] The command needs the approval of an administrator by the rule: ..., it waits for review (request ...) for up to 10 minutes, press Ctrl+C to withdraw it*. Keys typed while it waits are dropped, so the line that is approved is the line that runs. Once it is approved, Casvisor passes on the Enter key and the command runs in the same session; when it is rejected, not reviewed in time, or withdrawn with Ctrl+C, the line is cleared as for Block, with the reviewer's comment if there is one. For a command on the `ssh` command line, the gateway prints the same message to stderr and waits; closing the connection withdraws the command.

In a database session, the console shows that the statement waits for approval, with a **Withdraw** button, and runs it once it is approved; a rejected statement comes back as an error and stops the run. In a [job](../assets/jobs.md), the job waits on that asset; the job's timeout only starts once the command may run, and canceling the job withdraws it. On a [website](../assets/websites.md), a browser can't wait, so the request is answered with a page saying it waits for review; a page that was opened reloads by itself every 5 seconds and opens once it is approved, and a form is sent again by the user. Each approval lets the request through once, and a rejected request stays rejected for 10 minutes.

Administrators approve or reject on the **Command reviews** page, which lists what waits, with the command, the user, the asset and the session; a waiting command's session can be watched live from there before deciding. Nobody can review a command of their own, including one they typed while taking part in someone else's session. Ending the session withdraws the commands that still wait in it. New and reviewed commands can be sent to DingTalk, Feishu, WeCom, Slack or any URL through webhooks (the **Webhooks** page), as the events `command_review.created` and `command_review.reviewed`, so reviewers learn of them at once.

The command is recorded with the action `Review`, the reviewer and, when it did not run, why.

### Alert

The command runs as usual and is recorded with the action `Alert` and the rule, so it can be found on the Commands page. Casvisor does not send a notification for it, but with [syslog forwarding](./export.md#syslog-forwarding) it reaches the syslog server with the severity Notice, and a blocked command with Warning.

## What a rule cannot stop

A rule sees the command line as typed. It can be worked around: by putting the command in a script and running the script, by building it from variables or aliases, by running it inside a full-screen program, or with commands that a pattern does not foresee. Treat Block as a guard against mistakes, and keep the permissions themselves narrow.

Rules also only see commands. Files and the clipboard move through channels of their own: the file panel, SFTP, `scp` and `rsync`, the redirected drive and the clipboard of RDP, and the clipboard of VNC. Those are governed by the **Upload**, **Download**, **Copy** and **Paste** actions of a [permission](../access-control/permissions.md), which Casvisor checks on each of them. A command on the `ssh` command line or a shell without a terminal can pipe files in and out too, so the gateway only allows them with both Upload and Download. To keep data from leaving an asset, leave Download and Copy out of the permission; a user can still read what is shown on the screen, which the [recording](./recordings.md) keeps.
