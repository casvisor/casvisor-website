---
title: "放在反向代理后面"
description: "用nginx等反向代理为Casvisor提供HTTPS：放行连接用的WebSocket，调长超时，并设置X-Forwarded-For，让权限看到真实的客户端IP。"
---

Casvisor本身只提供HTTP。生产环境里请放在一个终结HTTPS的反向代理后面，注意三件事：

1. **WebSocket。** 每个连接都跑在`/api/`下的WebSocket上：`get-asset-ssh`、`get-asset-vnc`和`get-asset-tunnel`（RDP和Telnet）。代理要透传`Upgrade`和`Connection`头。
2. **超时。** 终端可能很久没有输入。调长代理的读超时，否则空闲会话会在它的默认超时（常见是60秒）后被断开。
3. **客户端IP。** 权限可以限定[来源IP](../access-control/permissions.md#客户端ip)。请求来自本机或内网地址时，Casvisor取`X-Forwarded-For`的最后一项，所以代理必须把它设成代理收到连接时看到的地址。

## nginx

```nginx
server {
    listen 443 ssl;
    server_name casvisor.example.com;

    ssl_certificate     /etc/ssl/casvisor.example.com.pem;
    ssl_certificate_key /etc/ssl/casvisor.example.com.key;

    location / {
        proxy_pass http://127.0.0.1:19000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 1d;
        proxy_send_timeout 1d;
    }
}
```

`X-Forwarded-For $remote_addr`会覆盖客户端自己发来的值，用户没法自己指定地址。如果nginx前面还有一层代理或负载均衡，就用那一层传过来的地址（例如用nginx的`real_ip`模块），并保证Casvisor读的最后一跳是它。

## Casdoor的回调地址

Casdoor会把用户送回他们打开Casvisor时的地址，所以要把对外的地址`https://casvisor.example.com/callback`加进应用的**Redirect URLs**。

## 不要对外开放

- 有了代理以后，Casvisor自己的19000端口。直接从内网地址访问它的请求可以自己伪造`X-Forwarded-For`。
- guacd的4822端口，它没有认证。
- MySQL。
