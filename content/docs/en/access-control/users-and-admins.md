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

- see **Permissions**, **Sessions**, **Commands**, **Command rules** and **Records** (the [operation log](../audit/operation-logs.md)), and manage **Assets**;
- can connect to every asset of their organization, with every action, without a permission;
- can stop anyone's session and [watch SSH sessions live](../audit/sessions.md#watching-a-session-live).

An administrator of one organization cannot manage the assets or permissions of another. `built-in` users can, which is why they should be few.

## Everyone else

Users who are not administrators:

- land on the [workbench](../assets/connecting.md), which lists only the assets a [permission](./permissions.md) gives them **Connect** on;
- can call only the API needed to list those assets, connect to them, move files in their own SSH sessions, and manage their own [SSH keys](../assets/ssh-gateway.md#registering-a-public-key);
- cannot see stored passwords, other people's sessions, the command records, or the operation log.

A user with no permission at all signs in to an empty workbench.

## Limiting who can sign in

By default every user of the application's organization can sign in, and those without permissions get an empty workbench. To let only certain users in at all, set `allowedUsers` to a comma-separated list of `organization/name`, such as `my-org/alice,my-org/bob`. Anyone else is turned away at sign-in.

## Groups

Casdoor groups carry over. The token Casdoor issues at sign-in lists the user's groups, and a permission that names a group applies to every member.

## When changes in Casdoor take effect

Casvisor reads the user's groups and administrator flag from the token it gets at sign-in, and keeps that sign-in until the user signs out or the browser session ends. Adding someone to a group, removing them, turning **Is admin** on or off, or disabling the user in Casdoor therefore applies to the web UI the next time they sign in to Casvisor, not at once.

The [SSH gateway](../assets/ssh-gateway.md) has no web sign-in: it reads the user from Casdoor at every connection, so a disabled or deleted user cannot open a new gateway connection from then on. A connection already open keeps the groups it started with.

To cut someone off now:

1. Take them out of the permissions that name them, or turn those permissions off. This also refuses them at the SSH gateway, whatever keys they have registered, and their open sessions to the assets those permissions gave them are disconnected straight away; see [Disconnected when the permission goes](../audit/sessions.md#disconnected-when-the-permission-goes).
2. Stop any session that is still open under [Sessions](../audit/sessions.md).

Signing out of Casvisor ends its own cookie only. It does not sign the user out of Casdoor, so the next visit may go through without a password, as with any single sign-on.
