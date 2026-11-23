---
title: "Assets"
description: "An asset is a server people connect to through Casvisor: its protocol, host and port, the account Casvisor logs in with, and a tag that groups it with others for permissions."
---

An **asset** is one server, desktop or device that people reach through Casvisor, over one protocol. A Windows server that you want both RDP and SSH into is two assets.

Administrators manage assets under **Assets**. Users who are not administrators see on that page, and in the [workbench](./connecting.md), only the assets a [permission](../access-control/permissions.md) gives them, and cannot change them.

## Fields

| Field | Meaning |
| --- | --- |
| Organization | The organization the asset belongs to. Only users of that organization can be given it. |
| Name | The ID, unique within the organization. Permissions refer to assets by it. |
| Display name, Description | What users see in the workbench. |
| Protocol | `SSH`, `RDP`, `VNC`, `Telnet`, `MySQL`, `PostgreSQL`, `SQLServer`, `Oracle`, `Redis` or `MongoDB`. Choosing one fills in its usual port. See [Protocols](./protocols.md) and [Databases](./databases.md). |
| Host, Port | Where Casvisor connects to. The address is resolved and reached from the Casvisor server, or from the network gateway, not from the user's browser, so it can be a private address the users cannot reach themselves. |
| Username, Password | The account Casvisor logs in with, the asset's default account. See below. The [SSH gateway](./ssh-gateway.md) needs at least the username. |
| Private key | For SSH: a private key to log in with, instead of or besides the password. See below. |
| Fingerprint | The server's SSH host key or RDP certificate, or the public key of a database server with TLS, recorded on the first connection. See [Protocols](./protocols.md). |
| Database | For databases: the database to open after connecting. For Oracle it is the service name, and for Redis the database number. See [Databases](./databases.md). |
| Network gateway | *Direct connection*, or the [network gateway](./network-gateways.md) to reach the asset through. |
| OS | `Linux` or `Windows`, shown in the list. |
| Tag | A label such as `prod-linux` or `db`. A [permission](../access-control/permissions.md) can grant every asset with a tag at once, so the tag works as an asset group. |

## The account

What you put in **Username** and **Password** decides how people log in to the server:

- **Both filled in.** Casvisor logs in with that account and the user lands straight in the session. The password is never sent to the browser: the API returns it as `***`, and saving the asset with `***` keeps the stored password. For VNC, Casvisor completes the VNC authentication itself and the browser only ever sees an unauthenticated stream.
- **Username only.** The user is asked for the password when connecting.
- **Neither.** The user is asked for both, so each person logs in with their own account and the server's own logs show who it was.

What a user types is sent with that one connection and not stored. The workbench hands it to the connection tab through the browser's local storage for at most a minute and then removes it, so it does not appear in the URL or the history.

For SSH you can store a **Private key** (OpenSSH or PEM format) instead of, or as well as, a password. Casvisor tries the key first. If the key is protected by a passphrase, put the passphrase in **Password**. Like the password, the key is returned as `***` and never reaches the browser.

### Encryption

Set `credentialKey` in the configuration, to a long random string, and Casvisor stores passwords and private keys encrypted with AES-256-GCM, using a key derived from it. On start it also encrypts any that were stored before the key was set. Keep `credentialKey` out of git, for example in `conf/app.local.conf` (see [Configuration](../operations/configuration.md)), and back it up with the database: without it the stored credentials cannot be read, and connections to those assets fail with *credentialKey may be wrong*.

Without `credentialKey`, credentials are stored as they are, so protect the database and its backups as you would the passwords themselves.

### More accounts

Once an asset is saved, its page has a **System accounts** section for more accounts on the same server, such as `root` and `deploy`, with permissions saying who may connect as which, and with their passwords changed by Casvisor on SSH assets. See [System accounts and password rotation](./accounts.md).

## Import and export

**Import** on the asset list adds assets from a CSV file or an Excel workbook (`.xlsx`), whose first line is the header; from a workbook the first sheet is read. The columns are those of the export:

`name, displayName, description, protocol, host, port, username, password, privateKey, database, os, tag, nodes, networkGateway`

Only `name` is required, and columns may be left out or come in any order; headers such as `Display name` or `display_name` are understood too. The protocol defaults to SSH and the port to the protocol's usual one. `nodes` holds paths in the asset tree, such as `Beijing/Production`, separated by `;`, and the nodes that do not exist yet are created. In `privateKey`, `\n` stands for a new line. A file holds at most 5,000 assets.

**Preview** first tells, row by row, what would be created, updated or skipped and why a row fails, without changing anything; a row with an error is skipped and the others go on. With **Update the assets that already exist** on, an existing asset takes the values in the file, keeps those of the columns the file leaves out, and keeps its password and private key when those cells are empty. The import is written to the operation log as `import-assets`, with the file itself masked.

**Export** downloads the assets that match the list's search and the selected node, as CSV or Excel, in the same columns and without passwords and private keys, so the file can be edited and imported back. In the Excel file every cell is text, so nothing in it runs as a formula.

## Network placement

Casvisor opens the connections, so it needs to reach the assets' hosts and ports. A common layout is Casvisor on a host inside the private network, published to users over HTTPS, with the assets' firewalls only letting in Casvisor's address. Users then have no direct way to the servers at all, and every connection passes the permission check and lands in the [session list](../audit/sessions.md).

Assets in networks that Casvisor cannot reach, such as another data center or an office behind NAT, are reached through a [network gateway](./network-gateways.md): an SSH jump host in that network, or an agent there that connects out to Casvisor.
