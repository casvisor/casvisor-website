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
| Protocol | SSH, RDP, VNC, Telnet, MySQL, PostgreSQL, SQLServer, Oracle, Redis or MongoDB |
| User | The user who opened it |
| Account | The [system account](../assets/accounts.md) it connected as, or *Default* for the asset's own account |
| Client IP | The address they connected from, with its location where it can be looked up |
| User agent | Their browser and operating system, or for the SSH gateway the client's SSH version, such as `SSH-2.0-OpenSSH_9.6` |
| Connection start time | When the connection opened |
| Commands | For SSH, Telnet and databases, the number of commands or database statements run, linking to them on the [Commands](./commands.md) page |
| Connection duration | How long it has lasted, or lasted |

A session moves from Online to History when the user closes the tab or the SSH client, the remote side ends the connection, the network drops, an administrator stops it, or the user loses the permission to it.

Each session has these actions:

| Action | Tab | |
| --- | --- | --- |
| Monitor | Online | Watch it live, see below |
| Replay | Online and History, when it has a recording | Play the [recording](./recordings.md) in a new tab |
| Stop | Online | Disconnect it, see below |
| Delete | History | Remove it from the list, with its recordings |

The list can be exported as a CSV file with **Export CSV**; see [Export and syslog](./export.md).

Besides the connections people open, each asset a [job](../assets/jobs.md) runs on is a session, with the mode `job` and the user agent `Casvisor job`. It ends when the job is done on that asset, and stopping it stops the job there.

## Watching a session live

An online session has a **Monitor** action, which opens the session in a new browser tab, read only: nothing typed or clicked there reaches the session. Several administrators can watch the same session.

- **SSH and Telnet**: the administrator sees the user's terminal as the user does: first the output so far, up to the last 512 KB, which redraws the screen, then everything as it happens, including changes of the terminal size.
- **VNC and RDP**: the desktop is drawn from the start of the session up to now, then follows live. This reads from the session's recording as it is written, so it needs recording to be on; see [Recordings](./recordings.md#recordings-and-live-monitoring).
- **Databases**: there is no screen to watch, so **Monitor** opens the list of the statements run so far, with their results, refreshed every 3 seconds. After the session ends, **Replay** shows the same list. See [Databases](../assets/databases.md#what-is-recorded).

Through the SSH gateway, interactive shells can be watched; a connection that only runs a command, transfers files or forwards ports cannot. The user is not told that someone is watching. Each time an administrator opens the view, a `session-monitor` entry goes into the [operation log](./operation-logs.md#ssh-and-file-events).

## Sharing a session

Any user can share a session of their own with colleagues of the organization, for example to have someone look at a problem with them. In an SSH, Telnet, VNC or RDP session in the browser, the **Share this session** button at the top right creates a share:

| Field | Meaning |
| --- | --- |
| Who may join | The users the share is for. Anyone in the organization when empty. |
| They may | **Watch and type**: they see the terminal and can take part in it, like an administrator taking control. **Only watch**: they only see it. VNC and RDP sessions can only be watched. |
| For | 10 minutes to 8 hours. |

The share has a link, `https://casvisor.example.com/share/<organization>/<id>`, and a six-digit code; hand both over, for example with **Copy the link and code**. The colleague opens the link, signs in, enters the code and joins. Five wrong codes revoke the share.

While someone is in the session:

- The session shows who joins and leaves, such as *[Casvisor] alice is watching this session through a share*.
- What they type is checked against the [command rules](./commands.md) for them, and recorded with them as the operator, so the Commands page tells who typed what. They need no permission on the asset of their own.
- Revoking the share in the same dialog, its end, or the end of the session disconnects them within a few seconds.

Creating a share and every join are in the [operation log](./operation-logs.md), as `session-share`, `session-share-join` and `session-share-control`.

## Stopping a session

**Stop** on an online session disconnects it at once, whatever the protocol. The user's tab shows that the connection was closed; an SSH client through the gateway is disconnected. Stopping does not prevent them from connecting again; for that, change their [permission](../access-control/permissions.md).

## Disconnected when the permission goes

A session is also ended by Casvisor itself as soon as the user may no longer connect to the asset:

- right after an administrator edits or deletes a permission, an asset, a [system account](../assets/accounts.md) or, with the built-in accounts, a user, or revokes an [access request](../access-control/access-requests.md), every online session is checked again;
- every 30 seconds all online sessions are checked again, which ends the ones whose permission has passed its **End time**.

A session that no permission covers any more, from the user's address at that moment, is closed with code 802 and a reason such as *The permission to connect to the asset: web-01 has been revoked* or *The asset: my-org/web-01 has been deleted*. The SSH and Telnet terminals show the reason to the user; other tabs and SSH clients are disconnected. Administrators are not affected, since they need no permission.

For a connection through the SSH gateway, the same check also picks up a change of actions: taking away Upload, Download or Forward stops the next file transfer or forwarded connection without closing the session. A [port forward to another asset](../assets/ssh-gateway.md#port-forwarding-to-other-assets) is the exception: taking away Forward closes it.

With the built-in accounts, a user who is forbidden or deleted is disconnected, and a change of groups counts at once. Changes made in Casdoor, such as removing someone from a group, do not trigger this check by themselves; see [When changes in Casdoor take effect](../access-control/users-and-admins.md#when-changes-in-casdoor-take-effect).
