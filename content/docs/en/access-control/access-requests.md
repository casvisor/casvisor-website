---
title: "Access requests"
seoTitle: "Casvisor: just-in-time access requests with approval"
description: "Users ask for access to assets for a while, with the accounts, actions, time window and a reason. An administrator approves, narrows or rejects the request; an approved request becomes a permission that ends by itself, and revoking it disconnects the sessions it allowed."
---

Instead of an administrator writing a [permission](./permissions.md) for every short job, users can ask for access themselves. An **access request** names the assets, the accounts, the actions, the time and the reason. Once an administrator approves it, Casvisor adds a permission for that user alone, which stops counting at the end time like any other.

The page is **Access requests** (`/access-requests`), in everyone's menu. Users see their own requests there; administrators see every request of their organization.

## Asking for access

Click **Request access** on the page, or, for users who are not administrators, in the toolbar of **Assets**, and fill in:

| Field | Meaning |
| --- | --- |
| Assets | One or more assets of your organization. You can pick from all of them, not only those you can already reach; the list shows their names, display names, protocols and tags, but not their addresses or accounts' passwords. |
| Accounts | The [accounts](../assets/accounts.md) to connect as, from the usernames of the chosen assets. Empty means each asset's own account. `*` cannot be asked for. |
| Actions | Connect, which is always included, and any of Copy, Paste, Upload, Download and Forward. See [The actions](./permissions.md#the-actions). |
| Start time, End time | When the access should begin, now if left empty, and when it ends. The end time is required and has to be in the future. |
| Reason | Why you need it. Required. |

**Send request** files it as *Pending*. Casvisor does not send a notification; administrators find it on the page. While a request is pending, the user who sent it can **Cancel** it, which marks it *Cancelled*.

## Reviewing a request

Administrators have three actions on a request:

- **Approve**, on a pending request. The dialog shows the request and lets the administrator leave out some of the actions (Connect stays), move the end time earlier and add a comment. An approval can only narrow a request: adding actions or a later end time is refused. Approving adds a permission named `request_<id>` with the requester as its only user, the requested assets and accounts, the approved actions and the start and end times, and no client IP limit. Its description holds the reviewer and the reason. The request turns *Approved*, and the assets show up in the user's workbench from the start time.
- **Reject**, on a pending request, with a comment. The request turns *Rejected* and nothing is granted.
- **Revoke**, on an approved request, with a comment. The permission the request became is deleted, the request turns *Revoked*, and the sessions it allowed are disconnected at once; see [Disconnected when the permission goes](../audit/sessions.md#disconnected-when-the-permission-goes).

The list shows each request's user, status, assets, accounts, actions, end time and reason, and once it has been reviewed, the reviewer as `organization/name`, the comment and a link to the permission.

The permission made from a request is an ordinary permission: it appears under **Permissions**, where it can be edited or turned off, and it ends at its end time without anyone revoking it. Deleting a request from the list leaves its permission in place; to take the access back, revoke the request or delete the permission.

## In the logs

Sending, cancelling, approving, rejecting and revoking requests are API calls, so they go into the [operation log](../audit/operation-logs.md) as `add-access-request`, `cancel-access-request`, `approve-access-request`, `reject-access-request` and `revoke-access-request`. The sessions opened under an approved request are listed, recorded and checked against [command rules](../audit/commands.md) like any other.
