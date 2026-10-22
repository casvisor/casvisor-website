---
title: "Permissions"
description: "A permission gives users or Casdoor groups a set of actions on assets or asset tags, optionally only from certain IP addresses and only inside a time window. Casvisor evaluates permissions with Casbin on every connection."
---

A **permission** says: these people may do these things on these assets, from these addresses, during this time. Users who are not [administrators](./users-and-admins.md) can only reach an asset when a permission says so.

Administrators manage permissions under **Permissions**.

## Fields

| Field | Meaning |
| --- | --- |
| Organization, Name | Like assets, a permission belongs to one Casdoor organization and applies to its users and assets only. |
| Users | Users by name. `*` means every user of the organization. |
| Groups | Casdoor groups. Every member is covered. |
| Assets | Assets by name. `*` means every asset of the organization. |
| Asset tags | Every asset whose **Tag** is one of these, including assets tagged later. |
| Actions | Any of `Connect`, `Copy`, `Paste`, `Upload`, `Download`, `Forward`. |
| Client IPs | Addresses or CIDR ranges the user must connect from, such as `10.0.0.0/8` or `203.0.113.7`. Empty means from anywhere. |
| Start time, End time | The window in which the permission counts. Either can be empty, meaning no limit on that side. |
| Enabled | Off means the permission counts for nothing, without deleting it. |

A permission covers everyone in **Users** and everyone in **Groups**, for every asset in **Assets** and every asset with a tag in **Asset tags**.

## The actions

| Action | What it allows |
| --- | --- |
| Connect | Seeing the asset in the workbench and opening a session to it, in the browser or through the [SSH gateway](../assets/ssh-gateway.md). Without it, the other actions give nothing. |
| Copy | Text from the remote clipboard reaching the user's browser. |
| Paste | Text from the user's clipboard reaching the remote side. |
| Upload | Sending files to an SSH asset, and creating, renaming and deleting files there, in the file panel or over SFTP, `scp` and `rsync`. See [File transfer](../assets/file-transfer.md). |
| Download | Fetching files from an SSH asset, in the file panel or over SFTP, `scp` and `rsync`. Upload or Download is also needed to browse the files at all. |
| Forward | Port forwarding through the SSH gateway (`ssh -L`), which VS Code Remote needs. |

[Protocols](../assets/protocols.md#ssh) lists where Copy and Paste are enforced: by guacd for Telnet and by the web client for VNC. SSH does not restrict them yet, and RDP has no clipboard yet.

## How permissions combine

Permissions only ever allow. A user may do an action on an asset when **any** enabled permission inside its time window covers that user (by name, by `*` or by group), that asset (by name, by `*` or by tag), that action, and the address they connect from. There is no deny rule; to take something away, edit or turn off the permission that gives it.

Some examples:

| Goal | Users / Groups | Assets / Asset tags | Actions | Client IPs | Time |
| --- | --- | --- | --- | --- | --- |
| The ops team on all Linux servers, from the office | group `ops` | tag `linux` | Connect, Copy, Paste | `198.51.100.0/24` | |
| Developers with VS Code Remote and file transfer on the test servers | group `dev` | tag `test` | Connect, Upload, Download, Forward | | |
| A contractor on two servers for a week, no clipboard | user `alice` | `web-01`, `web-02` | Connect | | 2026-11-01 to 2026-11-08 |
| Everyone on the jump desktop | `*` | `jump-desktop` | Connect, Paste | | |

## When it is checked

Casvisor checks permissions when it lists the assets of a user's workbench, when a session starts, again when the session's WebSocket opens, and when the SSH gateway picks an asset. File operations are checked one by one. Changes therefore apply to the next connection straight away.

Open sessions are checked again too: right after a permission or an asset is edited or deleted, and every 30 seconds, which is how a permission that reaches its **End time** takes effect. A session that is no longer allowed is disconnected; see [Disconnected when the permission goes](../audit/sessions.md#disconnected-when-the-permission-goes).

Group membership is read when the user signs in; see [When changes in Casdoor take effect](./users-and-admins.md#when-changes-in-casdoor-take-effect).

## The client IP

The address checked against **Client IPs** is the one the connection comes from. When it comes from a loopback or private address, as it does behind a reverse proxy on the same network, Casvisor takes the last entry of `X-Forwarded-For` instead, which is the address your proxy saw. Make sure the proxy sets that header; see [Behind a reverse proxy](../operations/reverse-proxy.md).

For the [SSH gateway](../assets/ssh-gateway.md) there is no such header: the address checked is the one the SSH connection comes from.

## The Casbin model

Casvisor turns the enabled permissions of the organization into a [Casbin](https://casbin.apache.org) policy for each request and enforces it with this model:

```ini
[request_definition]
r = sub, obj, act, ip

[policy_definition]
p = sub, obj, act, ip

[role_definition]
g = _, _
g2 = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && g2(r.obj, p.obj) && r.act == p.act && ipAllowed(r.ip, p.ip)
```

`g` puts the user into `user:*` and into each of their groups, `g2` puts each asset into `asset:*` and its tag, and `ipAllowed` matches an address against an IP or a CIDR range. Each permission becomes one policy line per user or group, asset or tag, action and address range.

`*` works for **Users** and **Assets**. In **Groups** and **Asset tags** it has no special meaning yet; to cover everyone or everything, use `*` in Users or Assets instead.
