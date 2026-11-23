---
title: "Platforms"
seoTitle: "Casvisor: platforms for Linux, Windows, network devices and databases"
description: "A platform is a kind of system, such as Linux, Cisco IOS or MySQL: its protocols and default ports, the charset of its terminal, how Casvisor becomes privileged on it, how it changes passwords there, and what its random passwords look like. Casvisor has them built in, and administrators copy and change them."
---

Every [asset](./assets.md) has a **platform**: the kind of system it is, such as Linux, Cisco IOS or MySQL. The platform decides:

- the protocols the asset can use, and the port each one starts with;
- the charset of its terminal;
- how the asset's own account becomes privileged: `sudo`, `su` or `enable`;
- how Casvisor changes the passwords of its [system accounts](./accounts.md#changing-passwords), creates accounts there, and reads the accounts on it for the [account risks](./accounts.md#account-risks);
- the length and the characters of the random passwords Casvisor sets there.

Administrators see the platforms under **Asset management** > **Platforms** (`/platforms`).

## Built-in platforms

| Platform | Protocols | Changes passwords with | Elevation |
| --- | --- | --- | --- |
| Linux | SSH, Telnet, VNC, RDP | A shell script over SSH: `chpasswd`, `useradd -m` | `sudo` |
| Unix | SSH, Telnet | A shell script over SSH: `chpasswd`, or `pw` on FreeBSD | `sudo` |
| macOS | SSH, VNC | A shell script over SSH: `dscl`, `sysadminctl -addUser` | `sudo` |
| Windows | RDP, SSH, VNC, Desktop | PowerShell over the OpenSSH server: `Set-LocalUser`, `New-LocalUser` | None, the account must be an administrator |
| Cisco IOS | SSH, Telnet | The device CLI over SSH | `enable` |
| Huawei VRP | SSH, Telnet | The device CLI over SSH | None, `super` when turned on |
| H3C Comware | SSH, Telnet | The device CLI over SSH | None, `super` when turned on |
| Juniper JunOS | SSH, Telnet | The device CLI over SSH | None |
| MySQL, MariaDB | MySQL | `ALTER USER`, `CREATE USER` | None |
| PostgreSQL | PostgreSQL | `ALTER ROLE ... PASSWORD`, `CREATE ROLE ... LOGIN` | None |
| SQL Server | SQLServer | `ALTER LOGIN` | None |
| Oracle | Oracle | `ALTER USER ... IDENTIFIED BY` | None |
| Redis | Redis | `ACL SETUSER`, or `CONFIG SET requirepass` for the default user | None |
| MongoDB | MongoDB | `updateUser` | None |
| Kubernetes | Kubernetes | Not changed | None |
| Website | Web | Not changed | None |

The built-in platforms can't be changed or deleted. **Copy** one to make a platform of your own in the organization, and change the copy.

## Choosing the platform of an asset

The asset page has a **Platform** field next to **Protocol**. It lists the platforms that have the asset's protocol, and choosing one fills in its port for that protocol. Changing the protocol keeps the platform when it has the new protocol, and otherwise picks the built-in one for it: Linux for SSH, VNC and Telnet (Windows when the asset's OS is Windows), Windows for RDP and Desktop, and the database, Kubernetes or Website platform of the same name. An asset saved without a platform gets that default too, and so did every asset already there when Casvisor got platforms.

An asset can't be saved with a platform that does not have its protocol.

In the [CSV files of assets](./assets.md), the `platform` column holds the platform's name, such as `cisco-ios`, and the `elevationPassword` column the [elevation password](#elevation). An empty `platform` gets the default. The export leaves `elevationPassword` empty, as it does the passwords, and [account backups](./accounts.md#account-backups) fill it in.

## Fields

| Field | Meaning |
| --- | --- |
| Name, Display name | The name assets refer to the platform by, which can't be the name of a built-in one. Renaming a platform renames it in its assets. |
| Category | Host, Network device, Database, Cloud or Web, for the list. |
| Protocols | The protocols of the platform, each with its default port. |
| Charset | How the terminal encodes text. See [Terminal charset](#terminal-charset). |
| Elevation, Elevation command | How the asset's own account becomes privileged. See [Elevation](#elevation). |
| Method | How passwords are changed: `Shell`, `PowerShell`, `CLI`, or the database of the platform. None leaves passwords alone. |
| Change commands, Push commands, Prompt pattern, Error pattern | For the CLI method. See [Network devices](#network-devices). |
| Password length, Characters, Symbols, Excluded characters | The random passwords. See [Password rules](#password-rules). |
| Change passwords, Push accounts, Gather accounts | What Casvisor may do on the assets of the platform. See [What a platform may do](#what-a-platform-may-do). |

A platform that assets use can't be deleted; give them another platform first.

## Terminal charset

**Charset** is UTF-8 unless the systems write another encoding, such as GBK on an older Chinese system or a switch with a Chinese interface. The SSH and Telnet terminals in the browser then turn what the asset sends into UTF-8, and what the user types into the asset's charset, so that the screen, the recordings and the [command records](../audit/commands.md) are readable. The choices are UTF-8, GB18030, GBK, Big5, Shift_JIS, EUC-JP, EUC-KR, ISO-8859-1 and windows-1252. Through the [SSH gateway](./ssh-gateway.md), the user's own SSH client decides the charset.

## Elevation

Casvisor manages the accounts of an asset through the asset's **own account**. When that account is not privileged by itself, the platform's **Elevation** says how it becomes so:

- **sudo** (Linux, Unix, macOS): if the account can run `sudo` without a password, that is used. Otherwise Casvisor runs `sudo -S` with the account's own password, read from stdin and never put on a command line.
- **su**: Casvisor runs the **Elevation command**, such as `su - root`, on a terminal, answers its password prompt with the asset's **Elevation password**, and checks that it is root before going on. The script then goes in as one line on that terminal, with echo off.
- **enable** (network devices): after signing in, Casvisor sends the **Elevation command**, `enable` on Cisco or `super` on Huawei and H3C, and answers its password prompt with the asset's **Elevation password**. A device that is already privileged just shows its prompt again.

The asset page shows **Elevation password** when the platform uses `su` or `enable`. It is kept like the asset's password: encrypted with `credentialKey`, returned as `***`, kept when the asset is saved with `***`, and only kept for the same host, port, username and network gateway.

## Network devices

The CLI method signs in to the device over SSH with the asset's own account, opens a shell, elevates when the platform says so, and sends the **Change commands** one line at a time, or the **Push commands** when it creates an account (the change commands when they are empty). `{username}` and `{password}` are replaced with the account and its new password. After each line Casvisor waits for the **Prompt pattern**, a regular expression of the device's prompt at the end of the output, and on the way:

- answers a pager such as `--More--` or `---- More ----` with a space;
- answers a password prompt with the new password, or with the elevation password after the elevation command;
- answers `[Y/N]` with `y`, and `[confirm]` or a default in brackets such as `Destination filename [startup-config]?` with Enter.

The output of a line that matches the **Error pattern**, such as `% Invalid input detected` on Cisco, stops the change with that output, the passwords in it masked. A line that brings no prompt within 30 seconds stops it too. The built-in commands are:

```text
Cisco IOS          terminal length 0
                   configure terminal
                   username {username} secret {password}
                   end
                   write memory

Huawei VRP         screen-length 0 temporary
                   system-view
                   aaa
                   local-user {username} password irreversible-cipher {password}
                   return
                   save

H3C Comware        screen-length disable
                   system-view
                   local-user {username} class manage
                   password simple {password}
                   return
                   save force

Juniper JunOS      set cli screen-length 0
                   configure
                   set system login user {username} authentication plain-text-password
                   commit and-quit
```

The push commands of Huawei, H3C and Juniper also let the new account use SSH: `service-type ssh` and `privilege level 1` on Huawei, `service-type ssh` and the `network-operator` role on H3C, and the `operator` class on Juniper. Copy the platform to change them for your devices, for example another privilege level, or `copy running-config startup-config` instead of `write memory`.

The CLI method needs an SSH asset; a Telnet asset of the same device has no password changes. Passwords for network devices can't contain spaces, quotes or `?`.

## Password rules

The random passwords Casvisor sets on the assets of a platform have the platform's **Password length**, 8 to 128, and at least one character of each kind turned on: upper case letters, lower case letters, digits, and the **Symbols** given. Letters and digits that are easy to confuse, such as `0`, `O`, `1` and `l`, are never used, and **Excluded characters** leaves out more. The built-in platforms use 24 characters with `!#%+-=_.` for hosts, 16 with `#%+-=_.` for network devices, 24 with `#%+-=_.` for databases, and 32 for Redis.

## What a platform may do

The method decides what can be done at all, and the platform can turn each part off:

| Method | Change passwords | Push accounts | Gather accounts | Lock accounts |
| --- | --- | --- | --- | --- |
| Shell | Yes | Yes | Yes, except on macOS | Yes, with `usermod` |
| PowerShell | Yes | Yes | Yes | Yes |
| CLI | Yes | Yes | No | No |
| MySQL, PostgreSQL | Yes | Yes, without granting anything | Yes | Yes |
| SQL Server, Oracle, Redis | Yes | No | Yes | Yes |
| MongoDB | Yes | No | Yes | No |

- **Change passwords** gives the accounts **Change password now** and **Auto rotate**, and lets the account risks change passwords.
- **Push accounts** gives the accounts **Push to asset**, and lets [account templates](./accounts.md#account-templates) push to the assets.
- **Gather accounts** lets the daily risk scan read the accounts on the assets.

The Shell, PowerShell and CLI methods reach the assets over SSH, so they do these things on SSH assets only.
