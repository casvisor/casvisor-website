---
title: "Roadmap"
description: "What is being built next in Casvisor: certificates from configuration, an encrypted credential vault, connections from native SSH clients, session recording and playback, then database, Kubernetes and access requests."
---

Casvisor is being rebuilt, in the open, into a complete bastion host. This is the order of work. Progress shows up as commits on [casvisor/casvisor](https://github.com/casvisor/casvisor) and as changes to this manual. Ideas and objections are welcome in [issues](https://github.com/casvisor/casvisor/issues).

## Done

- Narrowed down to a bastion host: the cloud machine manager and the blockchain log are gone (v1.107.0).
- SSH and VNC handled natively in Go, with the VNC password kept on the server (v1.108.0).
- [Permissions](../access-control/permissions.md) on users, groups, assets, asset tags, actions, client IPs and time windows, enforced with Casbin (v1.109.0).
- A new web UI on React, Vite and shadcn/ui.
- RDP handled natively in Go with [gordp](https://github.com/casvisor/gordp), including NLA, with the account filled in on the server.

## Next: a bastion host that holds up in production

1. **The Casdoor certificate from configuration**, so the Docker images work with any Casdoor instead of only with the old built-in key. See [Connect Casdoor](../getting-started/casdoor.md#about-the-certificate).
2. **Credential vault.** Passwords and SSH private keys stored encrypted, several accounts per asset, and a permission naming which account a user may use. Users never see any of them.
3. **Native SSH gateway.** Connect through Casvisor with your own `ssh`, `scp`, SFTP client or VS Code Remote, as `ssh user@asset@casvisor`, under the same permissions as the web terminal. Commands are logged, and dangerous ones can be blocked.
4. **Recording and playback.** Every session recorded, SSH as asciinema casts and graphical sessions as Guacamole recordings, with playback in the browser. Administrators can watch a session live. File transfers are logged.
5. **Simpler deployment.** One binary with SQLite by default, a compose file that brings guacd, a setup page on first start, and no default pointing at the public demo.
6. **The rest of RDP, and Telnet in Go**: clipboard, resizing with the window, drive redirection and more graphics codecs for RDP, then Telnet, so that one binary covers every protocol without guacd.

## Then: what other bastion hosts charge for

- MySQL and PostgreSQL proxies with SQL auditing.
- Kubernetes access.
- Access requests: ask for an asset, get approval, lose it again automatically when it expires.
- Automatic password rotation on the assets.
- RemoteApp, publishing single Windows programs.
- Importing assets from cloud accounts.

## Later

- **A gateway for AI agents.** A controlled SSH and MCP entry for coding agents and AI operators, with their commands going through policy, risky ones waiting for a human to approve, and everything recorded.
- **Compliance in China**: the bastion host requirements of MLPS level 3 (等保三级) and the SM2, SM3 and SM4 algorithms.

## Not planned

Managing cloud machines and logging to a blockchain, which older versions of Casvisor did. Both were removed on purpose.
