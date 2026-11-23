---
title: "Roadmap"
description: "What is done and what is being built next in Casvisor: done are system accounts with password rotation, access requests, databases, jobs and syslog forwarding; Kubernetes with kubectl and namespace permissions; next are the rest of RDP, a gateway for AI agents, and compliance in China."
---

Casvisor is being rebuilt, in the open, into a complete bastion host. This is the order of work. Progress shows up as commits on [casvisor/casvisor](https://github.com/casvisor/casvisor) and as changes to this manual. Ideas and objections are welcome in [issues](https://github.com/casvisor/casvisor/issues).

## Done

- Narrowed down to a bastion host: the cloud machine manager and the blockchain log are gone (v1.107.0).
- SSH and VNC handled natively in Go, with the VNC password kept on the server (v1.108.0).
- [Permissions](../access-control/permissions.md) on users, groups, assets, asset tags, actions, client IPs and time windows, enforced with Casbin (v1.109.0).
- A new web UI on React, Vite and shadcn/ui.
- RDP handled natively in Go with [gordp](https://github.com/casvisor/gordp), including NLA, with the account filled in on the server (v1.110.0).
- The Casdoor certificate fetched at start, so any Casdoor works (v1.110.0).
- Passwords and SSH private keys stored encrypted, and SSH host keys and RDP certificates pinned on first use (v1.110.0).
- The [SSH gateway](../assets/ssh-gateway.md): `ssh`, `scp`, `sftp`, `rsync` and VS Code Remote through Casvisor, signed in with a public key, under the same permissions as the web terminal, with a new **Forward** action for port forwarding.
- [File transfer](../assets/file-transfer.md) for SSH assets, in a file panel beside the web terminal and over SFTP, allowed by the Upload and Download actions and written to the operation log.
- [Command records and command rules](../audit/commands.md): the commands of SSH sessions read off a virtual screen, and rules that block or flag them.
- [Network gateways](../assets/network-gateways.md) for assets Casvisor cannot reach directly: through an SSH jump host, or through an agent that connects out to Casvisor from inside a private network.
- [Network domains](../assets/network-gateways.md#network-domains): several gateways for one network, sharing the connections by priority and weight, failing over to each other, and checked every minute.
- [Watching sessions live](../audit/sessions.md#watching-a-session-live), and [disconnecting sessions](../audit/sessions.md#disconnected-when-the-permission-goes) as soon as their permission is revoked or expires.
- [Patch management](../assets/patches.md) for SSH assets: scanning for system updates, installing them and restarting, on Windows and Linux.
- Out of the box: SQLite by default instead of MySQL, and [built-in accounts](../access-control/users-and-admins.md#built-in-accounts) when no Casdoor is configured, so that one `docker run` gives a Casvisor you can sign in to.
- RDP: the clipboard, resizing with the window, [file transfer](../assets/file-transfer.md#rdp) through a redirected drive, the graphics pipeline with ClearCodec and RemoteFX Progressive, sharp text on high-DPI screens, the remote cursor, and Windows 11 and FreeRDP-based servers.
- Telnet handled natively in Go, with command records and rules, so that one binary covers every protocol.
- [Recording and playback](../audit/recordings.md) of SSH, Telnet, VNC and RDP sessions in the browser, with asciicast download for terminals, and live view of all four protocols.
- [System accounts](../assets/accounts.md): several accounts per asset, with permissions naming which one a user may connect as, and the passwords changed by hand or on a schedule.
- [Access requests](../access-control/access-requests.md): users ask for assets for a while, administrators approve, narrow, reject or revoke, and an approved request ends by itself.
- [Two-factor sign-in](../access-control/users-and-admins.md#two-factor-sign-in) for the built-in accounts, with codes from an authenticator app.
- [MySQL and PostgreSQL](../assets/databases.md) in a SQL console in the browser, with every statement recorded and checked against command rules.
- [SQL Server, Oracle, Redis and MongoDB](../assets/databases.md) in the same console: SQL Server batches between `GO` lines, Oracle PL/SQL blocks, Redis commands and MongoDB shell statements, recorded and checked against command rules, with the public key of a database server pinned on first use.
- [Login rules](../access-control/login-rules.md): allowing, rejecting or holding sign-ins for review by user, group, client IP, weekday and time of day, on the web and through the SSH gateway, and requiring two-step verification.
- [Local clients](../assets/local-clients.md): Xshell, WinSCP and terminals opened from the asset list with one-time links, and RDP assets in Remote Desktop Connection (mstsc) through a Remote Desktop Gateway built into Casvisor.
- mstsc signed in to Windows with the stored password, which users never see, and [Casvisor Launcher](../assets/local-clients.md#casvisor-launcher) for Windows, Linux and macOS, which opens `casvisor://` links in Xshell, SecureCRT, PuTTY, WinSCP, FileZilla, mstsc, mysql, psql or DBeaver.
- [Jobs](../assets/jobs.md): commands, scripts and file transfers on many SSH assets at once.
- [Ansible playbooks](../assets/jobs.md#ansible-playbooks) as jobs, run by Casvisor itself over SSH without installing Ansible, with command rules, review and recording on every task.
- [CSV and Excel export and syslog forwarding](../audit/export.md) of sessions, commands and the operation log, as RFC 5424 or CEF.
- [Account templates and account risks](../assets/accounts.md#account-templates): one account for many assets, a daily scan for weak, old and reused passwords and unmanaged accounts, and fixing them by changing the password, managing or locking the account.
- Webhooks for finished jobs and missed schedule runs.
- [Account backups](../assets/accounts.md#account-backups): the passwords and private keys in an AES-256 zip file, downloaded or emailed on a schedule, and restored with a preview.
- [Platforms](../assets/platforms.md): Linux, Unix, macOS, Windows, Cisco IOS, Huawei VRP, H3C Comware, Juniper JunOS, the databases, Kubernetes and websites built in and copied to change, each with its ports, terminal charset, elevation by sudo, su or enable, and password rules; passwords changed and accounts pushed on network devices through their CLI and in MySQL, MariaDB, PostgreSQL, SQL Server, Oracle, Redis and MongoDB, whose accounts the risk scan reads too.
- [Email notifications](../audit/notifications.md#email): webhooks of the Email type, through your SMTP server, and an event for new account risks.
- [Connect rules](../access-control/connect-rules.md): the browser, SSH and SFTP clients, port forwarding and Remote Desktop Connection allowed or rejected by user, asset and account.
- [Job schedules](../assets/jobs.md#job-schedules): jobs run on cron schedules in any time zone.
- [Session sharing](../audit/sessions.md#sharing-a-session): a user shares a session with colleagues through a link and a code, to watch it or type in it too.
- [Cloud accounts](../assets/cloud-accounts.md): the servers of Alibaba Cloud, AWS, Tencent Cloud, Azure, Google Cloud and Huawei Cloud accounts synced as assets, with a preview and scheduled syncs.
- [Database clients](../assets/local-clients.md#database-clients): DBeaver, Navicat, DataGrip, `mysql` and `psql` reach MySQL and PostgreSQL assets through a database proxy built into Casvisor, signed in with a database token, with every statement checked against command rules and recorded; and [ClickHouse and Dameng (DM8)](../assets/databases.md#clickhouse) in the console.
- [Command review](../audit/commands.md#review): commands that match a Review rule wait for another administrator to approve them, in the terminal, the SSH gateway, the database console, jobs and websites.
- [Audit reports](../audit/reports.md): sign-ins, sessions, commands, file transfers, approvals, account changes and asset and permission changes of a period, printed to PDF, exported to Excel or emailed on a schedule; and [Excel import and export](../assets/assets.md#import-and-export) of assets and the audit lists.
- [Casvisor's browser](../assets/websites.md#casvisors-browser): websites opened in a Chrome on the server that signs in with a password the user never sees, reaches only that website, keeps the clipboard, uploads and downloads to the permission, and records the screen.

- [Kubernetes](../assets/kubernetes.md): shells, logs and file transfer for containers in the browser, kubectl through Casvisor with kubeconfigs it issues, and permissions by namespace and read-only.

## Next

1. **The rest of RDP**: H.264 and RemoteApp, for opening client programs such as Navicat or SQL Server Management Studio on a Windows server with the account filled in.

## Later

- **A gateway for AI agents.** A controlled SSH and MCP entry for coding agents and AI operators, with their commands going through policy, risky ones waiting for a human to approve, and everything recorded.
- **Compliance in China**: the bastion host requirements of MLPS level 3 (等保三级) and the SM2, SM3 and SM4 algorithms.

## Not planned

Managing cloud machines and logging to a blockchain, which older versions of Casvisor did. Both were removed on purpose.
