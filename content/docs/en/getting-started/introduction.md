---
title: "Introduction"
description: "Casvisor is an open-source bastion host. It gives people browser access to servers over SSH, RDP, VNC and Telnet, checks each connection against Casbin permissions, and records every session."
---

Casvisor is an open-source bastion host, also called a jump server. It sits between the people who run your systems and the systems themselves:

- People sign in with accounts Casvisor keeps itself, or through [Casdoor](https://casdoor.ai), so that the single sign-on, MFA, LDAP and social logins you already have apply here too.
- They see only the servers, called **assets**, that a **permission** lets them reach, and connect from a browser tab over SSH, RDP, VNC or Telnet. Nothing is installed on their machine or on the server.
- For SSH they can also use their own `ssh`, `scp`, `sftp` or VS Code Remote through Casvisor's **SSH gateway**, under the same permissions.
- Casvisor fills in the server's account itself, so the password never reaches the browser or the SSH client.
- Each connection becomes a **session** that administrators see in the list, can watch live and cut off, and is **recorded** for playback in the browser. Commands run in SSH and Telnet sessions are kept and can be blocked by **command rules**, files moved go into the **operation log** with every change made through the API, and a session ends by itself when its permission is taken away.
- Administrators can also scan the servers for pending system updates and install them, under **Patches**.

Casvisor is one Go binary with a React web UI, licensed under Apache-2.0, and has no enterprise edition.

## How it fits together

```text
  browser                     Casvisor                              servers
+-----------+   HTTPS    +--------------------------+   SSH     +--------------+
| workbench |----------->| sign-in                  |---------->| Linux        |
| tabs      | WebSocket  | permissions   (Casbin)   |   RDP     | Windows      |
| player    |            | sessions, recordings,    |---------->| desktops     |
+-----------+            | commands, operation log  |   VNC     | network gear |
                         | patches                  |---------->|              |
+-----------+  SSH 2222  |                          |  Telnet   |              |
| ssh, scp, |----------->| SSH gateway              |---------->|              |
| VS Code   |            +--------------------------+           +--------------+
+-----------+               |                |
                     SQLite or MySQL    recordings/
```

- **All four protocols** are handled in Go inside Casvisor: the browser talks to Casvisor over a WebSocket and Casvisor talks to the server. Nothing is installed on the servers.
- **The SSH gateway** is an SSH server inside Casvisor, on its own port. People sign in to it with a public key, and it opens the SSH connection to the asset for them.
- **Network gateways** reach assets in networks Casvisor cannot connect into, through an SSH jump host or an agent; see [Network gateways](../assets/network-gateways.md).
- **Sign-in** uses Casvisor's own accounts, or Casdoor when it is configured, in which case users and groups live in Casdoor.
- Assets, permissions, sessions, commands, SSH keys, patches and the operation log live in Casvisor's database, SQLite by default or MySQL. Recordings are files in `recordings/`.

## What it is for

| You want to | Read |
| --- | --- |
| Give a contractor SSH to two servers for a week, and nothing else | [Permissions](../access-control/permissions.md) |
| Let the whole ops group reach every Linux server, but only from the office network | [Permissions](../access-control/permissions.md) |
| Stop people from copying files or text out of a Windows desktop | [Permissions](../access-control/permissions.md), [Protocols](../assets/protocols.md) |
| Keep the root password of a server away from the people who use it | [Assets](../assets/assets.md) |
| Let people use their own `ssh`, `scp` and VS Code Remote, without handing out server keys | [SSH gateway](../assets/ssh-gateway.md) |
| Let someone put files on a server, but not take any off | [File transfer](../assets/file-transfer.md) |
| See who is connected right now, watch what they do, and kick someone off | [Sessions](../audit/sessions.md) |
| Play back what someone did on a server last week | [Recordings](../audit/recordings.md) |
| Know which commands were run on a server, and stop `rm -rf /` before it runs | [Commands and command rules](../audit/commands.md) |
| Find out who changed a permission and when | [Operation logs](../audit/operation-logs.md) |
| Find and install the pending updates of every server | [Patch management](../assets/patches.md) |

## What it does not do yet

Casvisor is being rebuilt as a full bastion host, and a few things a bastion host is expected to have are still on the [roadmap](../more/roadmap.md): several system accounts per asset with automatic password changes, access requests with approval, database and Kubernetes access, and forwarding logs to syslog. The pages of this manual describe what is in the current code, and say so where a setting has no effect yet.

## Next

[Run it with Docker](./quickstart.md). If you use Casdoor, [connect it](./casdoor.md) afterwards.
