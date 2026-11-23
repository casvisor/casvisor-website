---
title: "Login rules"
seoTitle: "Casvisor: login rules by user, IP and time, with sign-in review and two-step verification"
description: "Login rules decide what happens when people sign in to Casvisor, on the web or through the SSH gateway: allow, reject, hold the sign-in until an administrator approves it, or require two-step verification, by user, group, client IP, weekday and time of day."
---

Login rules decide what happens when a user signs in, before they reach any asset. Each rule covers some users, client IPs and times, and says what to do: let the sign-in go on, reject it, hold it until an administrator approves it, or ask for a code from an authenticator app. They complement [permissions](./permissions.md), which decide what a signed-in user may connect to.

Administrators manage them under **Login rules**, and approve held sign-ins under **Login reviews**.

## A rule

| Field | Meaning |
| --- | --- |
| Priority | Rules are tried from the smallest priority up, and the first one that matches decides. When no rule matches, the sign-in goes on. |
| Users, Groups | Who the rule covers. `*` is everyone. Both empty also covers everyone. |
| Client IPs | Addresses or CIDRs, such as `10.0.0.0/8`. Empty covers every address. The address is read as for [permissions](./permissions.md#the-client-ip). |
| Weekdays | The days the rule applies on. Empty is every day. |
| Time of day | A start and an end, such as `09:00` to `18:00`. Empty is the whole day. An end before the start, such as `22:00` to `06:00`, goes over midnight and belongs to the weekday it starts on. |
| Time zone | An IANA time zone such as `Asia/Shanghai`. Empty uses the server's. |
| Sign-in methods | **Web** is signing in to the Casvisor website, **SSH gateway** is `ssh`, `scp`, SFTP and the [local clients](../assets/local-clients.md) through the [SSH gateway](../assets/ssh-gateway.md), **Database client** is a client signing in to the [database proxy](../assets/local-clients.md#database-clients) with a database token. Empty covers all three. |
| Action | **Allow**, **Reject**, **Review** or **Require two-step verification**, see below. |
| Reviewers | For Review: the administrators who may approve. Empty is every administrator of the organization. |
| Is enabled | A disabled rule is skipped. |

The rules of an organization apply to its users. Users of Casdoor's `built-in` organization are not held by any rule.

## Actions

- **Allow** lets the sign-in go on. It is for exceptions before a broader rule: an Allow rule for the office network at priority 10, then a Reject rule for everyone at priority 20, lets people in only from the office.
- **Reject** refuses the sign-in. The web sign-in page says which rule refused it, and so does `ssh`.
- **Review** holds the sign-in until an administrator approves or rejects it, for 10 minutes at most. On the web, the sign-in page shows that it is waiting and signs the user in as soon as the sign-in is approved. Through the SSH gateway, `ssh` shows the request number and waits. The reviewer's comment is shown to the user.
- **Require two-step verification** asks for a code from an authenticator app. On the web it applies to the [built-in accounts](./users-and-admins.md#two-factor-sign-in): a user who has not turned it on is signed in but sent to **My Account**, and can do nothing else until they turn it on. With Casdoor sign-in, two-step verification is set up in Casdoor, and this rule lets a web sign-in go on. Through the SSH gateway, `ssh` asks for the code after the key; a user who has not turned it on, and every Casdoor user, is refused there. A rule for everyone with this action makes two-step verification compulsory.

A rule that covers an administrator only through `*` or a group does not reject an administrator or hold them for review, so that a broad rule cannot lock every administrator out. A rule that names the administrator in **Users** does.

## When rules are checked

On the web, the rules are checked after the password, and after the code when the user has two-step verification on, with Casvisor's own accounts and with Casdoor alike. Through the SSH gateway, they are checked once the user's public key or certificate is known, and for the one-time tokens of [local clients](../assets/local-clients.md). A Reject, Review or two-step verification through the gateway goes on with SSH's keyboard-interactive step, which `ssh`, Xshell and other clients show. For a [database client](../assets/local-clients.md#database-clients), they are checked at each connection, once the token is known: Reject refuses the connection with the rule's name; Review keeps the client waiting until an administrator decides, `psql` showing a notice meanwhile, and once approved the token connects from that client IP without asking again; two-step verification refuses the connection, as database clients can't ask for a code, so scope such rules to Web and SSH gateway when database clients should still work.

Rules apply to new sign-ins. A user who is already signed in stays signed in; to cut off connections, take away the [permission](./permissions.md) instead.

## Reviewing sign-ins

**Login reviews** lists the held sign-ins, with the user, the rule, the client IP, the user agent and the time, filtered by status: Pending, Approved, Rejected, Signed in, Expired or Canceled. A reviewer approves or rejects one, with an optional comment shown to the user. Nobody can review their own sign-in. An approval is used by that one sign-in, which has to finish within 10 minutes. A pending sign-in that nobody reviews expires after 10 minutes, and one the user gives up on is canceled.

New and reviewed sign-ins can be sent to DingTalk, Feishu, WeCom, Slack or any URL through webhooks, as the events `login_review.created` and `login_review.reviewed`.

## The audit log

Rejected sign-ins, sign-ins held for review, approvals and rejections, and users sent to turn on two-step verification are written to the [operation log](../audit/operation-logs.md) as `login-reject`, `login-review`, `login-review-approve`, `login-review-reject` and `login-mfa-setup`, and [forwarded to syslog](../audit/export.md#syslog-forwarding) with the rest of it.
