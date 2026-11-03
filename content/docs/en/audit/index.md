---
title: "SSH and RDP audit logs"
seoTitle: "SSH and RDP audit log software"
description: "What Casvisor records for SSH and RDP: every session, the commands typed, files moved and changes made, with playback, command rules and operation logs."
---

Casvisor is a bastion host, so every connection goes through it and leaves a record. For SSH and RDP the audit trail has four parts: the session, the commands, the recording, and the changes made through the API or inside the session. Each part has its own page; this one is the map.

## What is kept

| What | SSH | RDP | Page |
| --- | --- | --- | --- |
| Session | Who connected, to which asset, from which address, for how long | The same | [Sessions](./sessions.md) |
| Commands | Every command, from the web terminal or the SSH gateway | None: RDP has no command line to read | [Commands](./commands.md) |
| Screen | Terminal output, replayed in a terminal | Desktop and pointer, replayed with the same RDP code | [Recordings](./recordings.md) |
| Changes | API calls, SFTP and file-panel operations | API calls, redirected-drive file events, clipboard copy and paste | [Operation logs](./operation-logs.md) |

A command given on the `ssh` command line, `scp`, `rsync`, SFTP and port forwarding have no screen to record. The command itself is kept in the command records, and the files moved in the operation log.

## Sessions

Every tab in the workbench, every asset page and every connection through the SSH gateway is one session. It carries the user, asset, protocol, client IP, browser and duration; administrators see the open ones and the finished ones, watch a live session and stop it. See [Sessions](./sessions.md).

## Commands

Casvisor reads the command line of SSH and Telnet sessions, in the web terminal and through the SSH gateway, and keeps it with the user, asset, client IP and session. A command rule matches a regular expression against the text and either blocks the command before it runs or flags it. See [Commands and command rules](./commands.md).

## Screen and terminal recordings

SSH and Telnet recordings keep the terminal output; VNC and RDP recordings keep the screen as it was sent, with the pointer for RDP. Administrators replay them in the browser at up to 16x, skip idle time, jump to a command, or download the `.cvr` file or an asciicast. Recordings are files under `recordings/` in Casvisor's working directory, one folder per organization and day. See [Recordings](./recordings.md).

## Operation logs

The operation log holds the calls made to Casvisor's API, with the user, client IP, action, object and result, and the events inside sessions: SFTP and file-panel transfers, the redirected drive of an RDP session, clipboard copy and paste, live monitoring and replays. Passwords and private keys are masked before an entry is stored. See [Operation logs](./operation-logs.md).

## Who can see it

Sessions, recordings, commands and the operation log are administrator views. They are also where an incident review starts: who reached a server, what they ran, what they saw, and what changed.

## How long it is kept

Recordings stay until `recordingRetentionDays` deletes them; empty or `0` keeps them forever, and deleting a session under **History** deletes its recordings too. Operation log entries are kept until you delete them, and there is no retention setting for them yet.