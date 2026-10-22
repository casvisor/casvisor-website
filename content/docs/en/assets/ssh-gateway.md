---
title: "SSH gateway"
description: "Reach SSH assets through Casvisor with your own ssh, scp, sftp, rsync, Xshell or VS Code Remote: sign in with a registered public key, name the asset in the username, and keep the same permissions, command rules and session list as the web terminal."
---

Besides the web terminal, Casvisor can accept SSH connections itself, so people reach SSH assets with the tools they already use: `ssh`, `scp`, `sftp`, `rsync`, Xshell, or VS Code Remote. They sign in to the gateway with a public key they registered in Casvisor; Casvisor then logs in to the asset with the asset's own account. The same [permissions](../access-control/permissions.md), [command rules](../audit/commands.md) and [session list](../audit/sessions.md) apply as in the browser.

The SSH gateway is on the master branch and not in a release yet: v1.110.0 and its Docker images do not have it.

## Turning it on

The gateway listens on the port in `sshGatewayPort`:

- In `conf/app.conf` it is empty, which leaves the gateway off.
- The Docker images set the environment variable `sshGatewayPort=2222`, so the gateway is on in a container. Publish the port with `-p 2222:2222`. To turn it off, pass an empty value: `-e sshGatewayPort=`.
- With `isDemoMode = true` the gateway stays off whatever the port.

`sshGatewayHost` is the host name shown to users in the commands they copy. Leave it empty to use the host name they opened Casvisor at, or set it when SSH is reached at a different name, for example `ssh.example.com`. See [Configuration](../operations/configuration.md#connections).

On first start the gateway creates its own Ed25519 host key and keeps it in the database, encrypted with `credentialKey` when that is set, so the key survives replacing the container and is the same on every Casvisor sharing the database. Its SHA-256 fingerprint is in the log line `SSH gateway listening on port 2222` and on the **SSH keys** page; compare it with what `ssh` shows on the first connection.

The gateway is plain SSH on its own TCP port and does not pass through the HTTPS reverse proxy. See [Behind a reverse proxy](../operations/reverse-proxy.md#the-ssh-gateway).

## Registering a public key

The gateway only accepts public keys. There is no password sign-in, so it never sees a Casdoor password, and the MFA of the web sign-in does not apply to it.

1. If you have no key yet, create one with `ssh-keygen -t ed25519`.
2. In Casvisor, open **SSH keys** (`/ssh-keys`), click **Add SSH key**, and paste the content of `~/.ssh/id_ed25519.pub`.

Every user can manage their own keys there; administrators are not needed. A key can belong to only one user. The page lists each key's fingerprint and when it was last used, and deleting a key stops it from signing in at once.

At every connection the gateway reads the user from Casdoor again: a user who is disabled or deleted in Casdoor, or who is not in `allowedUsers`, is refused even with a registered key. Their groups and administrator flag are also read fresh, rather than from an earlier web sign-in.

## Connecting

The username tells the gateway which asset to open:

| Command | Opens |
| --- | --- |
| `ssh -p 2222 web-01@casvisor.example.com` | The asset `web-01` in your own organization |
| `ssh -p 2222 alice@web-01@casvisor.example.com` | The same, with your Casvisor user name in front. It has to be the owner of the key. |
| `ssh -p 2222 other-org/web-01@casvisor.example.com` | An asset of another organization. Only users of Casdoor's `built-in` organization can reach those. |
| `ssh -p 2222 alice@casvisor.example.com` | With your own user name and no asset: a menu of the SSH assets you may connect to |

The menu lists the assets by number, name, address and display name. Type a number or a name to connect, or `q` to quit. It is meant for tools such as Xshell that save one host and one user name.

On **Assets**, SSH assets have a **Copy SSH command** button that copies the right command, with the port and host filled in.

Only SSH assets can be reached, and only ones with a stored **Username**: the gateway logs in to the asset with the stored account, its private key or password, and cannot ask for one. An asset without a username is refused with a message to ask the administrator. The asset's host key is pinned as in the web terminal; see [Protocols](./protocols.md#ssh).

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
| Interactive shell (`ssh`), commands (`ssh web-01 uptime`) with their exit status | Connect |
| `sftp`, and `scp` in OpenSSH 9.0 and later, which uses SFTP | Connect, and Upload to write or Download to read |
| `scp -O` (the old scp protocol) | Connect, and Upload or Download depending on the direction |
| `rsync` over SSH | Connect, and Upload or Download depending on the direction |
| Local port forwarding (`ssh -L`) and Unix socket forwarding, which VS Code Remote uses | Connect and Forward |

[File transfer](./file-transfer.md) lists which Upload or Download each file operation needs.

Forwarded connections are opened from the asset, as they would be with a direct SSH login, so `ssh -L 5432:localhost:5432` reaches the database on the asset itself.

Always refused: remote port forwarding (`ssh -R`), agent forwarding (`ssh -A`) and X11 forwarding (`ssh -X`).

## Sessions, commands and the audit log

One SSH connection through the gateway is one [session](../audit/sessions.md), however many shells, transfers and forwards it carries. Its user agent is the client's SSH version, such as `SSH-2.0-OpenSSH_9.6`. Administrators can stop it like any other session, and it is cut off when the permission that allows it is revoked.

Commands are recorded and checked against the [command rules](../audit/commands.md): commands typed in an interactive shell as in the web terminal, and commands given on the `ssh` command line as they were sent. The connection to the asset, each new forwarding destination, and every file read or written over SFTP, along with new folders, renames, removals and links, go into the [operation log](../audit/operation-logs.md#ssh-and-file-events).
