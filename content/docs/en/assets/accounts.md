---
title: "System accounts and password rotation"
seoTitle: "Casvisor: shared server accounts and password rotation"
description: "An asset can have several system accounts besides its own, such as root, deploy and readonly. Permissions say which account each user may connect as, users never see the passwords, and Casvisor changes the passwords on SSH assets by hand or on a schedule."
---

The account stored on an [asset](./assets.md#the-account) is its **default account**. Besides it, an asset can have more **system accounts**, such as `root`, `deploy` and `readonly` on one Linux server. A [permission](../access-control/permissions.md#accounts) says which of them a user may connect as. Casvisor fills in the account's password or private key on the server, so users connect as `root` without ever learning its password, and on SSH assets Casvisor can change the passwords on the asset itself, by hand or on a schedule.

## Adding accounts

System accounts are kept on the asset: open an asset under **Assets**, and the **System accounts** section below its fields lists them, with **Add** for a new one. The section appears once the asset has been saved. Only administrators see it.

| Field | Meaning |
| --- | --- |
| Username | The account on the server. It must be different from the asset's own **Username**, can be used only once per asset, and cannot contain `:`, `@`, `/`, `\`, spaces or quotes. |
| Display name, Description | Shown next to the username when users choose an account. |
| Password, Private key | At least one of them. As for the asset's own account, a passphrase-protected key takes its passphrase in **Password**. |
| Enabled | Off means nobody can connect as the account, and sessions connected as it are disconnected. |
| Auto rotate | Change the password on the asset on a schedule, see [Automatic rotation](#automatic-rotation). |
| Change the password every ... days | The interval of automatic rotation, 30 days when left empty. |

Passwords and keys are treated as the asset's own: encrypted with `credentialKey` when it is set (see [Encryption](./assets.md#encryption)), returned by the API as `***`, and kept when an account is saved with `***`. The list shows only whether an account has a password, a key or both.

Deleting an asset deletes its accounts, and renaming it keeps them.

## Who may connect as which account

Each permission has an **Accounts** field: the asset's own account, the account with the same name as the user, all accounts, or accounts by username. A permission that names none covers the asset's own account only, which is how permissions behaved before there were system accounts. See [Accounts](../access-control/permissions.md#accounts).

Administrators may connect as every account of the assets of their organization.

## Connecting as an account

- **The workbench** lists an asset once for every account the user may connect as, with the username beside it when there is more than one. A user who may only use one system account just sees the asset.
- **Connect** on **Assets** becomes a menu, **Connect as**, when the user may use several accounts. With a single system account it connects as that account straight away.
- **The SSH gateway** takes the account in the username, `ssh -p 2222 alice@deploy@web-01@casvisor.example.com`; see [Choosing the account](./ssh-gateway.md#choosing-the-account).

System accounts work in the browser for every protocol, SSH, RDP, VNC, Telnet and the databases, and through the SSH gateway for SSH. A port forward to another asset carries no account; the user logs in to the asset with their own.

The password stays on the server. The browser only sends the account's username to start the session, and Casvisor checks the permission for that account when the session starts and again when its WebSocket opens. The actions the user holds, such as Upload or Copy, are those the permissions give for that account.

The **Account** column of the [session list](../audit/sessions.md) shows which account a session used, or *Default* for the asset's own. Taking away a user's permission for an account, turning the account off or deleting it disconnects the sessions connected as it, the same way as when a permission goes; see [Disconnected when the permission goes](../audit/sessions.md#disconnected-when-the-permission-goes).

## Changing passwords

On SSH assets each account has two buttons:

- **Change password now** sets a new random password for the account on the asset and saves it in Casvisor. Sessions already connected as the account are not affected. It works for accounts with a password and no private key.
- **Push to asset** sets the password saved in Casvisor on the asset, and creates the account there first if it does not exist. Use it after adding an account in Casvisor that the server does not have yet, or to put the server back in line with Casvisor. It needs a saved password.

Casvisor makes the change through the asset's **own account**, so that account has to be allowed to change other accounts' passwords:

- **Linux**: root, or an account that can run `sudo` without a password. The password is set with `chpasswd`; a new account is created with `useradd -m`.
- **Windows**: an administrator, over the OpenSSH server. The password is set with `Set-LocalUser`; a new account is created with `New-LocalUser`, with a password that never expires, and added to the local Users group.

The asset's own account is not changed this way, and RDP, VNC, Telnet and database assets have no such buttons.

A new password is 24 characters long, with upper and lower case letters, digits and some of `!#%+-=_.`, leaving out characters that are easy to confuse such as `0`, `O`, `1` and `l`. After setting it, Casvisor logs in to the asset over SSH as the account with the new password to check that it works. If the change went through but that login fails, for example because the SSH server does not accept passwords for that account, the change is marked failed with *the password was changed, but signing in with it failed*; the new password is still saved, since it is the one on the asset.

Each account shows when its password was last changed and how the last change went: *Running*, *Succeeded* or *Failed*, with the error. Only one change runs on an account at a time. Every change is written to the [operation log](../audit/operation-logs.md) with the method `Account`, the action `rotate-asset-account` or `push-asset-account`, the asset, and the account's username with the result.

## Automatic rotation

With **Auto rotate** on, Casvisor changes the account's password as **Change password now** does, every time the interval has passed since the last change, and right away if it has never been changed. It looks for accounts that are due every 10 minutes, starting a minute after Casvisor starts.

Only enabled accounts on SSH assets with a password and no private key are rotated. When a rotation fails, it is tried again an hour later. If Casvisor is stopped while a password is being changed, the change is marked failed with *Casvisor restarted while the password was being changed*, and the next round tries again.

## Account templates

To give many assets the same account, such as an `ops` account on every Linux server, use **Account templates** (`/account-templates`). A template has the username, and either a password or a private key, or **A random password for each asset**, plus:

| Field | Meaning |
| --- | --- |
| Push to assets | Set the password on each asset when the template is applied, creating the account there if needed, as **Push to asset** does. Only on SSH assets, and only with a password. A random password for each asset needs it. |
| Rotate | Turn on automatic rotation for the accounts, every so many days. |
| Assets, Asset tags | The assets the template covers; `*` is every asset. |

**Apply** first shows what would change on each asset, then applies it. On an asset without the account, the account is created; one created by the template before is brought in line with it, its password or key and its rotation, unless each asset has a random password, which stays its own. An asset whose own account has that username, or that already has an account of that username that is not from the template, is left alone. Applying again later picks up the assets added since. The asset's accounts panel shows which accounts come from a template. Deleting a template keeps its accounts, which are then on their own.

## Account risks

**Account risks** (`/account-risks`) lists what is wrong with the accounts of the assets. Casvisor looks once a day, and **Scan now** looks at once:

| Risk | Level | What it means |
| --- | --- | --- |
| Weak password | High | The password of an asset's own account or of a system account is one of the most common ones, contains the username, is shorter than 8 characters, or uses too few kinds of characters |
| Reused password | Medium | The same password is used on 3 assets or more |
| Old password | Low, Medium after 180 days | The password of a system account has not been changed for 90 days |
| No password | High | An account on the asset can sign in without a password |
| Privileged account not managed | High | An account on the asset that Casvisor does not manage, with uid 0, in the sudo, wheel or admin group, or a Windows administrator |
| Account not managed | Low | Any other account on the asset that can sign in and that Casvisor does not manage |

The last three come from reading the accounts on each SSH asset with its own account: `/etc/passwd` and `/etc/group` on Linux, and `/etc/shadow` when that account is root or can use sudo without a password; the enabled local users and the Administrators group on Windows. An asset that can't be read is listed with the scan, and its risks are left as they were.

A risk found again stays open; one no longer found is resolved; one that comes back opens again. **Ignore** a risk that is fine, with a comment for the next one to read: later scans leave it ignored, and **Reopen** brings it back.

Open risks can be fixed from the page, one by one or for the selected ones at once, after a confirmation that lists the accounts:

- **Change password** (weak, old, reused or no password, on an account Casvisor manages): a new random password, set on the asset and checked by signing in with it, as **Change password now** does. For an asset's own account, the asset's saved password changes with it; an account that signs in with a private key is left alone.
- **Manage** (an account found on the asset): the account becomes a system account of its asset, with a random password set on the asset and rotated every 30 days. Who may connect as it is then up to the permissions.
- **Lock** (an account found on the asset): the account is locked and expired on its asset with `usermod -L -e 1`, so that it can sign in neither with a password nor with a key, or disabled on Windows. Undo it with `usermod -U -e -1` or `Enable-LocalUser`. `root`, `Administrator` and the asset's own account are never locked.

These need SSH assets whose own account is root, can use sudo without a password, or is a Windows administrator. A fixed risk is resolved with a comment saying what was done and by whom, and the action is in the operation log; the next scan opens it again if it is still there.
