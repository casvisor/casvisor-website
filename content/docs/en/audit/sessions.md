---
title: "Sessions"
description: "Every connection through Casvisor is a session: who opened it, to which asset, over which protocol, from which address and browser, and for how long. Administrators see live and past sessions and can stop a live one."
---

Each connection, that is each tab in the workbench or each asset page, is one **session**. Administrators find them under **Sessions**, in two tabs:

- **Online**: connections open right now.
- **History**: connections that have ended.

## What is recorded

| Column | Meaning |
| --- | --- |
| Asset | The asset connected to |
| Protocol | SSH, RDP, VNC or Telnet |
| User | The Casdoor user who opened it |
| Client IP | The address they connected from, with its location where it can be looked up |
| User agent | Their browser and operating system |
| Connection start time | When the connection opened |
| Connection duration | How long it has lasted, or lasted |

A session moves from Online to History when the user closes the tab, the remote side ends the connection, the network drops, or an administrator stops it.

## Stopping a session

**Stop** on an online session disconnects it at once, whatever the protocol. The user's tab shows that the connection was closed. Stopping does not prevent them from connecting again; for that, change their [permission](../access-control/permissions.md) first, then stop the session.

## Not yet

Watching a session live, recording it and playing it back, and keeping the commands typed in SSH sessions are on the [roadmap](../more/roadmap.md). Today the session list tells you who was on which server when, not what they did there.
