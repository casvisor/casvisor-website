---
title: "Casvisor documentation"
description: "The manual of Casvisor, the open-source bastion host for SSH, RDP, VNC and Telnet: installation, Casdoor sign-in, assets, the SSH gateway, file transfer, permissions, sessions, command rules, operation logs and operations."
---

Casvisor is an open-source bastion host (jump server). People sign in through Casdoor, see the servers they are allowed to reach, and connect to them over SSH, RDP, VNC or Telnet from a browser tab, or with their own SSH client, while Casvisor checks every connection against your permissions and keeps the record.

## Getting started

- [Introduction](./getting-started/introduction.md): what Casvisor does and how the parts fit together
- [Quick start with Docker](./getting-started/quickstart.md): one container, up in a few minutes
- [Connect Casdoor](./getting-started/casdoor.md): the organization, application and certificate Casvisor signs in with
- [Run from source](./getting-started/source.md): build the backend and the web UI yourself

## Using it

- [Assets](./assets/assets.md): the servers people connect to, and the accounts kept for them
- [Connecting](./assets/connecting.md): the workbench, connection tabs and typing your own account
- [SSH gateway](./assets/ssh-gateway.md): `ssh`, `scp`, `sftp`, `rsync` and VS Code Remote through Casvisor
- [File transfer](./assets/file-transfer.md): the file panel of the web terminal, and what Upload and Download allow
- [Protocols](./assets/protocols.md): what SSH, RDP, VNC and Telnet each support
- [Users and administrators](./access-control/users-and-admins.md): who manages Casvisor and who only connects
- [Permissions](./access-control/permissions.md): who may reach which asset, doing what, from where and when
- [Sessions](./audit/sessions.md): live and past connections, watching one, and cutting one off
- [Commands and command rules](./audit/commands.md): the commands run over SSH, and blocking the dangerous ones
- [Operation logs](./audit/operation-logs.md): every change made through the API, and every file moved

## Running it

- [Configuration](./operations/configuration.md): every key in `conf/app.conf`
- [Behind a reverse proxy](./operations/reverse-proxy.md): WebSockets, HTTPS and the client IP
- [Upgrading](./operations/upgrading.md): releases, Docker tags and the database

## More

- [Roadmap](./more/roadmap.md): what is being built next
- [Comparison](./more/comparison.md): Casvisor next to JumpServer, Teleport, Warpgate and Guacamole
- [FAQ](./more/faq.md)
