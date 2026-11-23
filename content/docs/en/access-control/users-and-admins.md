---
title: "Users and administrators"
description: "Casvisor signs people in with its own accounts, with an optional code from an authenticator app, or through Casdoor. Either way there are administrators, who manage assets, permissions, sessions, jobs and patches and can reach every asset, and everyone else, who only gets the workbench and the assets their permissions give them."
---

Accounts come from one of two places:

- **Built-in accounts**, kept by Casvisor itself. This is the default, used whenever `casdoorEndpoint` is empty.
- **Casdoor**, when `casdoorEndpoint` is set. Casvisor then keeps no accounts of its own; see [Connect Casdoor](../getting-started/casdoor.md).

Either way, what a signed-in user may do depends on one question: is this user an administrator?

## Built-in accounts

On first start, when there are no users yet, Casvisor creates the administrator `admin`. Its password is `adminPassword` from the configuration, or a random one printed once in the log; see [Quick start](../getting-started/quickstart.md#2-find-the-administrator-password).

Administrators manage accounts under **Users**:

| Field | Meaning |
| --- | --- |
| Name | The user name to sign in with: letters, digits, `.`, `_` and `-`. It cannot be changed later. |
| Display name, Email | Shown in the lists. |
| Password | At least 8 characters. When editing a user, leave it empty to keep the current one. |
| Groups | Groups the user is in, for [permissions](./permissions.md) and [command rules](../audit/commands.md). Pick an existing group or type a new name. |
| Is admin | Makes the user an administrator. |
| Is forbidden | The user cannot sign in, and their open sessions are disconnected. |

The last administrator who can sign in cannot be deleted, forbidden or have **Is admin** taken away, so Casvisor never ends up without one. Nobody can sign up by themselves.

Everyone changes their own password under **My Account**, in the menu at the top right. Passwords are stored as bcrypt hashes. After 5 wrong passwords for a user from one address, sign-in for that user from that address is refused for 15 minutes; other addresses are not affected, so nobody can lock an administrator out from elsewhere.

All built-in accounts belong to one organization, named by `casdoorOrganization`, `casvisor` by default. Changes to a user, such as new groups or **Is forbidden**, apply at once, to the web UI and to open sessions alike.

### Two-factor sign-in

Each user of the built-in accounts can turn on two-factor sign-in for themselves under **My Account**, so that signing in takes a code from an authenticator app such as Google Authenticator, Microsoft Authenticator or 1Password after the password:

1. Click **Set up**. Casvisor shows a QR code and the key it holds, for the app to scan or for typing in by hand.
2. Enter the 6-digit code the app shows, then **Turn on**.

From then on, the sign-in page asks for the code once the user name and password are right. The codes are standard TOTP: SHA-1, 6 digits, a new one every 30 seconds, and a code from the step before or after the current one is accepted to allow for clocks that drift. Each code works only once. A wrong code counts as a failed sign-in, like a wrong password, towards the 15-minute lockout. The key is stored encrypted with `credentialKey` when it is set, and codes and keys are masked in the [operation log](../audit/operation-logs.md).

To turn it off, the user clicks **Turn off** under **My Account** and enters their password. For a user who has lost the app, an administrator opens the user under **Users** and turns off **Two-factor sign-in** there; the user then signs in with the password alone and can set it up again. Administrators cannot turn it on for someone else.

Two-factor sign-in covers the web sign-in. The [SSH gateway](../assets/ssh-gateway.md) asks for a code only when a [login rule](./login-rules.md) requires two-step verification, and a login rule for everyone can make it compulsory. With Casdoor, MFA is set up in Casdoor instead; see [Connect Casdoor](../getting-started/casdoor.md).

## Administrators

A user is an administrator when **Is admin** is on for them: under **Users** for built-in accounts, or in Casdoor, which makes them an administrator of their Casdoor organization. With Casdoor, users of Casdoor's `built-in` organization are administrators too.

Administrators:

- see **Users** (built-in accounts only), **Network gateways**, **Permissions**, **Patches**, **Jobs**, **Sessions**, **Commands**, **Command rules** and **Records** (the [operation log](../audit/operation-logs.md)), and manage **Assets** and their [system accounts](../assets/accounts.md);
- approve, reject and revoke the [access requests](./access-requests.md) of their organization;
- can connect to every asset of their organization, with every action, without a permission;
- can stop anyone's session, [watch it live](../audit/sessions.md#watching-a-session-live) and [replay its recording](../audit/recordings.md).

An administrator of one organization cannot manage the assets or permissions of another. Users of Casdoor's `built-in` organization can, which is why they should be few.

## Everyone else

Users who are not administrators:

- land on the [workbench](../assets/connecting.md), which lists only the assets a [permission](./permissions.md) gives them **Connect** on;
- can call only the API needed to list those assets, connect to them, move files in their own sessions, manage their own [SSH keys](../assets/ssh-gateway.md#registering-a-public-key), send and cancel their own [access requests](./access-requests.md), and set up their own two-factor sign-in;
- cannot see stored passwords, other people's sessions, recordings, the command records, jobs, or the operation log.

A user with no permission at all signs in to an empty workbench, and can ask for access with an [access request](./access-requests.md).

## Limiting who can sign in

By default every user can sign in: every built-in account, or every user of the Casdoor application's organization. Those without permissions get an empty workbench. To let only certain users in at all, set `allowedUsers` to a comma-separated list of `organization/name`, such as `my-org/alice,my-org/bob`. Anyone else is turned away at sign-in.

## Groups

With built-in accounts, groups are what you enter under **Users**. With Casdoor, Casdoor's groups carry over: the token Casdoor issues at sign-in lists the user's groups. Either way, a permission that names a group applies to every member.

## When changes in Casdoor take effect

Casvisor reads the user's groups and administrator flag from the token it gets at sign-in, and keeps that sign-in until the user signs out or the browser session ends. Adding someone to a group, removing them, turning **Is admin** on or off, or disabling the user in Casdoor therefore applies to the web UI the next time they sign in to Casvisor, not at once.

The [SSH gateway](../assets/ssh-gateway.md) has no web sign-in: it reads the user from Casdoor at every connection, so a disabled or deleted user cannot open a new gateway connection from then on. A connection already open keeps the groups it started with.

To cut someone off now:

1. Take them out of the permissions that name them, or turn those permissions off. This also refuses them at the SSH gateway, whatever keys they have registered, and their open sessions to the assets those permissions gave them are disconnected straight away; see [Disconnected when the permission goes](../audit/sessions.md#disconnected-when-the-permission-goes).
2. Stop any session that is still open under [Sessions](../audit/sessions.md).

Signing out of Casvisor ends its own cookie only. It does not sign the user out of Casdoor, so the next visit may go through without a password, as with any single sign-on.
