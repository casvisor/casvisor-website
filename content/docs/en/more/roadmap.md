---
title: "Roadmap"
description: "What is done and what is being built next in Casvisor: several system accounts with password rotation, access approval, database and Kubernetes access, and syslog forwarding."
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

## Next

1. **Several system accounts per asset, and automatic password changes.** Users pick the account they may use without ever seeing its password, and Casvisor changes the passwords on the assets on a schedule.
2. **Access requests with approval.** Ask for an asset, get it once someone approves, and lose it again automatically when it expires.
3. **Database and Kubernetes access.** MySQL and PostgreSQL proxies with SQL auditing, and Kubernetes.
4. **Syslog forwarding.** Sessions, commands and the operation log sent to syslog and from there to a SIEM.

## Later

- **The rest of RDP**: H.264 and RemoteApp.
- **A gateway for AI agents.** A controlled SSH and MCP entry for coding agents and AI operators, with their commands going through policy, risky ones waiting for a human to approve, and everything recorded.
- **Compliance in China**: the bastion host requirements of MLPS level 3 (等保三级) and the SM2, SM3 and SM4 algorithms.

## Not planned

Managing cloud machines and logging to a blockchain, which older versions of Casvisor did. Both were removed on purpose.
