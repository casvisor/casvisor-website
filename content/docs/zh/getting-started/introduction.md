---
title: "介绍"
description: "Casvisor是一个开源堡垒机。它让用户在浏览器里通过SSH、RDP、VNC和Telnet访问服务器，用Casdoor登录，按Casbin权限检查每一次连接，并记录每个会话。"
---

Casvisor是一个开源堡垒机，也叫跳板机。它放在运维人员和他们要管的系统之间：

- 用户通过[Casdoor](https://casdoor.ai)登录，你已经配好的单点登录、多因素认证、LDAP和第三方登录在这里同样生效。
- 用户只能看到**权限**允许他们访问的服务器（称为**资产**），并在浏览器标签页里通过SSH、RDP、VNC或Telnet连接。用户电脑上和服务器上都不用装任何东西。
- SSH也可以经由Casvisor的**SSH网关**，用自己的`ssh`、`scp`、`sftp`或VS Code Remote连接，权限照样生效。
- 服务器的账号由Casvisor自己填入，密码不会到浏览器或SSH客户端里。
- 每次连接都是一个**会话**，管理员能在列表里看到、实时旁观（SSH）和强制断开。SSH会话里执行的命令会被记录，并能按**命令规则**拦截；传过的文件和通过接口做的每一次改动都记进**操作日志**；权限被收回时，会话会自己结束。

Casvisor用Go和React编写，采用Apache-2.0许可证，没有企业版。

## 整体结构

```text
  浏览器                      Casvisor                              服务器
+-----------+   HTTPS    +--------------------------+ SSH、RDP  +--------------+
| 工作台    |----------->| 登录          (Casdoor)  |---------->| Linux        |
| 标签页    | WebSocket  | 权限          (Casbin)   |    VNC    | Windows      |
+-----------+            | 会话、命令记录、         |---------->| 桌面         |
                         | 操作日志                 |           +--------------+
+-----------+  SSH 2222  |                          |                  ^
| ssh、scp、|----------->| SSH网关                  |                  |
| VS Code   |            +--------------------------+                  |
+-----------+                         |  Telnet                        |
                                      v                                |
                                 +---------+                           |
                                 |  guacd  |---------------------------+
                                 +---------+
```

- **SSH、RDP和VNC**由Casvisor用Go直接处理：浏览器通过WebSocket连Casvisor，Casvisor再连服务器。
- **SSH网关**是Casvisor里的一个SSH服务端，监听单独的端口。用户用公钥登录它，它替用户建立到资产的SSH连接。
- **Telnet**经由[guacd](https://guacamole.apache.org/doc/gug/guacamole-architecture.html)，即Apache Guacamole的协议守护进程，Casvisor通过4822端口和它通信。
- 用户、用户组和登录都在Casdoor里。资产、权限、会话、命令记录、SSH公钥和操作日志存在Casvisor自己的MySQL数据库里。

## 它解决什么

| 你想 | 看这里 |
| --- | --- |
| 给外包人员一周时间的两台服务器SSH权限，别的都不给 | [权限](../access-control/permissions.md) |
| 让整个运维组能连所有Linux服务器，但只能从办公网连 | [权限](../access-control/permissions.md) |
| 不让人从Windows桌面里往外复制文字或文件 | [权限](../access-control/permissions.md)、[协议](../assets/protocols.md) |
| 用服务器的人拿不到它的root密码 | [资产](../assets/assets.md) |
| 让人用自己的`ssh`、`scp`和VS Code Remote，又不把服务器密钥交出去 | [SSH网关](../assets/ssh-gateway.md) |
| 允许往服务器上传文件，但不许往下拿 | [文件传输](../assets/file-transfer.md) |
| 看现在谁连着、他在敲什么，并把某个人踢下线 | [会话](../audit/sessions.md) |
| 知道服务器上执行过哪些命令，在`rm -rf /`执行之前拦下它 | [命令记录和命令规则](../audit/commands.md) |
| 查出是谁、什么时候改了某条权限 | [操作日志](../audit/operation-logs.md) |

## 还没做的

Casvisor正在重做成完整的堡垒机，堡垒机该有的几项还在[路线图](../more/roadmap.md)上：会话录像和回放，一个资产多个系统账号与自动改密，访问申请与审批，经内网agent访问，数据库和Kubernetes访问，日志转发到syslog。本手册写的是当前代码里已有的功能，某个设置暂时不起作用的地方会直接说明。

## 下一步

[用Docker跑起来](./quickstart.md)，然后[对接你的Casdoor](./casdoor.md)。
