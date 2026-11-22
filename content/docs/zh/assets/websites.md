---
title: "网站"
seoTitle: "Casvisor：经反向代理访问内网网站，带权限和审计"
description: "Grafana、Jenkins、路由器管理页这类内网网站可以作为Web资产。每个网站经Casvisor的反向代理在自己的子域名上打开，和其他资产一样受权限、命令规则、撤销即断开和会话审计的约束。"
---

内网网站也可以是资产：监控面板、CI服务器、路由器或存储设备的管理页。用户从Casvisor打开它们，每个请求都经过Casvisor的反向代理：检查用户的权限，套用[命令规则](../audit/commands.md)，记录要紧的请求，权限没了就结束会话。

## 配置域名

每个网站在自己的子域名上打开，这样它的路径、Cookie和脚本都和在原地址上一样能用。选一个所有子域名都能到达Casvisor的域名，比如`web.casvisor.example.com`，写进`conf/app.conf`：

```ini
webAssetDomain = web.casvisor.example.com
```

然后：

1. 加一条泛解析DNS记录`*.web.casvisor.example.com`，指向Casvisor或它前面的反向代理。
2. 给反向代理配`*.web.casvisor.example.com`的泛域名证书，把这些主机名转给Casvisor，并保留`Host`头（见[放在反向代理后面](../operations/reverse-proxy.md#网站)）。

打开网站时用请求的协议（http或https），以反向代理在`X-Forwarded-Proto`里给的为准；想固定的话把协议写进配置，如`https://web.casvisor.example.com`。没设`webAssetDomain`时，打开Web资产会报错说明要先设置。

不要用网页界面自己主机名下的域名。网站的脚本能给自己主机名的上一级设Cookie，所以`casvisor.example.com`配`*.web.example.com`是对的，两者都用`*.casvisor.example.com`不行。

在一台机器上试用时，`webAssetDomain = web.localhost:19000`不用配DNS就能用：Chrome、Edge和Firefox会把所有`*.localhost`解析到本机。

## 添加网站

照常添加资产（见[资产](./assets.md)）：

| 字段 | 填什么 |
| --- | --- |
| 协议 | `Web`。 |
| 网址 | Casvisor访问这个网站用的地址，如`http://10.0.0.5:3000/`或`https://nas.lan/admin/`。路径和查询参数是打开后的第一页。只填主机名时用下面的端口，443走https，其他端口走http。 |
| 端口 | 按网址自动填。 |
| 用户名、密码 | 每个请求都以HTTP基本认证发给网站，用于这样保护的网站。网站有自己的登录页时留空，用户在网站上自己登录。 |
| 指纹 | https网站用，见下文。 |
| 网域网关 | 网站在别的网络里时，和其他资产一样经网关访问（见[网域网关](./network-gateways.md)）。 |

**测试连接**会打开第一页并显示状态，如`HTTP 200 OK, nginx`。Web资产的[系统账号](./accounts.md)就是基本认证的账号，权限决定用户用哪一个；Casvisor不能改它们的密码。

### 证书

系统信任、和主机名相符的证书直接接受，换证书后也一样。其他证书（如自签名证书）在Casvisor第一次连接时按公钥记录，之后换了公钥就拒绝，并在报错里给出新旧两个值。换证书是预期内的，就把资产的**指纹**清空。

## 打开网站

在Web资产上点**连接**会打开一个新窗口，建会话后跳到网站，地址形如`https://grafana--myorg.web.casvisor.example.com/`。子域名是`<资产>--<组织>`，两个名字有不能用在主机名里的字符时，改用由它们算出的固定编码。在[工作台](./connecting.md)里，Web资产的标签页上有**打开网站**按钮，同样在新窗口里打开。

新窗口经一个只能用一次、一分钟内有效的链接登入会话，拿到只属于这个子域名的Cookie。这个Cookie是Casvisor的，不会发给网站；网站自己的Cookie也只在它的子域名上。同一个浏览器再次打开同一个网站，会结束之前的会话。

会话在这些时候结束：

- 用户在网站子域名上访问`/__casvisor__/signout`退出，
- 超过`webSessionIdleMinutes`（默认30分钟）没人用（一直开着的WebSocket算在用），
- 管理员停止它，或用户的权限被撤销、到期、超出时段，和所有会话一样，
- Casvisor重启。

之后网站的页面会显示会话已结束和原因，用户从Casvisor重新打开即可。会话结束时，还在进行的请求和开着的WebSocket都会被切断。

## Casvisor在中间改了什么

为了让网站在子域名上能正常用，Casvisor：

- 发给网站的`Host`是网站自己的主机名，另带`X-Forwarded-For`、`X-Forwarded-Host`、`X-Forwarded-Proto`，说明用户的地址和子域名，
- 把`Origin`、`Referer`里的子域名改回网站自己的地址，让网站对请求来源的检查（包括WebSocket）能通过，
- 把跳到网站自己地址的重定向改回子域名，
- 去掉网站Cookie的`Domain`属性；用户经http访问Casvisor时，也去掉`Secure`，
- 去掉网站的`Strict-Transport-Security`和`Alt-Svc`头。

页面内容原样转发。网站如果把自己的完整地址写进页面，而不是按`X-Forwarded-Host`来，链接就会指向用户可能访问不到的原地址；网站有“公开地址”之类的设置时，把它设成子域名。

每个网站子域名下的`/__casvisor__/`路径归Casvisor，不会转给网站。

## 权限和命令规则

连接（Connect）决定能不能打开网站。另外两个动作在每个请求上检查：

- **上传**（Upload）：没有它，发送文件的请求（`multipart/form-data`）会被拒绝。
- **下载**（Download）：没有它，网站以附件形式（`Content-Disposition: attachment`）返回的响应会被拒绝。

这两项在会话开着时跟着权限走：授予或收回后，下一个请求就按新的来。复制、粘贴和转发对网站不起作用；转发仍然决定能不能经[SSH网关做端口转发](./ssh-gateway.md#端口转发到其他资产)到网站，那条路原样透传，不做上面这些检查。

[命令规则](../audit/commands.md)按`方法/路径?查询参数`匹配每个请求，如`POST /api/users/42/delete`。**拦截**（Block）拒绝请求并显示规则名，**告警**（Alert）放行并记录。比如`^(POST|PUT|PATCH|DELETE) `设成拦截，网站就只读；`^DELETE `设成告警，删除操作会被标出来。

## 记录什么

下面这些请求会记成会话的[命令记录](../audit/commands.md)，带时间、用户、客户端IP、HTTP状态码和耗时：

- 浏览器打开的页面（导航和框架），
- 可能改东西的请求，即GET、HEAD、OPTIONS以外的方法，
- WebSocket，状态码101，耗时是开着的时长，
- 命中命令规则的请求，以及因上传、下载权限被拒的请求。

页面自己加载的图片、脚本和读取接口直接转发，不记录。在[会话列表](../audit/sessions.md)里，在线Web会话的**监控**打开它的请求列表，每3秒刷新；已结束会话的**回放**显示同样的列表。Web会话没有录屏，也没有水印。
