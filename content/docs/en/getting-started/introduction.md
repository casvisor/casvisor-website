---
title: "Introduction"
description: "Casvisor is an open-source bastion host. It gives people browser access to servers over SSH, RDP, VNC and Telnet, signs them in through Casdoor, checks each connection against Casbin permissions and keeps a record of every session."
---

Casvisor is an open-source bastion host, also called a jump server. It sits between the people who run your systems and the systems themselves:

- People sign in through [Casdoor](https://casdoor.ai), so the single sign-on, MFA, LDAP and social logins you already have apply here too.
- They see only the servers, called **assets**, that a **permission** lets them reach, and connect from a browser tab over SSH, RDP, VNC or Telnet. Nothing is installed on their machine or on the server.
- For SSH they can also use their own `ssh`, `scp`, `sftp` or VS Code Remote through Casvisor's **SSH gateway**, under the same permissions.
- Casvisor fills in the server's account itself, so the password never reaches the browser or the SSH client.
- Each connection becomes a **session** that administrators see in the list, can watch live (SSH) and cut off. Commands run in SSH sessions are recorded and can be blocked by **command rules**, files moved go into the **operation log** with every change made through the API, and a session ends by itself when its permission is taken away.

Casvisor is written in Go and React, licensed under Apache-2.0, and has no enterprise edition.

## How it fits together

```text
  browser                     Casvisor                              servers
+-----------+   HTTPS    +--------------------------+ SSH, RDP  +--------------+
| workbench |----------->| sign-in       (Casdoor)  |---------->| Linux        |
| tabs      | WebSocket  | permissions   (Casbin)   |    VNC    | Windows      |
+-----------+            | sessions, commands,      |---------->| desktops     |
                         | operation log            |           +--------------+
+-----------+  SSH 2222  |                          |                  ^
| ssh, scp, |----------->| SSH gateway              |                  |
| VS Code   |            +--------------------------+                  |
+-----------+                         |  Telnet                        |
                                      v                                |
                                 +---------+                           |
                                 |  guacd  |---------------------------+
                                 +---------+
```

- **SSH, RDP and VNC** are handled in Go inside Casvisor: the browser talks to Casvisor over a WebSocket and Casvisor talks to the server.
- **The SSH gateway** is an SSH server inside Casvisor, on its own port. People sign in to it with a public key, and it opens the SSH connection to the asset for them.
- **Telnet** goes through [guacd](https://guacamole.apache.org/doc/gug/guacamole-architecture.html), the protocol daemon of Apache Guacamole, which Casvisor talks to on port 4822.
- Users, groups and sign-in live in Casdoor. Assets, permissions, sessions, commands, SSH keys and the operation log live in Casvisor's own MySQL database.

## What it is for

| You want to | Read |
| --- | --- |
| Give a contractor SSH to two servers for a week, and nothing else | [Permissions](../access-control/permissions.md) |
| Let the whole ops group reach every Linux server, but only from the office network | [Permissions](../access-control/permissions.md) |
| Stop people from copying files or text out of a Windows desktop | [Permissions](../access-control/permissions.md), [Protocols](../assets/protocols.md) |
| Keep the root password of a server away from the people who use it | [Assets](../assets/assets.md) |
| Let people use their own `ssh`, `scp` and VS Code Remote, without handing out server keys | [SSH gateway](../assets/ssh-gateway.md) |
| Let someone put files on a server, but not take any off | [File transfer](../assets/file-transfer.md) |
| See who is connected right now, watch what they type, and kick someone off | [Sessions](../audit/sessions.md) |
| Know which commands were run on a server, and stop `rm -rf /` before it runs | [Commands and command rules](../audit/commands.md) |
| Find out who changed a permission and when | [Operation logs](../audit/operation-logs.md) |

## What it does not do yet

Casvisor is being rebuilt as a full bastion host, and a few things a bastion host is expected to have are still on the [roadmap](../more/roadmap.md): recording sessions and playing them back, several system accounts per asset with automatic password changes, access requests with approval, database and Kubernetes access, and forwarding logs to syslog. The pages of this manual describe what is in the current code, and say so where a setting has no effect yet.

## Next

[Run it with Docker](./quickstart.md), then [connect it to your Casdoor](./casdoor.md).
