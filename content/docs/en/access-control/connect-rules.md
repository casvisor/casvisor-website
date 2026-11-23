---
title: "Connect rules"
seoTitle: "Casvisor: connect rules for the browser, SSH and SFTP clients, port forwarding and mstsc"
description: "Connect rules allow or reject ways to connect to assets, by user, group, asset, asset tag and account: the browser, SSH clients through the SSH gateway, SFTP, scp and rsync, port forwarding, and Remote Desktop Connection."
---

[Permissions](./permissions.md) decide which assets a user may reach and what they may do there. Connect rules decide **how** they may reach them. For example: contractors only in the browser, where sessions are recorded and the clipboard follows the permission; no port forwarding to production, since forwarded bytes go through as they are; no SFTP to the database servers. The page is for administrators: **Connect rules** (`/connect-rules`).

## Ways to connect

| Method | What it covers |
| --- | --- |
| Browser | The web terminal, VNC and RDP in the browser, the database console, [websites](../assets/websites.md) and the file panel |
| SSH client | A terminal or a command through the [SSH gateway](../assets/ssh-gateway.md): `ssh`, Xshell, VS Code Remote |
| SFTP client, scp and rsync | File transfer through the SSH gateway: `sftp`, WinSCP, FileZilla, `scp` and `rsync` |
| Port forwarding | `ssh -L` through the SSH gateway, and one-time forwarding commands from the [local clients](../assets/local-clients.md) menu |
| Remote Desktop Connection | mstsc through the Remote Desktop Gateway |

## Fields

| Field | Meaning |
| --- | --- |
| Priority | Rules are tried from the smallest priority up, and the first one that matches decides. |
| Action | **Reject** or **Allow**. |
| Methods | The ways to connect the rule covers; every method when empty. |
| Accounts | The [system accounts](../assets/accounts.md) of the assets it covers, such as `root`; every account when empty. |
| Users, Groups | Who it covers; everyone when both are empty. |
| Assets, Asset tags | Which assets it covers; every asset when both are empty. |
| Enabled | Off means the rule is ignored. |

`*` in users, groups, assets, tags or accounts covers all of them. When no rule matches, the connection goes on as far as the permissions allow, so rules can only take ways away, never grant access. To make an exception to a wide Reject rule, put an Allow rule with a smaller priority in front of it, for example **Allow** for the group `ops` at priority 10 and **Reject** for everyone at priority 50.

## Where they apply

A rule is checked whenever a connection starts: opening an asset in the browser, signing in through the SSH gateway and starting a shell, a command, SFTP or a forwarded port, issuing a one-time link or command from the local clients menu, and mstsc reaching the Remote Desktop Gateway. A rejected connection says which rule stopped it, such as *the connect rule: no-forward does not let you connect to the asset: db-01 with port forwarding*. Rules apply to administrators too. Changing a rule affects new connections; open sessions go on.
