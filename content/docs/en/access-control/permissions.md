---
title: "Permissions"
seoTitle: "Casvisor: bastion host permissions with Casbin"
description: "A permission gives users or groups a set of actions on assets or asset tags, as some of the assets' accounts, optionally only from certain IP addresses and only inside a time window. Casvisor evaluates permissions with Casbin on every connection."
---

A **permission** says: these people may do these things on these assets, as these accounts, from these addresses, during this time. Users who are not [administrators](./users-and-admins.md) can only reach an asset when a permission says so.

Administrators manage permissions under **Permissions**.

## Fields

| Field | Meaning |
| --- | --- |
| Organization, Name | Like assets, a permission belongs to one organization and applies to its users and assets only. |
| Users | Users by name. `*` means every user of the organization. |
| Groups | Groups of the [built-in accounts](./users-and-admins.md#built-in-accounts) or of Casdoor. Every member is covered. |
| Assets | Assets by name. `*` means every asset of the organization. |
| Asset tags | Every asset whose **Tag** is one of these, including assets tagged later. |
| Accounts | Which accounts of those assets the users may connect as. Empty means the asset's own account. See [Accounts](#accounts). |
| Actions | Any of `Connect`, `Copy`, `Paste`, `Upload`, `Download`, `Forward`. |
| Client IPs | Addresses or CIDR ranges the user must connect from, such as `10.0.0.0/8` or `203.0.113.7`. Empty means from anywhere. |
| Namespaces | On [Kubernetes assets](../assets/kubernetes.md), the namespaces the permission covers; `*` or empty means all of them. See [Kubernetes namespaces](#kubernetes-namespaces). |
| Read only | On Kubernetes assets, only `get`, `list` and `watch`. |
| Start time, End time | The window in which the permission counts. Either can be empty, meaning no limit on that side. |
| Enabled | Off means the permission counts for nothing, without deleting it. |

A permission covers everyone in **Users** and everyone in **Groups**, for every asset in **Assets** and every asset with a tag in **Asset tags**, as every account in **Accounts**.

Permissions can also be asked for: users send an [access request](./access-requests.md), and approving it adds a permission for them.

## The actions

| Action | What it allows |
| --- | --- |
| Connect | Seeing the asset in the workbench and opening a session to it, in the browser or through the [SSH gateway](../assets/ssh-gateway.md). Without it, the other actions give nothing. |
| Copy | Text from the remote clipboard reaching the user's browser, for RDP and VNC. |
| Paste | Text from the user's clipboard reaching the remote side, for RDP and VNC. |
| Upload | Sending files to an SSH or RDP asset, and creating, renaming and deleting files there, in the file panel, over SFTP, `scp` and `rsync`, or through the drive of an RDP session. See [File transfer](../assets/file-transfer.md). Together with Download, it also allows commands on the `ssh` command line through the [SSH gateway](../assets/ssh-gateway.md#what-works-through-it), since files can be piped through them. |
| Download | Fetching files from an SSH or RDP asset, the same ways. Upload or Download is also needed to browse the files at all. |
| Forward | Port forwarding through the SSH gateway (`ssh -L`), which VS Code Remote needs along with Upload and Download, and [port forwarding to RDP, VNC and Telnet assets](../assets/ssh-gateway.md#port-forwarding-to-other-assets) for mstsc and other clients. Those connections are not recorded. |

Copy, Paste, Upload and Download are all enforced on the server, not only in the browser: for RDP and VNC Casvisor drops the clipboard messages the user may not send or receive, and every file channel checks them itself. They are separate from the [command rules](../audit/commands.md), which only see commands. The SSH and Telnet terminals use the browser's own copy and paste, which Copy and Paste do not restrict; see [Protocols](../assets/protocols.md).

## Kubernetes namespaces

On a [Kubernetes asset](../assets/kubernetes.md), **Namespaces** and **Read only** decide what the user may do in the cluster, in the browser and with kubectl alike. A request in a namespace needs it in the permission; what has no namespace, like nodes or a list across all namespaces, needs `*`; a namespace can be read in its own permission but only changed with `*`. A read-only permission allows `get`, `list` and `watch`, and leaves out shells, file transfers and port forwarding, which create things in the pod. Several permissions add up: a namespace is writable when one of them allows it. They only count with **Connect**, and do nothing on other assets.

| Goal | Namespaces | Read only |
| --- | --- | --- |
| Developers work in their own namespace | `team-a` | Off |
| Support reads every namespace and the nodes, without shells | `*` | On |
| On-call engineers may change `prod`, and read the rest | Two permissions: `prod` off, and `*` on | |

## Accounts

An asset can have [system accounts](../assets/accounts.md) besides its own. **Accounts** says which of them the permission lets users connect as:

| Value | Covers |
| --- | --- |
| `@default`, shown as *The asset's own account* | The account stored on the asset itself. This is what an empty field means. |
| `@same`, shown as *The account named like the user* | The account whose username is the user's Casvisor user name, so `alice` connects as `alice` and `bob` as `bob`, with one permission for both. |
| `*`, shown as *All accounts* | Every account of the asset, its own and every enabled system account. |
| A username, such as `deploy` | The account with that username, whether it is the asset's own account or a system account. |

Several values can be combined. The actions of the permission hold for each account it covers, so one permission can give `readonly` with Upload and Download, and another `root` with Connect alone. When a user connects, the actions are the ones the permissions give for the account they chose.

A system account that is turned off is covered by no permission. Administrators may connect as every account without a permission.

## How permissions combine

Permissions only ever allow. A user may do an action on an asset as an account when **any** enabled permission inside its time window covers that user (by name, by `*` or by group), that asset (by name, by `*` or by tag), that action, that account, and the address they connect from. There is no deny rule; to take something away, edit or turn off the permission that gives it.

Some examples:

| Goal | Users / Groups | Assets / Asset tags | Accounts | Actions | Client IPs | Time |
| --- | --- | --- | --- | --- | --- | --- |
| The ops team on all Linux servers as `root`, from the office | group `ops` | tag `linux` | `root` | Connect, Copy, Paste | `198.51.100.0/24` | |
| Developers with VS Code Remote and file transfer on the test servers, each as their own account | group `dev` | tag `test` | `@same` | Connect, Upload, Download, Forward | | |
| A contractor on two servers for a week, no clipboard | user `alice` | `web-01`, `web-02` | | Connect | | 2026-11-01 to 2026-11-08 |
| Everyone on the jump desktop, able to paste in but not copy out | `*` | `jump-desktop` | | Connect, Paste | | |

## When it is checked

Casvisor checks permissions when it lists the assets of a user's workbench, when a session starts, again when the session's WebSocket opens, and when the SSH gateway picks an asset. File operations are checked one by one. Changes therefore apply to the next connection straight away.

Open sessions are checked again too: right after a permission, an asset or a [system account](../assets/accounts.md) is edited or deleted, or an [access request](./access-requests.md) is revoked, and every 30 seconds, which is how a permission that reaches its **End time** takes effect. A session that is no longer allowed is disconnected; see [Disconnected when the permission goes](../audit/sessions.md#disconnected-when-the-permission-goes).

With the built-in accounts, a change of groups counts at once. With Casdoor, group membership is read when the user signs in; see [When changes in Casdoor take effect](./users-and-admins.md#when-changes-in-casdoor-take-effect).

## The client IP

The address checked against **Client IPs** is the one the connection comes from. When it comes from a loopback or private address, as it does behind a reverse proxy on the same network, Casvisor takes the last entry of `X-Forwarded-For` instead, which is the address your proxy saw. Make sure the proxy sets that header; see [Behind a reverse proxy](../operations/reverse-proxy.md).

For the [SSH gateway](../assets/ssh-gateway.md) there is no such header: the address checked is the one the SSH connection comes from.

## The Casbin model

Casvisor turns the enabled permissions of the organization into a [Casbin](https://casbin.apache.org) policy for each request and enforces it with this model:

```ini
[request_definition]
r = sub, obj, act, ip, acct

[policy_definition]
p = sub, obj, act, ip, acct

[role_definition]
g = _, _
g2 = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && g2(r.obj, p.obj) && r.act == p.act && ipAllowed(r.ip, p.ip) && accountAllowed(r.acct, p.acct, r.sub)
```

`g` puts the user into `user:*` and into each of their groups, `g2` puts each asset into `asset:*` and its tag, `ipAllowed` matches an address against an IP or a CIDR range, and `accountAllowed` matches the account being used, written `default:<username>` for the asset's own and `account:<username>` for a system account, against `@default`, `@same`, `*` or a username. Each permission becomes one policy line per user or group, asset or tag, action, address range and account.

`*` works for **Users** and **Assets**. In **Groups** and **Asset tags** it has no special meaning yet; to cover everyone or everything, use `*` in Users or Assets instead.
