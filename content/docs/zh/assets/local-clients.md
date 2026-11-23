---
title: "本地客户端"
seoTitle: "Casvisor：在Xshell、WinSCP、mstsc、DBeaver、psql里打开资产"
description: "在资产列表里直接用你电脑上的客户端打开资产：SSH客户端（如Xshell）和SFTP客户端（如WinSCP）经SSH网关连接，远程桌面连接（mstsc）经Casvisor内置的远程桌面网关连接并由网关用存好的口令代填Windows登录，DBeaver、Navicat、mysql、psql经数据库代理连接。Casvisor Launcher（助手）会挑你装了的客户端打开。"
---

除了浏览器，资产也可以直接从资产列表用你电脑上的客户端打开。在**资产**页面上，每个资产都有一个**用本地客户端打开**按钮，点开是适合这个资产的菜单。菜单里的每个链接和命令都带一个令牌，代表你和你连接时用的账号，所以不用先[登记公钥](./ssh-gateway.md#登记公钥)。SSH和RDP用的是一次性令牌：只能用一次，两分钟内有效。数据库客户端会反复重连，用的是几小时内有效的[数据库令牌](#数据库客户端)。

| 资产 | 菜单项 | 作用 |
| --- | --- | --- |
| SSH | **用SSH客户端打开** | 打开`ssh://<令牌>@<主机>:<端口>`，Xshell、SecureCRT、Termius等能处理`ssh://`链接的客户端会接手 |
| SSH | **用SFTP客户端打开** | 用WinSCP、FileZilla等能处理`sftp://`链接的客户端打开`sftp://<令牌>@<主机>:<端口>` |
| SSH | **复制一次性SSH命令** | 复制`ssh -p 2222 <令牌>@casvisor.example.com`，在任意终端里用 |
| RDP | **用远程桌面连接（mstsc）打开** | 下载一个用mstsc打开的`.rdp`文件，见[远程桌面连接](#远程桌面连接) |
| MySQL、PostgreSQL | **用助手（Casvisor Launcher）打开** | 打开`casvisor://launch?type=db&...`链接，由[助手](#助手casvisor-launcher)交给数据库客户端，见[数据库客户端](#数据库客户端) |
| MySQL、PostgreSQL | **复制 mysql 命令**、**复制 psql 命令** | 复制`mysql -h casvisor.example.com -P 3307 -u <令牌> -p<令牌> app`或`psql "postgresql://<令牌>:<令牌>@casvisor.example.com:5433/app?sslmode=prefer"` |
| MySQL、PostgreSQL | **复制 JDBC 连接串** | 复制`jdbc:mysql://...?user=<令牌>&password=<令牌>&sslMode=PREFERRED`或`jdbc:postgresql://...`，用于DataGrip、IntelliJ等JDBC工具 |
| MySQL、PostgreSQL | **复制 DBeaver 连接命令**、**下载 DBeaver 连接** | 复制`dbeaver -con "driver=mysql|host=...|user=<令牌>|password=<令牌>|..."`，在DBeaver里直接打开这个连接；或下载包含这个连接的`data-sources.json` |
| 其他 | **复制一次性端口转发命令** | 复制`ssh -p 2222 -N -L 13389:win-01:3389 <令牌>@casvisor.example.com`，见[端口转发到其他资产](./ssh-gateway.md#端口转发到其他资产) |
| SSH、RDP | **用助手（Casvisor Launcher）打开** | 把`casvisor://`链接交给[助手](#助手casvisor-launcher)，由它用你装了的SSH、SFTP或远程桌面客户端打开 |

菜单里也保留了用已登记公钥的命令，这些命令不会过期。SSH相关的菜单项要开启[SSH网关](./ssh-gateway.md)；远程桌面相关的菜单项要用HTTPS打开网页界面才会出现；数据库相关的菜单项要为资产的协议开启[数据库代理](#数据库客户端)。

## SSH和SFTP客户端

令牌就是SSH用户名。客户端用SSH的`none`方式登录（常见客户端都会先试这种方式），网关把它带到签发令牌时的资产和账号，所以客户端不需要口令和密钥。之后和用公钥登录一样：重新检查权限，[登录规则](../access-control/login-rules.md)照常生效，交互式shell会录像并按[命令规则](../audit/commands.md)检查，文件传输受上传和下载权限控制。

用过的令牌或超过两分钟的令牌会被拒绝，显示`Permission denied`，重新打开菜单取一个新的即可。端口转发用的令牌只能转发端口，而且只能转发到它自己的资产，用它开shell会被拒绝。

## 远程桌面连接

Casvisor内置了一个远程桌面网关，在网页界面地址的`/remoteDesktopGateway/`下。**用远程桌面连接（mstsc）打开**会下载`<资产名>.rdp`，请在两分钟内打开。文件里把Casvisor设为网关（`gatewayhostname`），带上令牌作为网关访问令牌，并填好账号的用户名。之后mstsc经Casvisor连到资产，资产有[网域网关](./network-gateways.md)时经由它连接。

- 需要资产的**连接**和**端口转发**（Forward）权限。
- 网关会告诉mstsc哪些东西不带进会话：没有复制和粘贴两项权限就关剪贴板，没有上传和下载两项权限就关本地磁盘，打印机、串口和即插即用设备一律关闭。
- 文件没有签名，mstsc连接前会提示发布者未知。
- mstsc只连证书可信的HTTPS网关，所以只有用HTTPS打开网页界面时才显示这些菜单项。放在反向代理后面时，代理要放行网关的请求，见[放在反向代理后面](../operations/reverse-proxy.md#远程桌面网关)。
- 会话在[会话](../audit/sessions.md)列表里以`tunnel`模式列出，管理员可以停止，收回端口转发权限时会断开，并以`rdp-gateway`写入[操作日志](../audit/operation-logs.md)。不录像，也不按命令规则检查。

### 账号存了口令时

你连接时用的账号在Casvisor里存了口令时，由Casvisor用这个口令登录Windows，用户既看不到也不用输入口令。这样普通用户也能连只有管理员知道口令的服务器。

- `.rdp`文件里关掉了mstsc的CredSSP（`enablecredsspsupport:i:0`），mstsc不再询问口令，在网关的HTTPS通道里和Casvisor走TLS。
- Casvisor连资产时，资产要求网络级别身份验证（NLA，即CredSSP）就用存好的口令做NLA，否则走TLS，并在登录时把账号和口令交给Windows。资产的证书在第一次连接时固定，和浏览器里一样；证书变了会被拒绝，清掉资产的指纹后才能再连。
- mstsc看到的是Casvisor自己的证书（自签名，存在数据库里），所以第一次会提示无法验证远程计算机的身份。勾选**不再询问我是否连接到此计算机**再点**是**即可；用[助手](#助手casvisor-launcher)打开时，助手会让mstsc信任这个证书，不会再问。
- Casvisor登录不了时（例如存的口令不对），会在日志里记下原因，然后像下面那样把mstsc直接转给资产。要求NLA的资产这时会拒绝mstsc，mstsc会提示。
- 这种方式下Casvisor能看到RDP的明文，但目前还不录像。

账号没有存口令时，RDP数据原样转发，在mstsc和资产之间端到端加密，Windows口令由mstsc自己询问，要用你知道的账号登录。

在`conf/app.conf`里设置`disableRdGateway = true`可以关闭这个网关。`isDemoMode = true`时它总是关闭的。

## 数据库客户端

Casvisor内置了一个数据库代理，让你电脑上的DBeaver、Navicat、DataGrip、`mysql`、`psql`等客户端经它连MySQL（以及MariaDB）和PostgreSQL资产。Casvisor为MySQL客户端和PostgreSQL客户端各监听一个端口，自己实现这两种协议；不设端口就不开：

```ini
dbProxyMysqlPort = 3307
dbProxyPostgresqlPort = 5433
```

### 登录

客户端用**数据库令牌**登录，用户名和口令都填它。**用本地客户端打开**菜单里的数据库相关项会为你签发令牌（对应这个资产和你连接时用的账号），并放进复制出的内容里。数据库令牌不是用一次就作废：数据库客户端会反复重连（开新标签页、查元数据、超时重连），所以在过期之前可以连任意多次，有效期是`dbProxyTokenHours`（默认8小时），过期后重新打开菜单取一个新的即可。同一个页面上签发的令牌，剩余有效期超过一小时时菜单会接着用。

**账号管理 → 数据库令牌**列出你还有效的令牌：资产、签发时间、过期时间、最近一次使用的时间和IP，以及它打开着几个会话。**撤销**删除令牌并断开它打开的会话。管理员能看到并撤销本组织所有人的令牌。令牌存在内存里，Casvisor重启后全部失效。

Casvisor按客户端默认用的口令方式校验令牌，客户端不用做任何设置：

- **MySQL**：MySQL 8客户端默认的`caching_sha2_password`，或者客户端要求的`mysql_native_password`（老客户端、`--default-auth=mysql_native_password`）。客户端用其他方式时，Casvisor让它改用`mysql_native_password`。
- **PostgreSQL**：SCRAM-SHA-256，libpq（`psql`）、JDBC驱动、pgx和DBeaver都支持。

每次连接都会重新检查你能否以这个账号连接该资产，按连接方式**数据库客户端**检查[连接方式规则](../access-control/connect-rules.md)，按登录方式**数据库客户端**检查[登录规则](../access-control/login-rules.md)，不通过时以数据库错误的形式给出原因：MySQL是`ERROR 1045`，PostgreSQL是`FATAL`。登录规则要求复核时，客户端一直等到管理员处理；批准之后，这个令牌从同一个客户端IP连接不再询问。登录规则要求两步验证时，数据库客户端没法输入动态码，连接被拒。

### TLS

客户端要求TLS时就用TLS连代理，`mysql`、`psql`和JDBC驱动默认都会要求（`sslmode=prefer`、`sslMode=PREFERRED`），否则用明文。证书是`dbProxyCertFile`和`dbProxyKeyFile`；不设时用Casvisor提供HTTPS的证书，再没有就在启动时生成一个自签名证书，客户端只要不要求校验证书（`sslmode=verify-full`、`sslMode=VERIFY_IDENTITY`）就会接受。Casvisor到数据库是另一条连接，和[控制台](./databases.md#连接和tls)一样使用TLS和固定的公钥，资产有[网域网关](./network-gateways.md)时经由它连接。

### 检查和记录什么

每条连接是资产的一个[会话](../audit/sessions.md)，列出时带客户端的名字（例如`mysql 8.4.3`、`DBeaver`或PostgreSQL的`application_name`），模式是`gateway`。**旁观**实时显示它执行的语句，结束后用**回放**查看，**停止**断开客户端。令牌被撤销或过期、收回连接权限、用户被删除或禁用时，会话也会结束。

客户端发来的内容先经过检查再发给数据库：

- **MySQL**：`COM_QUERY`的文本（客户端一次发多条语句时逐条检查）和`COM_STMT_PREPARE`的文本；切换数据库（`COM_INIT_DB`）记成``USE `db` ``。
- **PostgreSQL**：简单查询（逐条检查其中每条语句），以及扩展协议的`Parse`消息，DBeaver、JDBC和pgx执行每条语句都会发它。

每条都是一条[命令记录](../audit/commands.md)，带结果：返回或影响的行数、耗时和错误信息。预编译语句在预编译时记录，之后每次执行的行数累加到这条记录上。[命令规则](../audit/commands.md)和控制台一样生效：

- **拦截**：语句不发给数据库，客户端收到错误，MySQL是`ERROR 1227 (42000): casvisor: the statement is blocked by the rule: no-drop`，PostgreSQL是`ERROR: casvisor: the statement is blocked by the rule: no-drop`（SQLSTATE 42501）。连接还能接着用。在PostgreSQL事务里，和其他错误一样，事务进入失败状态。
- **复核**：语句一直等到另一位管理员在**命令复核**里批准；等待时`psql`会显示一条提示，其他客户端就是一直等。被拒绝的语句和被拦截的一样收到错误。
- **告警**：语句照常执行，记录上带着规则。

`mysql`和`psql`里按Ctrl+C可以中止：`mysql`用Casvisor给它的连接ID发`KILL QUERY`，`psql`用Casvisor给它的密钥发取消请求，Casvisor再转成对数据库服务器的取消，或者撤回还在等待复核的语句。

不转发的：MySQL连接中途换用户（`COM_CHANGE_USER`）、binlog和从库相关的命令、`LOAD DATA LOCAL INFILE`（代理不提供这个能力）、PostgreSQL的复制连接和按OID的函数调用（FunctionCall）。`COPY ... FROM STDIN`发送的数据照常转发，`COPY`语句本身会被检查。

### 菜单

MySQL、PostgreSQL资产的**用本地客户端打开**菜单里有：

- **用助手（Casvisor Launcher）打开**：打开一个链接，由你电脑上的[助手](#助手casvisor-launcher)交给本机的数据库客户端：

  ```
  casvisor://launch?type=db&dbtype=mysql|postgresql&host=<代理主机>&port=<代理端口>&user=<令牌>&password=<令牌>&database=<库>&name=<资产名>
  ```

- **复制 mysql 命令**或**复制 psql 命令**，在终端里用。
- **复制 JDBC 连接串**，用于DataGrip、IntelliJ等JDBC工具。
- **复制 DBeaver 连接命令**：`dbeaver -con "driver=mysql|name=db-01 (Casvisor)|host=...|port=3307|database=app|user=<令牌>|password=<令牌>|savePassword=true|connect=true"`，DBeaver的命令行用它添加并打开这个连接。
- **下载 DBeaver 连接**：包含这个连接的`data-sources.json`，放进DBeaver的项目里即可。

其中的主机是`dbProxyHost`，不设时用`sshGatewayHost`，再不设用网页界面的主机名。数据库是资产的**数据库名**，客户端可以改。

MySQL的握手包在Casvisor知道要连哪个资产之前就发出了，所以MySQL客户端一开始看到的服务器版本是`dbProxyMysqlVersion`（默认`8.0.40-casvisor`），`SELECT VERSION()`返回的才是真实版本。驱动按版本决定行为时（例如只连MariaDB的MariaDB驱动），设置这一项。

代理只支持MySQL和PostgreSQL。其他数据库用[控制台](./databases.md)打开，或者用[端口转发](./ssh-gateway.md#端口转发到其他资产)（不记录）。演示模式下代理不开。

## 助手（Casvisor Launcher）

助手是一个Windows、Linux和macOS都能用的小程序，把**用助手（Casvisor Launcher）打开**这几个菜单项的`casvisor://`链接交给你装了的客户端，不用依赖系统把`ssh://`链接交给哪个程序。从[最新发布](https://github.com/casvisor/casvisor/releases/latest)下载`casvisor-launcher_<系统>_<架构>`，菜单最下面的**没装助手？下载**也指向这里。浏览器没法判断装没装助手，点了菜单项没有反应，就先装上助手。

不带参数运行一次即可：它把自己登记为`casvisor://`链接的处理程序，按找到的客户端写好配置文件，并提示两者的位置。程序不要挪地方，挪了就再运行一次；`casvisor-launcher uninstall`取消登记。

- **Windows**：登记在当前用户的`HKEY_CURRENT_USER\Software\Classes\casvisor`下，不需要管理员权限。
- **Linux**：在`~/.local/share/applications`里放一个`casvisor-launcher.desktop`，用`xdg-mime`设为`x-scheme-handler/casvisor`的处理程序。
- **macOS**：在`~/Applications`里放一个接收链接的小程序`Casvisor Launcher.app`，再交给助手处理。

它按链接的类型挑客户端，配置文件没有指定时按下面的顺序用第一个找到的：

| 类型 | Windows | Linux | macOS |
| --- | --- | --- | --- |
| `ssh` | Xshell、SecureCRT、PuTTY、在Windows终端或控制台窗口里运行的OpenSSH | 在终端里运行的OpenSSH、PuTTY | 在“终端”里运行的OpenSSH |
| `sftp` | WinSCP、FileZilla | FileZilla | FileZilla |
| `rdp` | 远程桌面连接（mstsc） | 在终端里运行的FreeRDP | 打开`.rdp`文件的应用，例如Windows App |
| `db` | 在终端里运行的`mysql`或`psql`、DBeaver | 在终端里运行的`mysql`或`psql`、DBeaver | 在“终端”里运行的`mysql`或`psql`、DBeaver |

`rdp`类型由助手把`.rdp`文件写到临时目录，一分钟后删掉。远程计算机名写成`<资产名>.casvisor`；在Windows上，Casvisor代填口令时，助手只为这个名字让mstsc信任Casvisor的证书，所以mstsc只会问一次发布者未知。

配置文件在Windows上是`%APPDATA%\casvisor-launcher\config.json`，Linux上是`~/.config/casvisor-launcher/config.json`，macOS上是`~/Library/Application Support/casvisor-launcher/config.json`：

```json
{
  "ssh": "putty",
  "sftp": "",
  "rdp": "",
  "mysql": "dbeaver",
  "postgresql": "",
  "paths": {
    "putty": "D:\\Tools\\putty.exe",
    "winscp": "C:\\Program Files (x86)\\WinSCP\\WinSCP.exe"
  }
}
```

`ssh`、`sftp`、`rdp`、`mysql`、`postgresql`按名字选各类型用的客户端：`xshell`、`securecrt`、`putty`、`openssh`、`winscp`、`filezilla`、`mstsc`、`freerdp`、`mysql`、`psql`、`dbeaver`，留空就用第一个找到的。`paths`指定客户端的位置，还可以指定`terminal`（Windows终端或Linux上的终端程序）；没写在这里的客户端到常见的安装目录和`PATH`里找。

链接是这样的，令牌放在用户名或口令的位置：

```
casvisor://launch?type=ssh&host=casvisor.example.com&port=2222&user=<令牌>&name=web-01
casvisor://launch?type=sftp&host=casvisor.example.com&port=2222&user=<令牌>&name=web-01
casvisor://launch?type=rdp&host=casvisor.example.com&port=443&token=<令牌>&name=win-01&username=Administrator&autologon=1&certhash=<sha256>
casvisor://launch?type=db&dbtype=mysql&host=<代理主机>&port=<代理端口>&user=<令牌>&password=<令牌>&database=<库名>&name=db-01
```

任何网页都能打开`casvisor://`链接，所以助手只接受由Casvisor会放进去的字符组成的主机名、端口、令牌和库名，不经过shell启动客户端，其他情况一律拒绝并提示原因。

## 令牌

令牌由`POST /api/add-client-token?assetId=<组织>/<名称>&kind=<ssh|tunnel|rdp|db>&account=<账号>`为当前登录的用户签发。用户必须有以这个账号连接该资产的**连接**权限，`tunnel`和`rdp`还要有**端口转发**权限。`rdp`类型的返回值里还有是否由Casvisor代填口令（`autoLogon`），以及mstsc这时看到的证书的SHA-256指纹（`certHash`）。令牌存在内存里，重启后失效。一次性令牌用过一次就删除；数据库令牌在`dbProxyTokenHours`（默认8小时）内有效，由`GET /api/get-database-tokens`列出，`POST /api/revoke-database-token?tokenId=<id>`撤销。

mstsc检查远程计算机的证书时会先断开第一个连接，再用同一个令牌重新连接。所以`rdp`令牌的连接如果在30秒内、远程桌面还没开始时就断了，令牌在过期前还能再用。
