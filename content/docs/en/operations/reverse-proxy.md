---
title: "Behind a reverse proxy"
description: "Put Casvisor behind nginx or another reverse proxy for HTTPS: pass WebSockets through for the connections, keep long timeouts, and set X-Forwarded-For so permissions see the real client IP."
---

Casvisor serves plain HTTP. In production, put it behind a reverse proxy that terminates HTTPS. Three things matter:

1. **WebSockets.** Every connection runs over a WebSocket under `/api/`: `get-asset-ssh`, `get-asset-rdp`, `get-asset-vnc`, `get-asset-tunnel` (Telnet) and `get-session-monitor` (watching a session live). The proxy must pass the `Upgrade` and `Connection` headers through.
2. **Timeouts.** A terminal can sit idle for a long time. Raise the proxy's read timeout, or idle sessions are cut off after its default, often 60 seconds.
3. **The client IP.** Permissions can be limited to [client IPs](../access-control/permissions.md#the-client-ip). When a request comes from a loopback or private address, Casvisor takes the last entry of `X-Forwarded-For`, so the proxy must set it to the address it received the connection from.

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

`X-Forwarded-For $remote_addr` replaces whatever the client sent, so a user cannot pick their own address. If there is another proxy or a load balancer in front of nginx, use the address that one passes on, for example with nginx's `real_ip` module, and keep the last hop the one Casvisor reads.

## Casdoor's redirect URL

Casdoor sends people back to the address they opened Casvisor at, so add the public one, `https://casvisor.example.com/callback`, to the application's **Redirect URLs**.

## The SSH gateway

The [SSH gateway](../assets/ssh-gateway.md) is SSH on its own port, 2222 in the Docker images, not HTTP, so it does not go through nginx. Publish that port directly, or pass it through a TCP proxy such as nginx's `stream` module or a cloud load balancer.

Casvisor checks [client IPs](../access-control/permissions.md#the-client-ip) against the address the SSH connection comes from. Behind a TCP proxy that is the proxy's address, so permissions limited by client IP would see the proxy, not the user. Prefer publishing the port directly, or use a load balancer that keeps the client's address.

If SSH is reached at another name than the web UI, set `sshGatewayHost` to it, so the commands users copy are right.

## Do not publish

- Casvisor's own port 19000, once the proxy is in front. A request that reaches it directly from a private address could set `X-Forwarded-For` itself.
- guacd's port 4822, which has no authentication.
- MySQL.
