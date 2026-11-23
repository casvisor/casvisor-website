---
title: "通知"
seoTitle: "Casvisor：命令、复核、作业和账号风险的Webhook与邮件通知"
description: "把Casvisor里发生的事发到钉钉、飞书、企业微信和Slack群机器人，以签名的JSON发给自己的系统，或用你的SMTP服务器发邮件：被拦截的命令、待复核的请求、作业结果、新的账号风险，以及失败的备份和报表。"
---

Casvisor通过**Webhook**页面里的Webhook通知需要处理的人。每个Webhook属于一个组织，选好要接收的事件，类型是下面之一：

| 类型 | 发到哪里 |
| --- | --- |
| JSON | 自己的系统：事件以JSON发出 |
| 钉钉、飞书、企业微信 | 群机器人：文字消息，发到把机器人加进群时给出的地址 |
| Slack | Slack的Incoming Webhook |
| 邮件 | 邮箱，经你的SMTP服务器发出 |

**发送测试消息**按表单里当前的设置发一条测试事件，不用先保存。

## 事件

| 事件 | 什么时候 |
| --- | --- |
| `command.blocked`、`command.alerted` | [命令规则](./commands.md)拦截了一条命令，或以告警标记了它 |
| `command_review.created`、`command_review.reviewed` | 有命令等待[复核](./commands.md#复核)，或已被批准、拒绝 |
| `access_request.created`、`access_request.reviewed` | 有[访问申请](../access-control/access-requests.md)等待审批，或已被批准、拒绝 |
| `login_review.created`、`login_review.reviewed` | 有登录等待[复核](../access-control/login-rules.md)，或已被批准、拒绝 |
| `job.succeeded`、`job.failed` | [作业](../assets/jobs.md)结束；失败时带上失败的资产和原因 |
| `job_schedule.missed` | [计划作业](../assets/jobs.md#计划作业)到了时间，但没有启动作业 |
| `account_risk.found` | 一次扫描发现了之前没有的[账号风险](../assets/accounts.md#风险账号)：新增几条、其中高风险几条，以及前10条 |
| `account_backup.failed` | [账号备份](../assets/accounts.md#账号备份)没能生成或没能发出 |
| `report.failed` | [定时报表](./reports.md#定时报表)没能生成或没能发出 |

事件在后台发送，慢或失败的Webhook不会拖住别的操作；发送失败记在Casvisor的日志里。

## 邮件

邮件类型的Webhook把每个事件发成一封纯文本邮件：

- **SMTP服务器**和端口，例如`smtp.gmail.com`、`smtp.office365.com`、`smtp.exmail.qq.com`。465端口一开始就用TLS；587等其他端口在服务器支持时用STARTTLS。
- **SMTP账号**和**SMTP口令**：一般是邮箱地址和它的口令；Gmail、Outlook、QQ邮箱、腾讯企业邮要填给客户端用的应用专用密码或授权码。口令只在TLS连接上发送。内网里不用登录就能发信的服务器两项都留空。
- **发件人**：邮件的发件人，例如`Casvisor <casvisor@example.com>`；留空用SMTP账号。
- **收件人**：收件邮箱，多个用逗号分隔。

邮件标题是`[Casvisor]`加事件的标题，例如`[Casvisor] Command waiting for review`，正文每个字段一行。[账号备份](../assets/accounts.md#账号备份)和[定时报表](./reports.md#定时报表)也是用邮件类型的Webhook发送的。

## JSON

JSON类型的Webhook发出：

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

请求头`X-Casvisor-Event`是事件类型。设了**密钥**时，还带`X-Casvisor-Signature-256: sha256=<hex>`，即用密钥对请求体算的HMAC-SHA256，你的系统可以据此确认请求来自Casvisor。

## 群机器人

消息以`[Casvisor]`开头，所以安全设置为关键词`Casvisor`的钉钉机器人能收到。钉钉和飞书的**密钥**是机器人安全设置里的加签密钥；企业微信和Slack不用。

Webhook不跟随重定向，也不会连云服务器存放元数据的链路本地地址；内网地址可以用。
