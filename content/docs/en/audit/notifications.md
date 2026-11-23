---
title: "Notifications"
seoTitle: "Casvisor: webhook and email notifications for commands, reviews, jobs and account risks"
description: "Send what happens in Casvisor to DingTalk, Feishu, WeCom and Slack group bots, to your own systems as signed JSON, or by email through your SMTP server: blocked commands, reviews waiting, finished jobs, new account risks and failed backups."
---

Casvisor tells people of what needs them through webhooks, on the **Webhooks** page. Each webhook belongs to an organization, picks the events it is told of, and is one of these types:

| Type | Where it goes |
| --- | --- |
| JSON | Your own system: the event is posted as JSON |
| DingTalk, Feishu, WeCom | A group bot: a text message, posted to the address shown when the bot is added to the group |
| Slack | A Slack incoming webhook |
| Email | Mailboxes, through your SMTP server |

**Send test message** sends a test event with the webhook as it is in the form, before it is saved.

## Events

| Event | When |
| --- | --- |
| `command.blocked`, `command.alerted` | A [command rule](./commands.md) blocked a command, or flagged it with Alert |
| `command_review.created`, `command_review.reviewed` | A command waits for [review](./commands.md#review), or was approved or rejected |
| `access_request.created`, `access_request.reviewed` | An [access request](../access-control/access-requests.md) waits for review, or was approved or rejected |
| `login_review.created`, `login_review.reviewed` | A sign-in waits for [review](../access-control/login-rules.md), or was approved or rejected |
| `job.succeeded`, `job.failed` | A [job](../assets/jobs.md) ended; a failed one comes with the assets that failed and why |
| `job_schedule.missed` | A [job schedule](../assets/jobs.md#job-schedules)'s time came and no job started |
| `account_risk.found` | A scan found [account risks](../assets/accounts.md#account-risks) that the scans before did not: their number, how many are high, and the first 10 |
| `account_backup.failed` | An [account backup](../assets/accounts.md#account-backups) was not made or not sent |

Events are sent in the background, so a slow or failing webhook holds nothing up; a failure is written to Casvisor's log.

## Email

An Email webhook sends each event as a plain-text email:

- **SMTP server** and port, such as `smtp.gmail.com`, `smtp.office365.com` or `smtp.exmail.qq.com`. Port 465 uses TLS from the start; other ports, such as 587, use STARTTLS when the server offers it.
- **SMTP username** and **SMTP password**: usually the email address and its password, or the app password or authorization code that Gmail, Outlook, QQ Mail and Tencent Exmail give for clients. The password is only sent over TLS. Leave both empty for a relay on the internal network that takes mail without signing in.
- **Sender**: the From of the emails, such as `Casvisor <casvisor@example.com>`; empty means the SMTP username.
- **Recipients**: the addresses to send to, separated by commas.

The subject is the event's title after `[Casvisor]`, such as `[Casvisor] Command waiting for review`, and the body has one line per field. Email webhooks are also what [account backups](../assets/accounts.md#account-backups) are sent with.

## JSON

A JSON webhook posts:

```json
{
  "type": "command.blocked",
  "title": "Command blocked",
  "time": "2026-11-23T20:26:45+08:00",
  "organization": "casvisor",
  "user": "alice",
  "data": {"asset": "web1", "command": "rm -rf /", "rule": "no-rm", "clientIp": "10.0.0.8", "session": "..."}
}
```

with the header `X-Casvisor-Event` set to the type. With a **Secret**, it also has `X-Casvisor-Signature-256: sha256=<hex>`, the HMAC-SHA256 of the body with the secret, for your system to check that the request came from Casvisor.

## Group bots

The message starts with `[Casvisor]`, so a DingTalk bot whose security setting is the keyword `Casvisor` takes it. The **Secret** of DingTalk and Feishu is the signing secret of the bot's security setting; WeCom and Slack don't use one.

Webhooks don't follow redirects and don't reach the link-local addresses where cloud servers keep their metadata; addresses on the internal network work.
