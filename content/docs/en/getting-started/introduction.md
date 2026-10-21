---
title: "Introduction"
description: "Casvisor is an open-source bastion host. It gives people browser access to servers over SSH, RDP, VNC and Telnet, signs them in through Casdoor, checks each connection against Casbin permissions and keeps a record of every session."
---

Casvisor is an open-source bastion host, also called a jump server. It sits between the people who run your systems and the systems themselves:

- People sign in through [Casdoor](https://casdoor.ai), so the single sign-on, MFA, LDAP and social logins you already have apply here too.
- They see only the servers, called **assets**, that a **permission** lets them reach, and connect from a browser tab over SSH, RDP, VNC or Telnet. Nothing is installed on their machine or on the server.
- Casvisor fills in the server's account itself, so the password never reaches the browser.
- Each connection becomes a **session** that administrators can watch in the list and cut off, and every change made through the API goes into the **operation log**.

Casvisor is written in Go and React, licensed under Apache-2.0, and has no enterprise edition.

## How it fits together

```text
  browser                     Casvisor                              servers
+-----------+   HTTPS    +--------------------------+ SSH, RDP  +--------------+
| workbench |----------->| sign-in       (Casdoor)  |---------->| Linux        |
| tabs      | WebSocket  | permissions   (Casbin)   |    VNC    | Windows      |
+-----------+            | sessions, operation log  |---------->| desktops     |
                         +--------------------------+           +--------------+
                                      |  Telnet                        ^
                                      v                                |
                                 +---------+                           |
                                 |  guacd  |---------------------------+
                                 +---------+
```

- **SSH, RDP and VNC** are handled in Go inside Casvisor: the browser talks to Casvisor over a WebSocket and Casvisor talks to the server.
- **Telnet** goes through [guacd](https://guacamole.apache.org/doc/gug/guacamole-architecture.html), the protocol daemon of Apache Guacamole, which Casvisor talks to on port 4822.
- Users, groups and sign-in live in Casdoor. Assets, permissions, sessions and the operation log live in Casvisor's own MySQL database.

## What it is for

| You want to | Read |
| --- | --- |
| Give a contractor SSH to two servers for a week, and nothing else | [Permissions](../access-control/permissions.md) |
| Let the whole ops group reach every Linux server, but only from the office network | [Permissions](../access-control/permissions.md) |
| Stop people from copying files or text out of a Windows desktop | [Permissions](../access-control/permissions.md), [Protocols](../assets/protocols.md) |
| Keep the root password of a server away from the people who use it | [Assets](../assets/assets.md) |
| See who is connected right now, and kick someone off | [Sessions](../audit/sessions.md) |
| Find out who changed a permission and when | [Operation logs](../audit/operation-logs.md) |

## What it does not do yet

Casvisor is being rebuilt as a full bastion host, and a few things a bastion host is expected to have are still on the [roadmap](../more/roadmap.md): connecting with your own `ssh`, `scp` or SFTP client, session recording and playback, command logging and blocking, an encrypted credential vault with SSH keys, and database and Kubernetes access. The pages of this manual describe what is in the current code, and say so where a setting has no effect yet.

## Next

[Run it with Docker](./quickstart.md), then [connect it to your Casdoor](./casdoor.md).
