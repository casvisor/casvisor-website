---
title: "Local clients"
seoTitle: "Casvisor: open assets in Xshell, WinSCP and mstsc with one-time links"
description: "Open an asset from the asset list in a client on your own machine: SSH clients such as Xshell and SFTP clients such as WinSCP through the SSH gateway, and Remote Desktop Connection (mstsc) through Casvisor's Remote Desktop Gateway, with a one-time token instead of a registered public key."
---

Besides the browser, an asset can be opened in a client on your own machine, straight from the asset list. On **Assets**, the **Open in a local client** button of each asset opens a menu of what fits the asset. Every link and command in it carries a one-time token: it works once, within two minutes, and stands for you and the account you would connect as, so no public key has to be [registered](./ssh-gateway.md#registering-a-public-key) first.

| Asset | Menu item | What it does |
| --- | --- | --- |
| SSH | **Open in SSH client** | Opens `ssh://<token>@<host>:<port>`, which Xshell, SecureCRT, Termius and other clients that handle `ssh://` links pick up |
| SSH | **Open in SFTP client** | Opens `sftp://<token>@<host>:<port>` in WinSCP, FileZilla or another client that handles `sftp://` links |
| SSH | **Copy one-time SSH command** | Copies `ssh -p 2222 <token>@casvisor.example.com`, for any terminal |
| RDP | **Open in Remote Desktop Connection (mstsc)** | Downloads a `.rdp` file that mstsc opens, see [Remote Desktop Connection](#remote-desktop-connection) |
| Other | **Copy one-time port forwarding command** | Copies `ssh -p 2222 -N -L 13389:win-01:3389 <token>@casvisor.example.com`, see [Port forwarding to other assets](./ssh-gateway.md#port-forwarding-to-other-assets) |

The menu also keeps the commands for a registered public key, which do not expire. The SSH items need the [SSH gateway](./ssh-gateway.md); the Remote Desktop item needs the web UI to be opened over HTTPS.

## SSH and SFTP clients

The token is the SSH user name. The client signs in with SSH's `none` method, which every common client tries first, and the gateway takes it to the asset and account the token was issued for, so the client needs no password or key. From there it is the same as signing in with a public key: the permission is checked again, the [login rules](../access-control/login-rules.md) apply, shells are recorded and checked against [command rules](../audit/commands.md), and file transfers follow the Upload and Download actions.

A token used once, or older than two minutes, is refused with `Permission denied`; open the menu again for a new one. A port forwarding token only forwards ports, and only to its own asset: opening a shell with it is refused.

## Remote Desktop Connection

Casvisor has a Remote Desktop Gateway built in, at `/remoteDesktopGateway/` on the address of the web UI. **Open in Remote Desktop Connection (mstsc)** downloads `<asset>.rdp`; open it within two minutes. The file names Casvisor as the gateway (`gatewayhostname`), carries the token as the gateway access token, and fills in the user name of the account. mstsc then reaches the asset through Casvisor, which connects to it through its [network gateway](./network-gateways.md) if it has one.

- It needs **Connect** and **Forward** on the asset.
- mstsc asks for the Windows password itself: Casvisor does not fill in the account's password, so you log in with an account you know.
- The RDP session is encrypted between mstsc and the asset, so Casvisor cannot see inside it. It is listed as a [session](../audit/sessions.md) with the mode `tunnel`, which administrators can stop and which ends when Forward is taken away, and written to the [operation log](../audit/operation-logs.md) as `rdp-gateway`, but it is not recorded or checked against command rules.
- The gateway tells mstsc what to keep out of the session: the clipboard without both Copy and Paste, local drives without both Upload and Download, and always printers, serial ports and plug-and-play devices.
- The file is not signed, so mstsc shows a warning about an unknown publisher before it connects.
- mstsc only uses a gateway over HTTPS with a certificate it trusts, so the item shows only when the web UI is opened over HTTPS. Behind a reverse proxy, the proxy has to pass the gateway's requests on, see [Behind a reverse proxy](../operations/reverse-proxy.md#the-remote-desktop-gateway).

Set `disableRdGateway = true` in `conf/app.conf` to turn the gateway off. It is always off with `isDemoMode = true`.

## Tokens

A token is issued by `POST /api/add-client-token?assetId=<organization>/<name>&kind=<ssh|tunnel|rdp>&account=<account>` for the signed-in user, who must have Connect on the asset as that account, and Forward for `tunnel` and `rdp`. Tokens are kept in memory, so they do not survive a restart, and each one is deleted when it is used.
