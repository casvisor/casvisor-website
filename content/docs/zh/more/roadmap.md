---
title: "路线图"
description: "Casvisor已经做完的和接下来要做的：已做完系统账号与自动改密、访问申请、数据库、作业中心和syslog转发；接下来是Kubernetes访问、补全RDP、AI智能体网关和国内合规。"
---

Casvisor正在公开地重做成一个完整的堡垒机。下面是工作的先后顺序。进展会体现在[casvisor/casvisor](https://github.com/casvisor/casvisor)的提交和本手册的更新里。欢迎在[issue](https://github.com/casvisor/casvisor/issues)里提想法和反对意见。

## 已完成

- 收窄成只做堡垒机：去掉了云主机管理和区块链日志（v1.107.0）。
- SSH和VNC用Go直接处理，VNC密码留在服务器上（v1.108.0）。
- [权限](../access-control/permissions.md)：用户、用户组、资产、资产标签、动作、来源IP、有效期，用Casbin判断（v1.109.0）。
- 新的前端，基于React、Vite和shadcn/ui。
- RDP用Go直接处理（[gordp](https://github.com/casvisor/gordp)），支持NLA，账号在服务器上填入（v1.110.0）。
- 启动时自己去Casdoor取证书，能配任意Casdoor（v1.110.0）。
- 密码和SSH私钥加密保存，SSH主机密钥和RDP证书在第一次连接时固定（v1.110.0）。
- [SSH网关](../assets/ssh-gateway.md)：经由Casvisor用`ssh`、`scp`、`sftp`、`rsync`和VS Code Remote连接，用公钥登录，和网页终端用同一套权限；新增端口转发动作**Forward**。
- SSH资产的[文件传输](../assets/file-transfer.md)：网页终端旁的文件面板和SFTP，由上传、下载动作放行，并记进操作日志。
- [命令记录和命令规则](../audit/commands.md)：在虚拟屏幕上读出SSH会话里的命令，按规则拦截或告警。
- [网域网关](../assets/network-gateways.md)：经对方网络里的SSH跳板机，或经在内网主动连回Casvisor的agent，访问Casvisor直接连不到的资产。
- [实时旁观会话](../audit/sessions.md#实时旁观)，以及权限收回或到期时[立即断开会话](../audit/sessions.md#权限收回即断开)。
- SSH资产的[补丁管理](../assets/patches.md)：扫描系统更新、安装并重启，支持Windows和Linux。
- 开箱即用：默认用SQLite代替MySQL，没有配置Casdoor时用[自带账号](../access-control/users-and-admins.md#自带账号)，一条`docker run`就能跑起一个可以登录的Casvisor。
- RDP：剪贴板、随窗口调整大小、经重定向磁盘[传文件](../assets/file-transfer.md#rdp)、带ClearCodec和RemoteFX Progressive的图形管道、高分屏上的清晰文字、远程光标，以及Windows 11和基于FreeRDP的服务端。
- Telnet用Go直接处理，带命令记录和命令规则，一个程序覆盖所有协议。
- SSH、Telnet、VNC和RDP会话的[录像和回放](../audit/recordings.md)，在浏览器里播放，终端录像可以下载成asciicast；四种协议都能实时旁观。
- [系统账号](../assets/accounts.md)：一个资产多个账号，权限决定用户能以哪个账号连接；SSH资产上的密码可以手动或按周期修改。
- [访问申请](../access-control/access-requests.md)：用户申请一段时间内访问某些资产，管理员批准（可缩小范围）、驳回或收回，批准的申请到期自动失效。
- 自带账号的[两步验证](../access-control/users-and-admins.md#两步验证)，用身份验证器里的动态码。
- 浏览器里的[MySQL和PostgreSQL](../assets/databases.md) SQL控制台，每条语句都记录并按命令规则检查。
- 同一个控制台连[SQL Server、Oracle、Redis和MongoDB](../assets/databases.md)：SQL Server按`GO`行分批、Oracle的PL/SQL块、Redis命令和MongoDB shell语句都记录并按命令规则检查，数据库服务器的公钥在第一次连接时固定。
- [登录规则](../access-control/login-rules.md)：按用户、用户组、来源IP、星期和时间段放行、拒绝或暂停复核网页和SSH网关的登录，以及要求两步验证。
- [本地客户端](../assets/local-clients.md)：在资产列表里用一次性链接打开Xshell、WinSCP和终端，RDP资产经Casvisor内置的远程桌面网关用远程桌面连接（mstsc）打开。
- [作业中心](../assets/jobs.md)：在多台SSH资产上批量执行命令、脚本和分发文件。
- 会话、命令记录和操作日志[导出CSV和转发到syslog](../audit/export.md)，格式为RFC 5424或CEF。
- [计划作业](../assets/jobs.md#计划作业)：按cron时间表、在任意时区自动运行作业。
- [分享会话](../audit/sessions.md#分享会话)：用户用链接和验证码把会话分享给同事，旁观或一起操作。
- [云账号](../assets/cloud-accounts.md)：把阿里云、AWS、腾讯云、Azure和Google Cloud账号里的服务器同步成资产，可预览、可定时。
- [命令复核](../audit/commands.md#复核)：命中复核规则的命令要等另一位管理员批准才执行，终端、SSH网关、数据库控制台、作业和网站都生效。

## 接下来

1. **Kubernetes访问。** 经由Casvisor访问Kubernetes集群，和其他资产用同一套权限和审计。

## 再往后

- **补全RDP**：H.264和远程应用（RemoteApp）。
- **AI智能体网关。** 给编程智能体和AI运维一个受控的SSH和MCP入口：命令要过策略，高危命令等人确认，全程记录。
- **国内合规**：等保三级对堡垒机的要求，以及SM2、SM3、SM4国密算法。

## 不打算做的

管理云主机和把日志写上区块链，这是Casvisor旧版本做过的事，两者都是有意去掉的。
