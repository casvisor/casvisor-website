---
title: "Assets"
description: "An asset is a server people connect to through Casvisor: its protocol, host and port, the account Casvisor logs in with, and a tag that groups it with others for permissions."
---

An **asset** is one server, desktop or device that people reach through Casvisor, over one protocol. A Windows server that you want both RDP and SSH into is two assets.

Administrators manage assets under **Assets**. Users who are not administrators never see this page; they get the assets a [permission](../access-control/permissions.md) gives them in the [workbench](./connecting.md).

## Fields

| Field | Meaning |
| --- | --- |
| Organization | The Casdoor organization the asset belongs to. Only users of that organization can be given it. |
| Name | The ID, unique within the organization. Permissions refer to assets by it. |
| Display name, Description | What users see in the workbench. |
| Protocol | `SSH`, `RDP`, `VNC` or `Telnet`. Choosing one fills in its usual port. See [Protocols](./protocols.md). |
| Host, Port | Where Casvisor connects to. The address is resolved and reached from the Casvisor server (or from guacd, for Telnet), not from the user's browser, so it can be a private address the users cannot reach themselves. |
| Username, Password | The account Casvisor logs in with. See below. |
| OS | `Linux` or `Windows`, shown in the list. |
| Tag | A label such as `prod-linux` or `db`. A [permission](../access-control/permissions.md) can grant every asset with a tag at once, so the tag works as an asset group. |

## The account

What you put in **Username** and **Password** decides how people log in to the server:

- **Both filled in.** Casvisor logs in with that account and the user lands straight in the session. The password is never sent to the browser: the API returns it as `***`, and saving the asset with `***` keeps the stored password. For VNC, Casvisor completes the VNC authentication itself and the browser only ever sees an unauthenticated stream.
- **Username only.** The user is asked for the password when connecting.
- **Neither.** The user is asked for both, so each person logs in with their own account and the server's own logs show who it was.

What a user types is sent with that one connection and not stored. The workbench hands it to the connection tab through the browser's local storage for at most a minute and then removes it, so it does not appear in the URL or the history.

Stored passwords are kept in the database as they are. Encrypting them, several accounts per asset and SSH private keys are on the [roadmap](../more/roadmap.md); until then, protect the database and its backups as you would the passwords themselves.

## RemoteApp

RDP assets have a **RemoteApp** table for publishing a single Windows program instead of the whole desktop. The current code does not pass it to the connection yet, so a RemoteApp asset still opens the full desktop.

## Network placement

Casvisor, and guacd for Telnet, open the connections, so they need to reach the assets' hosts and ports. A common layout is Casvisor on a host inside the private network, published to users over HTTPS, with the assets' firewalls only letting in Casvisor's address. Users then have no direct way to the servers at all, and every connection passes the permission check and lands in the [session list](../audit/sessions.md).
