---
title: "对接Casdoor"
description: "让Casvisor不用自带账号，改为通过Casdoor登录：为它建一个组织和应用，设置回调地址，再把Client ID和Client secret填进app.conf。"
---

Casvisor开箱用自己的账号登录（见[用户和管理员](../access-control/users-and-admins.md)）。想和你的其他应用单点登录，或者需要自带账号没有的功能时，再对接[Casdoor](https://casdoor.ai)。

对接Casdoor后，Casvisor不再保存自己的账号。用户通过Casdoor以OAuth 2.0登录，Casvisor从Casdoor返回的令牌里读出用户名、组织、用户组和是否管理员。因此Casdoor登录时支持的一切，例如多因素认证、通行密钥、LDAP、SAML，以及GitHub、Google、微信等第三方登录，Casvisor不用另外配置就能用。

## 在Casdoor里

1. **组织。** 为使用Casvisor的人建一个组织，或者用现有的。这个组织的用户才能登录；组织的管理员负责管理Casvisor。
2. **用户组**（可选）。建`ops`、`dba`这样的用户组并把用户加进去。Casvisor的[权限](../access-control/permissions.md)可以把资产授权给整个用户组。
3. **应用。** 在这个组织里建一个应用，例如`app-casvisor`：
   - **Redirect URLs**：加上`https://casvisor.example.com/callback`，用户访问Casvisor的地址是什么就写什么。本地测试时是`http://<你的IP>:19000/callback`。
   - **Cert**：用哪张证书都可以，Casvisor会自己去取，见下面的[关于证书](#关于证书)。
   - 除非谁打开页面都可以注册，否则关掉**Enable signup**。
4. 复制应用的**Client ID**和**Client secret**。

## 在app.conf里

```ini
casdoorEndpoint = https://door.example.com
clientId = 0ba528121ea87b3eb54d
clientSecret = 04f4ca1c0d8bf9f3bb7a0ac6ab6c5a1cb4fd4c62
casdoorOrganization = "my-org"
casdoorApplication = "app-casvisor"
```

正是设置了`casdoorEndpoint`，Casvisor才从自带账号切换到Casdoor。它是Casdoor的地址，末尾不带斜杠。这个地址既要用户的浏览器能打开（登录时会跳过去），也要Casvisor服务器能访问（它要在那里用登录码换令牌）。改完重启Casvisor。前端读的也是这四项，不需要重新编译前端。这几项也都可以用同名环境变量传入，例如`docker run -e casdoorEndpoint=https://door.example.com ...`，环境变量优先于文件。

## 关于证书

Casvisor需要应用签发令牌所用证书的公钥。从v1.110.0起，它在启动时自己去Casdoor取：先查应用，看应用用的是哪张证书，再下载这张证书；这一步什么都没拿到时，改从Casdoor的`/.well-known/jwks`里取。不需要任何配置，在Casdoor里给应用换了证书，重启Casvisor即可。

如果Casvisor启动时连不上Casdoor，它会在后台每10秒重试一次。在连上之前，只有用Casdoor v4.10以前那把公开的`cert-built-in`密钥签名的令牌能通过，所以这段时间里登录通常会报签名错误。如果一直不恢复，在Casvisor的日志里找`InitAuthConfig`。

v1.110.0以前的版本只认那把旧密钥，配v4.10及以后新装的Casdoor时谁都登录不了，请升级。

## 谁是管理员

登录的用户在Casdoor里打开了**Is admin**，或者属于Casdoor的`built-in`组织，就是Casvisor的管理员。管理员能看到管理页面，能连所有资产。其他人只有工作台，也只能看到权限给他们的资产。见[用户和管理员](../access-control/users-and-admins.md)。

## 从自带账号迁过来

资产、权限和命令规则都属于某个组织。用自带账号时，这个组织由`casdoorOrganization`决定，没改过就是`casvisor`。切换到Casdoor后，用户看到的是他自己所在的Casdoor组织的资产。所以如果打算以后改用Casdoor，一开始就把`casdoorOrganization`设成那个Casdoor组织的名字，或者把Casdoor里的组织命名为`casvisor`。

设置了`casdoorEndpoint`时不使用自带账号。它们仍留在数据库里，把`casdoorEndpoint`清空就又能用了。
