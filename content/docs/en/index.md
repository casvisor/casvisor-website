---
title: "Casvisor documentation"
description: "The manual of Casvisor, the open-source bastion host for SSH, RDP, VNC, Telnet, MySQL and PostgreSQL: installation, sign-in, assets and system accounts, the SSH gateway, file transfer, databases, patch management, jobs, permissions, access requests, sessions, recordings, command rules, operation logs, export and operations."
---

Casvisor is an open-source bastion host (jump server). People sign in, with Casvisor's own accounts or through Casdoor, see the servers they are allowed to reach, and connect to them over SSH, RDP, VNC or Telnet, or to MySQL and PostgreSQL databases, from a browser tab, or with their own SSH client, while Casvisor checks every connection against your permissions and records it.

## Getting started

- [Introduction](./getting-started/introduction.md): what Casvisor does and how the parts fit together
- [Quick start with Docker](./getting-started/quickstart.md): one container, up in a few minutes
- [Connect Casdoor](./getting-started/casdoor.md): sign in through Casdoor instead of the built-in accounts
- [Run from source](./getting-started/source.md): build the backend and the web UI yourself

## Using it

- [Assets](./assets/assets.md): the servers people connect to, and the accounts kept for them
- [System accounts](./assets/accounts.md): several accounts per asset, connecting without seeing the password, and password rotation
- [Connecting](./assets/connecting.md): the workbench, connection tabs and typing your own account
- [SSH gateway](./assets/ssh-gateway.md): `ssh`, `scp`, `sftp`, `rsync` and VS Code Remote through Casvisor
- [Network gateways](./assets/network-gateways.md): assets in other networks, through an SSH jump host or an agent
- [File transfer](./assets/file-transfer.md): the file panel of the web terminal and the remote desktop, and what Upload and Download allow
- [Protocols](./assets/protocols.md): what SSH, RDP, VNC, Telnet and the databases each support
- [Databases](./assets/databases.md): MySQL and PostgreSQL in a SQL console, with every statement recorded
- [Patch management](./assets/patches.md): scan for system updates, install them and restart
- [Jobs](./assets/jobs.md): run commands, scripts and file transfers on many servers at once
- [Users and administrators](./access-control/users-and-admins.md): the built-in accounts and their two-factor sign-in, who manages Casvisor and who only connects
- [Permissions](./access-control/permissions.md): who may reach which asset, as which account, doing what, from where and when
- [Access requests](./access-control/access-requests.md): asking for access for a while, and approving it
- [Sessions](./audit/sessions.md): live and past connections, watching one, and cutting one off
- [Recordings](./audit/recordings.md): replaying sessions in the browser, and where recordings are kept
- [Commands and command rules](./audit/commands.md): the commands run over SSH and Telnet and the SQL run on databases, and blocking the dangerous ones
- [Operation logs](./audit/operation-logs.md): every change made through the API, and every file moved
- [Export and syslog](./audit/export.md): CSV files, and forwarding to a syslog server or SIEM

## Running it

- [Configuration](./operations/configuration.md): every key in `conf/app.conf`
- [Behind a reverse proxy](./operations/reverse-proxy.md): WebSockets, HTTPS and the client IP
- [Upgrading](./operations/upgrading.md): releases, Docker tags and the database

## More

- [Roadmap](./more/roadmap.md): what is being built next
- [Comparison](./more/comparison.md): Casvisor next to JumpServer, Teleport and Warpgate
- [FAQ](./more/faq.md)
