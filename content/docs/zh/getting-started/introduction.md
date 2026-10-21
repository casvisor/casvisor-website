---
title: "介绍"
description: "Casvisor是一个开源堡垒机。它让用户在浏览器里通过SSH、RDP、VNC和Telnet访问服务器，用Casdoor登录，按Casbin权限检查每一次连接，并记录每个会话。"
---

Casvisor是一个开源堡垒机，也叫跳板机。它放在运维人员和他们要管的系统之间：

- 用户通过[Casdoor](https://casdoor.ai)登录，你已经配好的单点登录、多因素认证、LDAP和第三方登录在这里同样生效。
- 用户只能看到**权限**允许他们访问的服务器（称为**资产**），并在浏览器标签页里通过SSH、RDP、VNC或Telnet连接。用户电脑上和服务器上都不用装任何东西。
- 服务器的账号由Casvisor自己填入，密码不会到浏览器里。
- 每次连接都是一个**会话**，管理员能在列表里看到并强制断开；通过接口做的每一次改动都记进**操作日志**。

Casvisor用Go和React编写，采用Apache-2.0许可证，没有企业版。

## 整体结构

```text
  浏览器                      Casvisor                              服务器
+-----------+   HTTPS    +--------------------------+ SSH、RDP  +--------------+
| 工作台    |----------->| 登录          (Casdoor)  |---------->| Linux        |
| 标签页    | WebSocket  | 权限          (Casbin)   |    VNC    | Windows      |
+-----------+            | 会话、操作日志           |---------->| 桌面         |
                         +--------------------------+           +--------------+
                                      |  Telnet                        ^
                                      v                                |
                                 +---------+                           |
                                 |  guacd  |---------------------------+
                                 +---------+
```

- **SSH、RDP和VNC**由Casvisor用Go直接处理：浏览器通过WebSocket连Casvisor，Casvisor再连服务器。
- **Telnet**经由[guacd](https://guacamole.apache.org/doc/gug/guacamole-architecture.html)，即Apache Guacamole的协议守护进程，Casvisor通过4822端口和它通信。
- 用户、用户组和登录都在Casdoor里。资产、权限、会话和操作日志存在Casvisor自己的MySQL数据库里。

## 它解决什么

| 你想 | 看这里 |
| --- | --- |
| 给外包人员一周时间的两台服务器SSH权限，别的都不给 | [权限](../access-control/permissions.md) |
| 让整个运维组能连所有Linux服务器，但只能从办公网连 | [权限](../access-control/permissions.md) |
| 不让人从Windows桌面里往外复制文字或文件 | [权限](../access-control/permissions.md)、[协议](../assets/protocols.md) |
| 用服务器的人拿不到它的root密码 | [资产](../assets/assets.md) |
| 看现在谁连着，并把某个人踢下线 | [会话](../audit/sessions.md) |
| 查出是谁、什么时候改了某条权限 | [操作日志](../audit/operation-logs.md) |

## 还没做的

Casvisor正在重做成完整的堡垒机，堡垒机该有的几项还在[路线图](../more/roadmap.md)上：用本地的`ssh`、`scp`或SFTP客户端连接，会话录像和回放，命令记录和拦截，支持SSH私钥的加密凭据保险箱，数据库和Kubernetes访问。本手册写的是当前代码里已有的功能，某个设置暂时不起作用的地方会直接说明。

## 下一步

[用Docker跑起来](./quickstart.md)，然后[对接你的Casdoor](./casdoor.md)。
