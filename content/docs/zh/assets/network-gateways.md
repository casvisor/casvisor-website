---
title: "网域网关"
description: "经对方网络里的SSH跳板机，或经从内网主动连出来的agent，访问Casvisor直接连不到的资产。"
---

到资产的每一个连接都是Casvisor自己发起的，所以一般要求Casvisor能直接访问资产的主机和端口。对于另一个机房、分支机构或云上VPC里的服务器，就用网域网关：Casvisor经网关连接，网关在它所在的网络里再去连资产。

## 使用网关

管理员在**网域网关**（`/network-gateways`）里添加网关，然后在资产的**网域网关**一栏选择它。默认的**直连**表示不经网关。

到这个资产的所有连接都经网关：网页终端的SSH和Telnet、VNC、RDP、[SSH网关](./ssh-gateway.md)和补丁管理。资产的主机由网关那边解析和连接，所以可以填内网地址，或者只在那个网络里才解析得到的域名。权限、命令规则和会话列表和其他资产完全一样。

网关属于某个组织，只能给这个组织的资产用。网关改名时，用它的资产会跟着改；还有资产在用的网关不能删除。关掉**启用**后，经它的连接会直接报错说明网关已停用。

网关有两种类型。

## SSH跳板机

对方网络里一台Casvisor能用SSH登录的服务器，和JumpServer的网域网关一样，上面不用装任何东西。

| 字段 | 含义 |
| --- | --- |
| 主机、端口 | 跳板机的SSH地址，即Casvisor访问它用的地址 |
| 用户名、密码、私钥 | Casvisor登录用的账号。和资产的凭据一样加密保存，之后显示为`***`。 |
| 指纹 | 跳板机的SSH主机密钥，首次连接时记录，之后密钥变了会拒绝连接。跳板机重装过就清空它。 |

每个连接，Casvisor都会登录跳板机，让它打开一个到资产的TCP连接（`direct-tcpip`，也就是`ssh -W`做的事），所以跳板机的sshd要允许`AllowTcpForwarding yes`（默认就是）。**测试连接**会先保存表单，再登录一次，显示跳板机的SSH版本。

## Agent（反连）

适用于Casvisor根本连不进去的网络，例如在NAT后面。在那个网络里任意一台机器上运行一个小的agent，它主动连到Casvisor并保持连接，Casvisor经这条连接访问资产。

agent经WebSocket连Casvisor的网页地址，也就是用户打开的那个HTTPS地址，所以能上HTTPS的地方它就能连出来，也和网页终端一样能经过[反向代理](../operations/reverse-proxy.md)。反方向不用开放任何端口。用`--server <主机>:<端口>`时改连[SSH网关](./ssh-gateway.md)的端口，这时要设置`sshGatewayPort`。

### 启动agent

1. 添加一个类型为**Agent（反连）**的网域网关，设好**允许的网段**（见下文），点**生成令牌**。
2. 弹窗里会显示令牌和启动agent的命令：

   ```shell
   casvisor agent --server https://casvisor.example.com --token cva_... --fingerprint SHA256:...
   ```

   现在就复制下来。令牌只显示这一次，Casvisor只保存它的哈希。
3. 在对方网络里的一台机器上运行这条命令。agent就是服务端的同一个`casvisor`程序，用同一个版本。用Docker的话：

   ```shell
   docker run -d --restart unless-stopped casbin/casvisor agent --server https://casvisor.example.com --token cva_... --fingerprint SHA256:...
   ```

   不想让令牌出现在进程列表里，可以不用`--token`，把令牌写进文件再用`--token-file <路径>`，或者放在环境变量`CASVISOR_AGENT_TOKEN`里。

`--fingerprint`是Casvisor的SSH主机密钥（SSH网关用的同一个），开了SSH网关时在**SSH公钥**页面也能看到。走WebSocket时agent也在HTTPS之上再核对它，只和这个密钥的服务器通信，中间人没法冒充Casvisor，指使它去连你的内网地址。

网关页面会显示agent是否**在线**、最后在线时间、agent版本和来源IP。**测试连接**检查agent是否有响应。连接断了agent会自己重连，每次间隔从1秒逐步加到30秒；连接假死时，Casvisor和agent各自在大约45秒内发现。agent离线期间，到它那些资产的连接会报错并给出最后在线时间，经它正在进行的会话会结束。

### 令牌

每个Agent网关同时只有一个令牌。

- **重新生成令牌**：发一个新令牌，用旧令牌的agent立即断开，要用新令牌重新启动。
- **吊销令牌**：删除令牌，agent立即断开，在重新生成令牌之前都连不上；它会一直重试，并在日志里说明令牌被拒绝。
- 停用网关、把类型改成SSH跳板机或删除网关，也会断开agent。改类型还会删掉令牌。

一个令牌只能给一个agent用。同一个令牌的第二个agent连上来时，会顶掉第一个。

### agent能做什么

agent不监听任何端口，不接受来自网络的任何连接。它只建立Casvisor经它自己那条连接要求的连接，而且只连网关**允许的网段**里的地址：每行一个网段（CIDR，例如`10.0.0.0/8`）或一个IP。域名由agent解析，按解析出的地址检查。留空表示不限制。修改后会立即推送给在线的agent。

在agent自己的机器上还可以用`--allow 10.1.0.0/16,10.2.0.5`进一步限制，此时它只连两边都允许的地址，不管Casvisor里怎么设置。
