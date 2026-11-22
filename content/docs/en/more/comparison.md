---
title: "Comparison and alternatives"
seoTitle: "Casvisor vs JumpServer, Teleport and Warpgate"
description: "How Casvisor compares with JumpServer, Teleport, Warpgate and HashiCorp Boundary: features, licenses, paid editions and gaps."
---

There are several good open-source projects in this space. This page is meant to help you choose, so it says where Casvisor is behind as well as where it differs. It reflects October 2026; check each project's own site for the current state.

| | Casvisor | JumpServer | Teleport | Warpgate |
| --- | --- | --- | --- | --- |
| License | Apache-2.0 | GPL-3.0 | AGPL-3.0 source; community binaries under their own terms | Apache-2.0 |
| Paid edition | None | Enterprise edition | Enterprise edition | None |
| Written in | Go | Python, Go | Go | Rust |
| Browser access | SSH, RDP, VNC, Telnet, MySQL, PostgreSQL, SQL Server, Oracle, Redis, MongoDB | SSH, RDP, VNC, databases, K8s, apps | SSH, RDP (Windows), databases, K8s, apps | SSH, RDP, VNC |
| Native clients (`ssh`, `scp`, database clients) | SSH: `ssh`, `scp`, `sftp`, `rsync`, audited; other protocols through port forwarding, not recorded | Yes | Yes | Yes |
| Session recording | SSH, Telnet, VNC, RDP, played in the browser; database statements listed per session | Yes | Yes | Yes |
| Identity | Built in with TOTP, or Casdoor: SSO, MFA, LDAP, SAML, OAuth, groups | Built in, LDAP, SSO | Built in, SSO | Built in, TOTP, OIDC |
| Access policy | Casbin: users, groups, assets, tags, accounts, actions, IPs, time windows; access requests with approval | RBAC, asset authorizations | RBAC with labels | Roles on targets |

## Open-source bastion host alternatives

Casvisor is not the only choice in this space. These are the projects people compare it with most often.

### If you are looking for a JumpServer alternative

JumpServer is the most complete option, and the established one in China. Some of its connectors, such as the proxies for native RDP and database clients, are part of the enterprise edition. Casvisor stays Apache-2.0, has no paid edition, and does less today.

### If you are looking for a Teleport alternative

Teleport issues short-lived certificates and covers the widest range of infrastructure. Since v16, its community edition binaries are free to use only for companies with fewer than 100 employees and under $10 million a year in revenue. Casvisor keeps permissions in Casbin and records sessions without the certificate infrastructure.

### If you are looking for a Warpgate alternative

Warpgate is a single Rust binary that proxies SSH, HTTPS, Kubernetes, MySQL, PostgreSQL, RDP and VNC transparently, with recording and live view, and no paid edition. Today it does more than Casvisor on the protocol side; Casvisor answers with built-in accounts, Casdoor identity and Casbin policy.

### If you are looking for a Boundary alternative

HashiCorp Boundary archived its open-source repository in October 2026; it continues as HCP Boundary and Boundary Enterprise. Casvisor stays Apache-2.0 and runs on your own servers.

## Where Casvisor differs

- **One binary.** SSH, RDP, VNC, Telnet, the six databases, the SSH gateway, recording and the network gateway agent are all in one Go program, on SQLite by default, with nothing installed on the servers.
- **Identity can be Casdoor's.** Casvisor has its own accounts, but if you already run Casdoor, or want its single sign-on, MFA, LDAP and SAML, Casvisor uses those directly, including Casdoor's groups in permissions, rather than keeping a second user directory.
- **Policy is Casbin's.** Permissions combine users and groups, assets and tags, actions, client IP ranges and time windows, and are evaluated by a model you can read on the [permissions page](../access-control/permissions.md#the-casbin-model).
- **Command rules follow the same scopes as permissions.** A rule applies to users, groups, assets and asset tags, and covers the web terminal and native SSH clients alike, since both go through the same check. See [Commands and command rules](../audit/commands.md).
- **No enterprise edition.** [System accounts](../assets/accounts.md) with password rotation, [access requests](../access-control/access-requests.md), the [database console](../assets/databases.md), [jobs](../assets/jobs.md) and [syslog forwarding](../audit/export.md) are all in the open-source project, and so is what is on the [roadmap](./roadmap.md).

## Where Casvisor is behind

Kubernetes access, which is next on the [roadmap](./roadmap.md). For databases, only the console in the browser is audited: native clients other than SSH go through plain port forwarding, which is not recorded. Passwords are rotated on SSH assets only, and the Copy and Paste actions do not restrict the SSH and Telnet terminals. If you need these today, the projects above have most of them.
