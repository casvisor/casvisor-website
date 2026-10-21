---
title: "Users and administrators"
description: "Casvisor has two kinds of users: administrators, who manage assets, permissions and sessions and can reach every asset, and everyone else, who only gets the workbench and the assets their permissions give them."
---

Every account comes from Casdoor; Casvisor has no user list of its own. What a signed-in user may do depends on one question: is this user an administrator?

## Administrators

A user is an administrator when either is true:

- **Is admin** is turned on for them in Casdoor, which makes them an administrator of their organization.
- They belong to Casdoor's `built-in` organization.

Administrators:

- see **Assets**, **Permissions**, **Sessions** and **Records** (the [operation log](../audit/operation-logs.md));
- can connect to every asset of their organization, with every action, without a permission;
- can stop anyone's session.

An administrator of one organization cannot manage the assets or permissions of another. `built-in` users can, which is why they should be few.

## Everyone else

Users who are not administrators:

- land on the [workbench](../assets/connecting.md), which lists only the assets a [permission](./permissions.md) gives them **Connect** on;
- can call only the API needed to list those assets and connect to them;
- cannot see stored passwords, other people's sessions, or the operation log.

A user with no permission at all signs in to an empty workbench.

## Groups

Casdoor groups carry over. The token Casdoor issues at sign-in lists the user's groups, and a permission that names a group applies to every member.

## When changes in Casdoor take effect

Casvisor reads the user's groups and administrator flag from the token it gets at sign-in, and keeps that sign-in until the user signs out or the browser session ends. Adding someone to a group, removing them, turning **Is admin** on or off, or disabling the user in Casdoor therefore applies the next time they sign in to Casvisor, not at once.

To cut someone off now:

1. Take them out of the permissions that name them, or turn those permissions off. Permissions are checked again on every connection, so this applies immediately.
2. Stop their open connections under [Sessions](../audit/sessions.md).

Signing out of Casvisor ends its own cookie only. It does not sign the user out of Casdoor, so the next visit may go through without a password, as with any single sign-on.
