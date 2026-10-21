---
title: "对接Casdoor"
description: "Casvisor通过Casdoor登录。为它建一个组织和应用，设置回调地址和证书，再把Client ID和Client secret填进app.conf。"
---

Casvisor没有用户表，也没有登录表单。用户通过[Casdoor](https://casdoor.ai)以OAuth 2.0登录，Casvisor从Casdoor返回的令牌里读出用户名、组织、用户组和是否管理员。因此Casdoor登录时支持的一切，例如多因素认证、通行密钥、LDAP、SAML，以及GitHub、Google、微信等第三方登录，Casvisor不用另外配置就能用。

## 在Casdoor里

1. **组织。** 为使用Casvisor的人建一个组织，或者用现有的。这个组织的用户才能登录；组织的管理员负责管理Casvisor。
2. **用户组**（可选）。建`ops`、`dba`这样的用户组并把用户加进去。Casvisor的[权限](../access-control/permissions.md)可以把资产授权给整个用户组。
3. **应用。** 在这个组织里建一个应用，例如`app-casvisor`：
   - **Redirect URLs**：加上`https://casvisor.example.com/callback`，用户访问Casvisor的地址是什么就写什么。本地测试时是`http://<你的IP>:19000/callback`。
   - **Cert**：记下它用的是哪张证书，见下面的[关于证书](#关于证书)。
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

`casdoorEndpoint`是Casdoor的地址，末尾不带斜杠。这个地址既要用户的浏览器能打开（登录时会跳过去），也要Casvisor服务器能访问（它要在那里用登录码换令牌）。改完重启Casvisor。前端读的也是这四项，不需要重新编译前端。

## 关于证书

Casvisor用编译在程序里的公钥`controllers/token_jwt_key.pem`验证Casdoor令牌的签名。这个文件是Casdoor在v4.10以前自带的`cert-built-in`证书的公钥，那时所有Casdoor用的都是同一对密钥。

- **v4.10以前的Casdoor**，应用用的是`cert-built-in`：直接可用。
- **v4.10及以后的Casdoor**，或者应用用的是自己的证书：在Casdoor的**证书**里打开这张证书，把它的**Certificate**（`-----BEGIN CERTIFICATE-----`那一段）复制到`controllers/token_jwt_key.pem`，再[从源码编译Casvisor](./source.md)。从v4.10起，每个Casdoor第一次启动时都会生成自己的`cert-built-in`，所以新装的Casdoor都属于这种情况。公钥对不上时，登录会报签名错误。

把证书改成从配置读取，让Docker镜像能配任意Casdoor使用，是[路线图](../more/roadmap.md)上的第一项。

## 谁是管理员

登录的用户在Casdoor里打开了**Is admin**，或者属于Casdoor的`built-in`组织，就是Casvisor的管理员。管理员能看到管理页面，能连所有资产。其他人只有工作台，也只能看到权限给他们的资产。见[用户和管理员](../access-control/users-and-admins.md)。
