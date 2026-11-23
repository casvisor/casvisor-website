---
title: "平台"
seoTitle: "Casvisor：Linux、Windows、网络设备和数据库的平台"
description: "平台是一类系统，例如Linux、Cisco IOS或MySQL：它有哪些协议和默认端口、终端用什么字符集、Casvisor怎样在上面提权、怎样改密，以及随机密码长什么样。Casvisor内置了一批，管理员可以复制后修改。"
---

每个[资产](./assets.md)都有一个**平台**，也就是它属于哪类系统，例如Linux、Cisco IOS或MySQL。平台决定：

- 资产能用哪些协议，以及每个协议的默认端口；
- 终端的字符集；
- 资产自己的账号怎样获得特权：`sudo`、`su`或`enable`；
- Casvisor怎样修改它的[系统账号](./accounts.md#修改密码)的密码、怎样在上面创建账号、怎样为[风险账号](./accounts.md#风险账号)读取上面的账号；
- Casvisor在上面设置的随机密码有多长、用哪些字符。

管理员在**资产管理** > **平台**（`/platforms`）里查看平台。

## 内置平台

| 平台 | 协议 | 改密方法 | 提权方式 |
| --- | --- | --- | --- |
| Linux | SSH、Telnet、VNC、RDP | 经SSH跑Shell脚本：`chpasswd`、`useradd -m` | `sudo` |
| Unix | SSH、Telnet | 经SSH跑Shell脚本：`chpasswd`，FreeBSD上用`pw` | `sudo` |
| macOS | SSH、VNC | 经SSH跑Shell脚本：`dscl`、`sysadminctl -addUser` | `sudo` |
| Windows | RDP、SSH、VNC、Desktop | 经OpenSSH服务端跑PowerShell：`Set-LocalUser`、`New-LocalUser` | 无，账号必须是管理员 |
| Cisco IOS | SSH、Telnet | 经SSH用设备命令行 | `enable` |
| Huawei VRP | SSH、Telnet | 经SSH用设备命令行 | 无，打开时用`super` |
| H3C Comware | SSH、Telnet | 经SSH用设备命令行 | 无，打开时用`super` |
| Juniper JunOS | SSH、Telnet | 经SSH用设备命令行 | 无 |
| MySQL、MariaDB | MySQL | `ALTER USER`、`CREATE USER` | 无 |
| PostgreSQL | PostgreSQL | `ALTER ROLE ... PASSWORD`、`CREATE ROLE ... LOGIN` | 无 |
| SQL Server | SQLServer | `ALTER LOGIN` | 无 |
| Oracle | Oracle | `ALTER USER ... IDENTIFIED BY` | 无 |
| Redis | Redis | `ACL SETUSER`，default用户用`CONFIG SET requirepass` | 无 |
| MongoDB | MongoDB | `updateUser` | 无 |
| Kubernetes | Kubernetes | 不改密 | 无 |
| Website | Web | 不改密 | 无 |

内置平台不能修改或删除。点**复制**在本组织里得到一份自己的平台，再改这份复制。

## 给资产选平台

资产页面在**协议**旁边有**平台**字段，只列出含有这个资产协议的平台；选了平台会填入它在这个协议上的端口。换协议时，如果当前平台也有新协议就保留，否则换成这个协议的内置平台：SSH、VNC、Telnet是Linux（资产的操作系统是Windows时为Windows），RDP和Desktop是Windows，数据库、Kubernetes和Website用同名平台。保存时没有平台的资产也会得到这个默认平台，Casvisor有平台之前就存在的资产同样如此。

资产的平台不含它的协议时，资产保存不了。

在[资产的CSV文件](./assets.md)里，`platform`列是平台名，例如`cisco-ios`，`elevationPassword`列是[提权密码](#提权)。`platform`留空就用默认平台。导出时`elevationPassword`和密码一样留空，[账号备份](./accounts.md#账号备份)里会填上。

## 字段

| 字段 | 含义 |
| --- | --- |
| 名称、显示名称 | 资产引用平台用的名字，不能和内置平台重名。平台改名时，用它的资产跟着改。 |
| 类别 | 主机、网络设备、数据库、云或网站，用于列表。 |
| 协议 | 平台的协议，每个协议带默认端口。 |
| 字符集 | 终端用什么编码，见[终端字符集](#终端字符集)。 |
| 提权方式、提权命令 | 资产自己的账号怎样获得特权，见[提权](#提权)。 |
| 改密方法 | 怎样改密：`Shell`、`PowerShell`、`CLI`或平台对应的数据库。选“无”就不改密。 |
| 改密命令、推送命令、提示符、错误输出 | CLI方法用，见[网络设备](#网络设备)。 |
| 口令长度、字符种类、符号、排除字符 | 随机密码的规则，见[密码规则](#密码规则)。 |
| 改密、推送账号、收集账号 | Casvisor能在这个平台的资产上做什么，见[平台能做什么](#平台能做什么)。 |

有资产在用的平台不能删除，先给这些资产换平台。

## 终端字符集

**字符集**默认UTF-8。系统输出别的编码时改成对应的值，例如较老的中文系统或中文界面的交换机用GBK。浏览器里的SSH和Telnet终端会把资产发来的内容转成UTF-8，把用户输入的内容转成资产的字符集，屏幕、录像和[命令记录](../audit/commands.md)里都是正常的文字。可选UTF-8、GB18030、GBK、Big5、Shift_JIS、EUC-JP、EUC-KR、ISO-8859-1和windows-1252。经[SSH网关](./ssh-gateway.md)连接时，字符集由用户自己的SSH客户端决定。

## 提权

Casvisor通过资产**自己的账号**管理资产上的账号。这个账号本身没有特权时，平台的**提权方式**决定怎样获得：

- **sudo**（Linux、Unix、macOS）：账号能免密执行`sudo`就直接用；否则Casvisor用账号自己的密码执行`sudo -S`，密码从标准输入传入，不出现在命令行里。
- **su**：Casvisor在终端里执行**提权命令**，例如`su - root`，用资产的**提权密码**回答它的密码提示，确认已经是root后再继续。之后脚本作为一行输入发到这个终端，回显关闭。
- **enable**（网络设备）：登录后Casvisor发送**提权命令**，Cisco是`enable`，华为、H3C是`super`，用资产的**提权密码**回答它的密码提示。设备已经有特权时只会再显示一次提示符。

平台用`su`或`enable`时，资产页面会显示**提权密码**。它和资产的密码一样保存：用`credentialKey`加密，接口返回`***`，以`***`保存时保留原值，并且只用于原来的主机、端口、用户名和网域网关。

## 网络设备

CLI方法用资产自己的账号经SSH登录设备，打开一个Shell，平台要求时先提权，然后一行一行发送**改密命令**；创建账号时发送**推送命令**（为空则用改密命令）。`{username}`和`{password}`替换成账号和它的新密码。每发一行，Casvisor都等**提示符**出现（匹配输出末尾设备提示符的正则表达式），期间：

- 遇到`--More--`、`---- More ----`这样的分页提示回空格；
- 遇到密码提示回新密码，在提权命令之后回提权密码；
- 遇到`[Y/N]`回`y`，遇到`[confirm]`或带方括号默认值的提问（例如`Destination filename [startup-config]?`）回车。

某一行的输出匹配**错误输出**（例如Cisco的`% Invalid input detected`）时，改密就此停止，报错里带上这段输出，其中的密码打码。某一行30秒内等不到提示符也会停止。内置的命令是：

```text
Cisco IOS          terminal length 0
                   configure terminal
                   username {username} secret {password}
                   end
                   write memory

Huawei VRP         screen-length 0 temporary
                   system-view
                   aaa
                   local-user {username} password irreversible-cipher {password}
                   return
                   save

H3C Comware        screen-length disable
                   system-view
                   local-user {username} class manage
                   password simple {password}
                   return
                   save force

Juniper JunOS      set cli screen-length 0
                   configure
                   set system login user {username} authentication plain-text-password
                   commit and-quit
```

华为、H3C和Juniper的推送命令还会让新账号能用SSH登录：华为加`service-type ssh`和`privilege level 1`，H3C加`service-type ssh`和`network-operator`角色，Juniper用`operator`类。要按自己的设备改，例如换一个权限级别，或者用`copy running-config startup-config`代替`write memory`，复制平台后修改即可。

CLI方法只用于SSH资产；同一台设备的Telnet资产不能改密。网络设备的密码不能含空格、引号和`?`。

## 密码规则

Casvisor在一个平台的资产上设置的随机密码，长度是平台的**口令长度**（8到128），打开的每种字符至少有一个：大写字母、小写字母、数字和**符号**里填的符号。`0`、`O`、`1`、`l`这类容易看错的字母和数字从不使用，**排除字符**里的字符也不会用。内置平台的设置是：主机24位、符号`!#%+-=_.`；网络设备16位、数据库24位，符号都是`#%+-=_.`；Redis 32位。

## 平台能做什么

改密方法决定能做哪些事，平台可以分别关掉：

| 改密方法 | 改密 | 推送账号 | 收集账号 | 锁定账号 |
| --- | --- | --- | --- | --- |
| Shell | 能 | 能 | 能，macOS除外 | 能，用`usermod` |
| PowerShell | 能 | 能 | 能 | 能 |
| CLI | 能 | 能 | 不能 | 不能 |
| MySQL、PostgreSQL | 能 | 能，不授予任何权限 | 能 | 能 |
| SQL Server、Oracle、Redis | 能 | 不能 | 能 | 能 |
| MongoDB | 能 | 不能 | 能 | 不能 |

- **改密**：账号有**立即改密**和**自动改密**，风险账号也能改密。
- **推送账号**：账号有**推送到资产**，[账号模板](./accounts.md#账号模板)也能推送到这些资产。
- **收集账号**：每天的风险扫描会读取这些资产上的账号。

Shell、PowerShell和CLI方法经SSH连到资产，所以这些事只在SSH资产上做。
