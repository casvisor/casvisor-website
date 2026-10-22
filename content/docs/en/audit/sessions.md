---
title: "Sessions"
description: "Every connection through Casvisor is a session: who opened it, to which asset, over which protocol, from which address and browser, and for how long. Administrators see live and past sessions, watch and replay them, and can stop a live one."
---

Each connection, that is each tab in the workbench, each asset page, or each connection through the [SSH gateway](../assets/ssh-gateway.md), is one **session**. Administrators find them under **Sessions**, in two tabs:

- **Online**: connections open right now.
- **History**: connections that have ended.

## What is recorded

| Column | Meaning |
| --- | --- |
| Asset | The asset connected to |
| Protocol | SSH, RDP, VNC or Telnet |
| User | The user who opened it |
| Client IP | The address they connected from, with its location where it can be looked up |
| User agent | Their browser and operating system, or for the SSH gateway the client's SSH version, such as `SSH-2.0-OpenSSH_9.6` |
| Connection start time | When the connection opened |
| Commands | For SSH, the number of commands run, linking to them on the [Commands](./commands.md) page |
| Connection duration | How long it has lasted, or lasted |

A session moves from Online to History when the user closes the tab or the SSH client, the remote side ends the connection, the network drops, an administrator stops it, or the user loses the permission to it.

Each session has these actions:

| Action | Tab | |
| --- | --- | --- |
| Monitor | Online | Watch it live, see below |
| Replay | Online and History, when it has a recording | Play the [recording](./recordings.md) in a new tab |
| Stop | Online | Disconnect it, see below |
| Delete | History | Remove it from the list, with its recordings |

## Watching a session live

An online session has a **Monitor** action, which opens the session in a new browser tab, read only: nothing typed or clicked there reaches the session. Several administrators can watch the same session.

- **SSH and Telnet**: the administrator sees the user's terminal as the user does: first the output so far, up to the last 512 KB, which redraws the screen, then everything as it happens, including changes of the terminal size.
- **VNC and RDP**: the desktop is drawn from the start of the session up to now, then follows live. This reads from the session's recording as it is written, so it needs recording to be on; see [Recordings](./recordings.md#recordings-and-live-monitoring).

Through the SSH gateway, interactive shells can be watched; a connection that only runs a command, transfers files or forwards ports cannot. The user is not told that someone is watching. Each time an administrator opens the view, a `session-monitor` entry goes into the [operation log](./operation-logs.md#ssh-and-file-events).

## Stopping a session

**Stop** on an online session disconnects it at once, whatever the protocol. The user's tab shows that the connection was closed; an SSH client through the gateway is disconnected. Stopping does not prevent them from connecting again; for that, change their [permission](../access-control/permissions.md).

## Disconnected when the permission goes

A session is also ended by Casvisor itself as soon as the user may no longer connect to the asset:

- right after an administrator edits or deletes a permission or an asset, or, with the built-in accounts, a user, every online session is checked again;
- every 30 seconds all online sessions are checked again, which ends the ones whose permission has passed its **End time**.

A session that no permission covers any more, from the user's address at that moment, is closed with code 802 and a reason such as *The permission to connect to the asset: web-01 has been revoked* or *The asset: my-org/web-01 has been deleted*. The SSH and Telnet terminals show the reason to the user; other tabs and SSH clients are disconnected. Administrators are not affected, since they need no permission.

For a connection through the SSH gateway, the same check also picks up a change of actions: taking away Upload, Download or Forward stops the next file transfer or forwarded connection without closing the session.

With the built-in accounts, a user who is forbidden or deleted is disconnected, and a change of groups counts at once. Changes made in Casdoor, such as removing someone from a group, do not trigger this check by themselves; see [When changes in Casdoor take effect](../access-control/users-and-admins.md#when-changes-in-casdoor-take-effect).
