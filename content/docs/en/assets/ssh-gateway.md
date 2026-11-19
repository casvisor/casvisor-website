---
title: "SSH gateway"
seoTitle: "Casvisor SSH gateway for ssh, scp and VS Code"
description: "Reach SSH assets through Casvisor with your own ssh, scp, sftp, rsync, Xshell or VS Code Remote, and RDP, VNC, Telnet and database assets with mstsc or other clients through port forwarding: sign in with a registered public key, name the asset and the account in the username, and keep the same permissions, command rules and session list as the web terminal."
---

Besides the web terminal, Casvisor can accept SSH connections itself, so people reach SSH assets with the tools they already use: `ssh`, `scp`, `sftp`, `rsync`, Xshell, or VS Code Remote. They sign in to the gateway with a public key they registered in Casvisor; Casvisor then logs in to the asset with the asset's own account, or one of its [system accounts](./accounts.md). The same [permissions](../access-control/permissions.md), [command rules](../audit/commands.md) and [session list](../audit/sessions.md) apply as in the browser. For RDP, VNC, Telnet, MySQL and PostgreSQL assets it [forwards a port](#port-forwarding-to-other-assets), so mstsc and other clients can be used too.

## Turning it on

The gateway listens on the port in `sshGatewayPort`:

- In `conf/app.conf` it is empty, which leaves the gateway off.
- The Docker images set the environment variable `sshGatewayPort=2222`, so the gateway is on in a container. Publish the port with `-p 2222:2222`. To turn it off, pass an empty value: `-e sshGatewayPort=`.
- With `isDemoMode = true` the gateway stays off whatever the port.

`sshGatewayHost` is the host name shown to users in the commands they copy. Leave it empty to use the host name they opened Casvisor at, or set it when SSH is reached at a different name, for example `ssh.example.com`. See [Configuration](../operations/configuration.md#connections).

On first start the gateway creates its own Ed25519 host key and keeps it in the database, encrypted with `credentialKey` when that is set, so the key survives replacing the container and is the same on every Casvisor sharing the database. Its SHA-256 fingerprint is in the log line `SSH gateway listening on port 2222` and on the **SSH keys** page; compare it with what `ssh` shows on the first connection.

The gateway is plain SSH on its own TCP port and does not pass through the HTTPS reverse proxy. See [Behind a reverse proxy](../operations/reverse-proxy.md#the-ssh-gateway).

## Registering a public key

The gateway only accepts public keys. There is no password sign-in, so it never sees the password of a Casvisor or Casdoor account, and the MFA of the web sign-in does not apply to it.

1. If you have no key yet, create one with `ssh-keygen -t ed25519`.
2. In Casvisor, open **SSH keys** (`/ssh-keys`), click **Add SSH key**, and paste the content of `~/.ssh/id_ed25519.pub`.

Every user can manage their own keys there; administrators are not needed. A key can belong to only one user. The page lists each key's fingerprint and when it was last used, and deleting a key stops it from signing in at once.

At every connection the gateway reads the user again, from the built-in accounts or from Casdoor: a user who is forbidden, disabled or deleted, or who is not in `allowedUsers`, is refused even with a registered key. Their groups and administrator flag are also read fresh, rather than from an earlier web sign-in.

## Connecting

The username tells the gateway which asset to open:

| Command | Opens |
| --- | --- |
| `ssh -p 2222 web-01@casvisor.example.com` | The asset `web-01` in your own organization |
| `ssh -p 2222 alice@web-01@casvisor.example.com` | The same, with your Casvisor user name in front. It has to be the owner of the key. |
| `ssh -p 2222 alice@deploy@web-01@casvisor.example.com` | The asset `web-01` as its account `deploy`, see [Choosing the account](#choosing-the-account) |
| `ssh -p 2222 other-org/web-01@casvisor.example.com` | An asset of another organization. Only users of Casdoor's `built-in` organization can reach those. |
| `ssh -p 2222 alice@casvisor.example.com` | With your own user name and no asset: a menu of the SSH assets you may connect to |
| `ssh -p 2222 -N -L 13389:win-01:3389 alice@casvisor.example.com` | No shell: forwards `localhost:13389` to the asset `win-01`, see [Port forwarding to other assets](#port-forwarding-to-other-assets) |

The menu lists one line for every asset and account you may connect as, with its number, the asset's name, the account, the address and the display name. Type a number, an asset name, or `<account>@<asset>` to connect, or `q` to quit. It is meant for tools such as Xshell that save one host and one user name.

On **Assets**, SSH assets have a **Copy SSH command** button that copies the right command, with the port and host filled in, and the account when you may not use the asset's own.

Logging in works for SSH assets only, and only as an account Casvisor holds the username of: the gateway logs in to the asset with the stored account, its private key or password, and cannot ask for one. An asset without a username is refused with a message to ask the administrator. The asset's host key is pinned as in the web terminal; see [Protocols](./protocols.md#ssh).

### Choosing the account

An asset can have [system accounts](./accounts.md) besides its own, and a [permission](../access-control/permissions.md#accounts) says which of them you may use. Name the account between your user name and the asset: `alice@deploy@web-01`. Your user name is required in this form, since `deploy@web-01` would be read as the user `deploy`.

Without an account in the username, the gateway picks it:

- the asset's own account, if you may use it;
- otherwise, the one system account you may use;
- if you may use several system accounts but not the asset's own, it refuses and lists them: *choose the account to connect to the asset: web-01 as with "ssh -p <port> alice@<account>@web-01@<host>": deploy, readonly*.

The actions you hold through the gateway, such as Upload, Download and Forward, are the ones the permissions give for the account you connected as. The session list shows the account.

Instead of typing the port every time, put the gateway in `~/.ssh/config`:

```text
Host web-01
    HostName casvisor.example.com
    Port 2222
    User web-01
```

Then `ssh web-01`, `scp file web-01:` and VS Code Remote all work with the name `web-01`.

If the connection is refused after the key has been accepted, the reason is printed as `casvisor: ...`, for example *you have no permission to connect to the asset: web-01*.

## What works through it

| Use | Needs |
| --- | --- |
| Interactive shell (`ssh`) | Connect |
| Commands (`ssh web-01 uptime`) with their exit status, and a shell without a terminal (`ssh -T`) | Connect, Upload and Download |
| `sftp`, and `scp` in OpenSSH 9.0 and later, which uses SFTP | Connect, and Upload to write or Download to read |
| `scp -O` (the old scp protocol) | Connect, and Upload or Download depending on the direction |
| `rsync` over SSH | Connect, and Upload or Download depending on the direction |
| Local port forwarding (`ssh -L`) and Unix socket forwarding | Connect and Forward |
| VS Code Remote, which runs its server with a command and talks to it over a forwarded socket | Connect, Upload, Download and Forward |

A command on the `ssh` command line, and a shell without a terminal, pass the client's input and the asset's output through as they are, so a file can be piped in or out (`ssh web-01 'cat backup.tar' > backup.tar`), and no screen shows what a shell without a terminal runs. That is why they need Upload and Download. An interactive shell with a terminal needs only Connect: its commands are checked against the [command rules](../audit/commands.md) and its screen is recorded.

[File transfer](./file-transfer.md) lists which Upload or Download each file operation needs.

Forwarded connections are opened from the asset, as they would be with a direct SSH login, so `ssh -L 5432:localhost:5432` reaches the database on the asset itself.

Always refused: remote port forwarding (`ssh -R`), agent forwarding (`ssh -A`) and X11 forwarding (`ssh -X`).

## Port forwarding to other assets

RDP, VNC, Telnet, MySQL and PostgreSQL assets can be reached with the client you already use too, such as Remote Desktop Connection (mstsc), a VNC viewer, a Telnet client, `mysql`, `psql` or DBeaver: the gateway forwards a port on your machine to the asset.

```shell
ssh -p 2222 -N -L 13389:win-01:3389 alice@casvisor.example.com
```

Leave it running and connect your client to `localhost:13389`. Windows 10 and later come with `ssh`.

- Sign in with your own user name and no asset, as for the menu.
- In `-L`, write the asset's name where a host would go, and the asset's own port. Casvisor connects to the address stored on the asset, through its [network gateway](./network-gateways.md) if it has one. Other ports are refused. An asset of another organization is written `other-org/win-01`.
- It needs Connect and Forward on that asset.
- On **Assets**, assets other than SSH have a **Copy port forwarding command** button with the command filled in. It takes the local port 10000 above the asset's, 13389 for 3389, so that it does not clash with a service on your own machine; any free port works.
- One `ssh` command can carry several `-L` options, for several assets at once.

Unlike a connection from the browser, the bytes pass through as they are. Casvisor does not fill in the asset's account, so you log in to the asset with an account you know. The connection is not recorded or checked against command rules, SQL statements included, and the Copy, Paste, Upload and Download actions do not limit it. That is why it takes the Forward action, which administrators give only to the people who should have it.

## Sessions, commands and the audit log

One SSH connection through the gateway is one [session](../audit/sessions.md), however many shells, transfers and forwards it carries. Its user agent is the client's SSH version, such as `SSH-2.0-OpenSSH_9.6`. Administrators can stop it like any other session, and it is cut off when the permission that allows it is revoked. Interactive shells are [recorded](../audit/recordings.md) and can be watched live; a connection that only runs a command, transfers files or forwards ports has no recording.

A [port forward to another asset](#port-forwarding-to-other-assets) is a session of its own, one for each asset, with the mode `tunnel`, for as long as the `ssh` command runs, however many connections the client opens through it. Administrators can stop it like any other session, which disconnects the `ssh` command, and it is cut off as soon as Connect or Forward on the asset is taken away.

Commands are recorded and checked against the [command rules](../audit/commands.md): commands typed in an interactive shell as in the web terminal, and commands given on the `ssh` command line as they were sent. The connection to the asset, each new forwarding destination, the first connection forwarded to another asset, and every file read or written over SFTP, along with new folders, renames, removals and links, go into the [operation log](../audit/operation-logs.md#ssh-and-file-events).
