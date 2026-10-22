---
title: "Roadmap"
description: "What is done and what is being built next in Casvisor: session recording and playback, an out-of-the-box setup with SQLite and a bundled Casdoor, several system accounts with password rotation, access approval, an agent for private networks, database and Kubernetes access, and syslog forwarding."
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

On the master branch, not in a release yet:

- The [SSH gateway](../assets/ssh-gateway.md): `ssh`, `scp`, `sftp`, `rsync` and VS Code Remote through Casvisor, signed in with a public key, under the same permissions as the web terminal, with a new **Forward** action for port forwarding.
- [File transfer](../assets/file-transfer.md) for SSH assets, in a file panel beside the web terminal and over SFTP, allowed by the Upload and Download actions and written to the operation log.
- [Command records and command rules](../audit/commands.md): the commands of SSH sessions read off a virtual screen, and rules that block or flag them.
- [Watching SSH sessions live](../audit/sessions.md#watching-a-session-live), and [disconnecting sessions](../audit/sessions.md#disconnected-when-the-permission-goes) as soon as their permission is revoked or expires.

## Next

1. **Recording and playback.** Every session recorded, SSH and graphical sessions alike, with playback in the browser.
2. **Out of the box.** SQLite by default instead of MySQL, and a setup that brings its own Casdoor with the application already configured, so that one command gives a Casvisor you can sign in to.
3. **Several system accounts per asset, and automatic password changes.** Users pick the account they may use without ever seeing its password, and Casvisor changes the passwords on the assets on a schedule.
4. **Access requests with approval.** Ask for an asset, get it once someone approves, and lose it again automatically when it expires.
5. **An agent for private networks.** A small agent inside a network connects out to Casvisor, so assets that Casvisor cannot reach directly can be reached through it.
6. **Database and Kubernetes access.** MySQL and PostgreSQL proxies with SQL auditing, and Kubernetes.
7. **Syslog forwarding.** Sessions, commands and the operation log sent to syslog and from there to a SIEM.

## Later

- **The rest of RDP, and Telnet in Go**: clipboard, resizing with the window, drive redirection, more graphics codecs and RemoteApp for RDP, then Telnet, so that one binary covers every protocol without guacd.
- **A gateway for AI agents.** A controlled SSH and MCP entry for coding agents and AI operators, with their commands going through policy, risky ones waiting for a human to approve, and everything recorded.
- **Compliance in China**: the bastion host requirements of MLPS level 3 (等保三级) and the SM2, SM3 and SM4 algorithms.

## Not planned

Managing cloud machines and logging to a blockchain, which older versions of Casvisor did. Both were removed on purpose.
