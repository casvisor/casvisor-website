---
title: "Comparison"
description: "How Casvisor compares with other open-source bastion hosts and remote access gateways: JumpServer, Teleport, Warpgate, Apache Guacamole and HashiCorp Boundary, as of October 2026."
---

There are several good open-source projects in this space. This page is meant to help you choose, so it says where Casvisor is behind as well as where it differs. It reflects October 2026; check each project's own site for the current state.

| | Casvisor | JumpServer | Teleport | Warpgate | Apache Guacamole |
| --- | --- | --- | --- | --- | --- |
| License | Apache-2.0 | GPL-3.0 | AGPL-3.0 source; community binaries under their own terms | Apache-2.0 | Apache-2.0 |
| Paid edition | None | Enterprise edition | Enterprise edition | None | None |
| Written in | Go | Python, Go | Go | Rust | C, Java |
| Browser access | SSH, RDP, VNC, Telnet | SSH, RDP, VNC, databases, K8s, apps | SSH, RDP (Windows), databases, K8s, apps | SSH, RDP, VNC | SSH, RDP, VNC, Telnet, K8s |
| Native clients (`ssh`, `scp`, database clients) | Not yet | Yes | Yes | Yes | No |
| Session recording | Not yet | Yes | Yes | Yes | Yes |
| Identity | Casdoor: SSO, MFA, LDAP, SAML, OAuth, groups | Built in, LDAP, SSO | Built in, SSO | Built in, TOTP, OIDC | Built in, extensions for LDAP, SSO |
| Access policy | Casbin: users, groups, assets, tags, actions, IPs, time windows | RBAC, asset authorizations | RBAC with labels | Roles on targets | Connection permissions |

## When to pick which

- **JumpServer** is the most complete option, and the established one in China. Some of its connectors, such as the proxies for native RDP and database clients, are part of the enterprise edition.
- **Teleport** issues short-lived certificates and covers the widest range of infrastructure. Since v16, its community edition binaries are free to use only for companies with fewer than 100 employees and under $10 million a year in revenue.
- **Warpgate** is a single Rust binary that proxies SSH, HTTPS, Kubernetes, MySQL, PostgreSQL, RDP and VNC transparently, with recording and live view, and no paid edition. Today it does more than Casvisor on the protocol side.
- **Apache Guacamole** is a browser remote desktop gateway with its own users and connection permissions. Casvisor uses its daemon, guacd, for Telnet.
- **HashiCorp Boundary** archived its open-source repository in October 2026; it continues as HCP Boundary and Boundary Enterprise.

## Where Casvisor differs

- **Identity is Casdoor's.** If you already run Casdoor, or want its single sign-on, MFA, LDAP and SAML, Casvisor uses those directly, including Casdoor's groups in permissions, rather than keeping a second user directory.
- **Policy is Casbin's.** Permissions combine users and groups, assets and tags, actions, client IP ranges and time windows, and are evaluated by a model you can read on the [permissions page](../access-control/permissions.md#the-casbin-model).
- **No enterprise edition.** What is on the [roadmap](./roadmap.md), including database proxies and access requests, is planned for the open-source project itself.

## Where Casvisor is behind

Native SSH clients, session recording and playback, command logging, and database and Kubernetes access. These are the next items on the [roadmap](./roadmap.md). If you need them today, the projects above have them.
