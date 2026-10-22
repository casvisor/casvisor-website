---
title: "Recordings"
description: "Casvisor records SSH, Telnet, VNC and RDP sessions and replays them in the browser, with speed, seeking, skipping idle time and the commands of the session; terminal recordings download as asciicast."
---

Casvisor records every session it carries, of all four protocols, and administrators replay them in the browser. Recording needs nothing on the servers or in the browser, and is on unless you turn it off.

## What is recorded

| Connection | Recorded |
| --- | --- |
| SSH in the web terminal | The terminal output and its size changes |
| Telnet | The terminal output and its size changes |
| VNC | The screen, as the server sent it |
| RDP | The screen, as it was sent to the browser, and the mouse pointer |
| SSH gateway, interactive shell | The terminal output and its size changes |
| SSH gateway, a command on the `ssh` command line, `scp`, `rsync`, SFTP, port forwarding | No recording; the command is kept in the [command records](./commands.md), and files moved in the [operation log](./operation-logs.md#ssh-and-file-events) |

What the user types is not recorded as such, only what appears on the screen, so a password that is not echoed stays out of the recording. The commands of SSH and Telnet sessions are kept separately as [command records](./commands.md). The clipboard of RDP sessions is not recorded.

A terminal session that never showed any output leaves no recording.

## Replaying

Under **Sessions**, a session with a recording has a **Replay** action, on the **Online** tab as well as **History**, so a session can be replayed while it is still going on, up to the moment of opening. It opens the player in a new tab:

- **Play** and **Pause**, the position and length, and a slider to jump anywhere.
- **Speed**: 1x, 2x, 4x, 8x or 16x.
- **Skip idle time**, on by default: any pause longer than 2 seconds is shortened to half a second.
- For SSH and Telnet, the **commands** of the session beside the screen, blocked ones in red and flagged ones in amber. Clicking one jumps to just before it.
- When one session has several recordings, numbered buttons switch between them.

Terminal sessions are replayed in a terminal, VNC with noVNC and RDP with the same code that draws the live desktop, so the replay looks as the session did. Replaying is for administrators only. Each replay or download is written to the [operation log](./operation-logs.md#ssh-and-file-events) as `session-replay`.

## Downloading

The player's **Download** button saves the recording file (`.cvr`), which the player can open again. For SSH and Telnet, **asciicast** saves the session in [asciicast v2](https://docs.asciinema.org/manual/asciicast/v2/) format instead, which [asciinema](https://asciinema.org) and other terminal players can play.

## Where recordings are kept

Recordings are files, not database rows, under `recordings/` in Casvisor's working directory, one folder per organization and day:

```text
recordings/<organization>/<YYYY-MM-DD>/<session>.cvr
```

In the Docker image that is `/recordings`, which is a volume; mount a named volume or a host directory there so that recordings survive the container. Set `recordingPath` to put them elsewhere. The files are written as the session goes, and a file cut short by a crash still plays up to where it ends.

The files can be large for graphical sessions, so watch the disk:

- `recordingRetentionDays` deletes recordings older than that many days, checked at start and every hour. Empty or `0` keeps them forever.
- Deleting a session under **History** deletes its recordings too.
- `disableRecording = true` stops recording new sessions.

If a recording cannot be written, for example because the disk is full, Casvisor logs the error and the session goes on without it.

See [Configuration](../operations/configuration.md#recordings) for the three keys.

## Recordings and live monitoring

[Watching a VNC or RDP session live](./sessions.md#watching-a-session-live) reads from its recording as it is written, so with `disableRecording = true` VNC and RDP sessions cannot be watched. SSH and Telnet sessions can be watched either way.
