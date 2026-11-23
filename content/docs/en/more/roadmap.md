---
title: "Roadmap"
description: "What is done and what is being built next in Casvisor: done are system accounts with password rotation, access requests, databases, jobs and syslog forwarding; next are Kubernetes access, the rest of RDP, a gateway for AI agents, and compliance in China."
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
- [Watching sessions live](../audit/sessions.md#watching-a-session-live), and [disconnecting sessions](../audit/sessions.md#disconnected-when-the-permission-goes) as soon as their permission is revoked or expires.
- [Patch management](../assets/patches.md) for SSH assets: scanning for system updates, installing them and restarting, on Windows and Linux.
- Out of the box: SQLite by default instead of MySQL, and [built-in accounts](../access-control/users-and-admins.md#built-in-accounts) when no Casdoor is configured, so that one `docker run` gives a Casvisor you can sign in to.
- RDP: the clipboard, resizing with the window, [file transfer](../assets/file-transfer.md#rdp) through a redirected drive, the graphics pipeline with ClearCodec and RemoteFX Progressive, sharp text on high-DPI screens, the remote cursor, and Windows 11 and FreeRDP-based servers.
- Telnet handled natively in Go, with command records and rules, so that one binary covers every protocol.
- [Recording and playback](../audit/recordings.md) of SSH, Telnet, VNC and RDP sessions in the browser, with asciicast download for terminals, and live view of all four protocols.
- [System accounts](../assets/accounts.md): several accounts per asset, with permissions naming which one a user may connect as, and the passwords changed on SSH assets by hand or on a schedule.
- [Access requests](../access-control/access-requests.md): users ask for assets for a while, administrators approve, narrow, reject or revoke, and an approved request ends by itself.
- [Two-factor sign-in](../access-control/users-and-admins.md#two-factor-sign-in) for the built-in accounts, with codes from an authenticator app.
- [MySQL and PostgreSQL](../assets/databases.md) in a SQL console in the browser, with every statement recorded and checked against command rules.
- [SQL Server, Oracle, Redis and MongoDB](../assets/databases.md) in the same console: SQL Server batches between `GO` lines, Oracle PL/SQL blocks, Redis commands and MongoDB shell statements, recorded and checked against command rules, with the public key of a database server pinned on first use.
- [Login rules](../access-control/login-rules.md): allowing, rejecting or holding sign-ins for review by user, group, client IP, weekday and time of day, on the web and through the SSH gateway, and requiring two-step verification.
- [Local clients](../assets/local-clients.md): Xshell, WinSCP and terminals opened from the asset list with one-time links, and RDP assets in Remote Desktop Connection (mstsc) through a Remote Desktop Gateway built into Casvisor.
- [Jobs](../assets/jobs.md): commands, scripts and file transfers on many SSH assets at once.
- [CSV export and syslog forwarding](../audit/export.md) of sessions, commands and the operation log, as RFC 5424 or CEF.
- [Account templates and account risks](../assets/accounts.md#account-templates): one account for many assets, a daily scan for weak, old and reused passwords and unmanaged accounts, and fixing them by changing the password, managing or locking the account.
- Webhooks for finished jobs and missed schedule runs.
- [Connect rules](../access-control/connect-rules.md): the browser, SSH and SFTP clients, port forwarding and Remote Desktop Connection allowed or rejected by user, asset and account.
- [Job schedules](../assets/jobs.md#job-schedules): jobs run on cron schedules in any time zone.
- [Session sharing](../audit/sessions.md#sharing-a-session): a user shares a session with colleagues through a link and a code, to watch it or type in it too.
- [Cloud accounts](../assets/cloud-accounts.md): the servers of Alibaba Cloud, AWS, Tencent Cloud, Azure and Google Cloud accounts synced as assets, with a preview and scheduled syncs.
- [Command review](../audit/commands.md#review): commands that match a Review rule wait for another administrator to approve them, in the terminal, the SSH gateway, the database console, jobs and websites.

## Next

1. **Kubernetes access.** Kubernetes clusters reached through Casvisor, under the same permissions and audit as the other assets.

## Later

- **The rest of RDP**: H.264 and RemoteApp.
- **A gateway for AI agents.** A controlled SSH and MCP entry for coding agents and AI operators, with their commands going through policy, risky ones waiting for a human to approve, and everything recorded.
- **Compliance in China**: the bastion host requirements of MLPS level 3 (等保三级) and the SM2, SM3 and SM4 algorithms.

## Not planned

Managing cloud machines and logging to a blockchain, which older versions of Casvisor did. Both were removed on purpose.
