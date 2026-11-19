---
title: "导出与syslog转发"
seoTitle: "Casvisor：审计日志导出CSV，转发到syslog和SIEM"
description: "把会话、命令记录和操作日志按列表当前的筛选下载成CSV文件；把会话、命令和操作日志实时转发到syslog服务器，格式为带JSON正文的RFC 5424或CEF，供SIEM使用。"
---

审计记录存在Casvisor的数据库里。有两种方式把它们拿出来：从列表下载CSV文件，或者实时发给syslog服务器，再由Splunk、Elastic、QRadar、ArcSight这类SIEM接收。

## 导出CSV

**会话**、**命令记录**和**日志**（即[操作日志](./operation-logs.md)）页面各有一个**导出 CSV**按钮。它下载与列表当前显示相符的全部行，不只是当前页：按当前的搜索和排序，在**会话**页面还按当前的标签（在线或历史）。一个文件最多100,000行。

| 列表 | 列 |
| --- | --- |
| 会话 | ID, Asset, Protocol, Mode, User, Client IP, Client IP location, User agent, Status, Start time, End time, Duration (s), Commands, Code, Message |
| 命令记录 | Time, Command, Action, Rule, User, Asset, Client IP, Session |
| 日志 | ID, Name, Time, Organization, User, Client IP, User agent, Method, Request URI, Action, Language, Object, Response |

文件是带BOM的UTF-8，Excel打开时中文不会乱码；文件名由列表名和时间组成，例如`commands-20261120-153000.csv`。以`=`、`+`、`-`或`@`开头的单元格前面会加一个`'`，免得表格软件把它当公式执行。

导出只有管理员能用，范围是本组织。每次导出本身也会记进操作日志，动作是`export-sessions`、`export-commands`或`export-records`，带上行数和所用的筛选条件。

[数据库会话](../assets/databases.md#复制和导出)的查询结果在SQL控制台里导出。

## 转发到syslog

设置`syslogAddress`后，Casvisor会把三类事件在发生时发给这台syslog服务器：

| 事件 | 什么时候发 | 类型 |
| --- | --- | --- |
| 操作日志 | 每写一条[操作日志](./operation-logs.md)，包括SFTP传输这类会话内事件 | `record` |
| 命令 | 每记录一条命令或SQL语句，包括被拦截的，以及[作业](../assets/jobs.md)执行的 | `command` |
| 会话 | 会话连上时，以及结束时 | `session-start`、`session-end` |

```ini
syslogAddress = udp://10.0.0.5:514
syslogFormat = rfc5424
```

`syslogAddress`写成`udp://主机:端口`或`tcp://主机:端口`，不写协议就是UDP；为空（默认）表示不转发。走TCP时每条消息以换行结尾。不支持TLS；要经过不可信的网络，先发给本机的rsyslog这类中继，由它加密。见[配置](../operations/configuration.md#审计转发)。

### 带JSON正文的RFC 5424

`syslogFormat = rfc5424`（默认）发送RFC 5424消息，应用名是`casvisor`，消息ID是事件类型，正文是JSON：

```text
<110>1 2026-11-20T15:30:00.000+08:00 bastion casvisor 1234 command - {"type":"command","time":"2026-11-20T15:30:00+08:00","organization":"casvisor","user":"casvisor/alice","clientIp":"203.0.113.7","asset":"casvisor/web-01","session":"casvisor/2f1c...","command":"systemctl restart nginx","action":"","rule":""}
```

| 类型 | 字段 |
| --- | --- |
| `record` | id、organization、user、clientIp、userAgent、method、requestUri、action、object、status、message |
| `command` | organization、user、clientIp、asset、session、command、action、rule |
| `session-start` | organization、session、user、clientIp、userAgent、asset、protocol、mode、startTime |
| `session-end` | 同上，再加endTime、duration（秒）、commandCount、code、message |

### CEF

`syslogFormat = cef`发送ArcSight的通用事件格式（CEF），前面是BSD风格的syslog头，厂商是`Casbin`，产品是`Casvisor`：

```text
<110>Nov 20 15:30:00 bastion CEF:0|Casbin|Casvisor|1.0|command|Command|3|rt=1795159800000 cs1=casvisor cs1Label=organization suser=casvisor/alice src=203.0.113.7 dhost=casvisor/web-01 cs2=casvisor/2f1c... cs2Label=session msg=systemctl restart nginx
```

字段能用CEF标准键的都用标准键（`suser`、`src`、`dhost`、`act`、`msg`、`request`、`requestMethod`、`requestClientApplication`、`app`、`start`、`end`、`outcome`、`externalId`），其余用`cs1`到`cs3`、`cn1`到`cn3`并带标签，例如`cs1Label=organization`。`rt`、`start`和`end`里的时间以毫秒计。

### 级别

所有事件的facility都是*log audit*（13）。

| 事件 | syslog级别 | CEF级别 |
| --- | --- | --- |
| 大多数事件 | Informational（6） | 3 |
| 失败的接口调用、命中告警规则的命令 | Notice（5） | 5 |
| 被拦截规则挡下的命令 | Warning（4） | 8 |

### syslog服务器连不上时

事件先放进内存里一个容量10,000的队列，逐条发送。服务器连不上时，Casvisor会重连，两次尝试之间最多等30秒，日志里最多每分钟警告一次。队列满了，新事件会被丢弃，丢弃的数量每分钟记一次日志。UDP消息最多发两次。无论如何，事件都还在Casvisor的数据库里，转发出去的只是副本。超过2,000字节的值会被截断。
