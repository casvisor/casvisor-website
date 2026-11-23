---
title: "Network gateways"
description: "Reach assets in networks Casvisor cannot connect to directly, through an SSH jump host in that network or through an agent that connects out to Casvisor from inside it. Several gateways of a network domain share the connections and fail over to each other, with health checks."
---

Casvisor opens every connection to an asset itself, so normally it has to reach the asset's host and port. For servers in another data center, a branch office or a cloud VPC, a network gateway does that part: Casvisor connects through the gateway, and the gateway connects to the asset from inside its network.

## Using a gateway

Administrators add gateways under **Network gateways** (`/network-gateways`). Then, on an asset, pick the gateway in the **Network gateway** field. The default, **Direct connection**, uses no gateway.

Every connection to the asset goes through the gateway: the web terminal for SSH and Telnet, VNC, RDP, the [SSH gateway](./ssh-gateway.md) and patch management. The asset's host is resolved and connected to from the gateway, so it can be a private address or a name that only resolves inside that network. Permissions, command rules and the session list are the same as for any other asset.

A gateway belongs to an organization and can only be used by that organization's assets. Renaming a gateway updates the assets that use it, and a gateway that assets still use cannot be deleted. Turning **Is enabled** off makes connections through it fail with an error saying so.

There are two types, described below. Several gateways can also serve one network together, see [Network domains](#network-domains).

## SSH jump host

A server in the other network that Casvisor can log in to over SSH, the way JumpServer's domain gateways work. Nothing is installed on it.

| Field | Meaning |
| --- | --- |
| Host, Port | The jump host's SSH address, as Casvisor reaches it |
| Username, Password, Private key | The account Casvisor logs in with. Stored encrypted like asset credentials, and shown as `***` afterwards. |
| Fingerprint | The jump host's SSH host key, recorded on the first connection. A different key is refused afterwards; clear the field if the jump host was reinstalled. |

For each connection Casvisor logs in to the jump host and asks it to open a TCP connection to the asset (`direct-tcpip`, what `ssh -W` does), so its sshd needs `AllowTcpForwarding yes`, the default. **Test connection** saves the form and logs in once, showing the jump host's SSH version.

## Agent

For networks Casvisor cannot connect into at all, for example behind NAT. A small agent runs on any machine in that network, connects out to Casvisor and keeps the connection open; Casvisor reaches the assets through that connection.

The agent connects to Casvisor's web address over WebSocket, the same HTTPS address users open, so it gets out wherever HTTPS does and passes through the [reverse proxy](../operations/reverse-proxy.md) like the web terminal. Nothing has to be opened in the other direction. With `--server <host>:<port>` it connects to the [SSH gateway](./ssh-gateway.md) port instead, which needs `sshGatewayPort` set.

### Starting an agent

1. Add a network gateway with the type **Agent**, set **Allowed networks** (see below), and click **Generate token**.
2. The dialog shows the token and the command to start the agent with it:

   ```shell
   casvisor agent --server https://casvisor.example.com --token cva_... --fingerprint SHA256:...
   ```

   Copy it now. The token is shown only this once; Casvisor keeps only a hash of it.
3. Run the command on a machine in the other network. The agent is the same `casvisor` binary as the server, from the same release. With Docker:

   ```shell
   docker run -d --restart unless-stopped casbin/casvisor agent --server https://casvisor.example.com --token cva_... --fingerprint SHA256:...
   ```

   To keep the token out of the process list, put it in a file and pass `--token-file <path>`, or put it in the environment variable `CASVISOR_AGENT_TOKEN`, instead of `--token`.

`--fingerprint` is Casvisor's SSH host key, the one the SSH gateway uses, also shown on the **SSH keys** page when the SSH gateway is on. The agent checks it over WebSocket too, on top of HTTPS, and refuses to talk to a server with any other key, so nobody in between can pose as Casvisor and send it to your internal addresses.

The gateway's page shows whether the agent is **Online**, when it was last online, its version and the address it connects from. **Test connection** checks that the agent answers. If the connection drops, the agent reconnects by itself, waiting from 1 up to 30 seconds between attempts; Casvisor and the agent each notice a dead connection within about 45 seconds. While the agent is offline, connections to its assets fail with an error giving the time it was last online, and sessions that were open through it end.

### Tokens

Each agent gateway has one token at a time.

- **Regenerate token** issues a new one. The agent with the old token is disconnected at once and has to be started again with the new one.
- **Revoke token** removes it. The agent is disconnected at once and cannot connect again until a new token is generated; it keeps retrying and logs that the token was rejected.
- Disabling the gateway, changing its type to SSH jump host or deleting it also disconnects the agent. Changing the type also removes the token.

Only one agent can use a token. If a second one connects with the same token, it takes over and the first is disconnected.

### What the agent may do

The agent listens on no port and accepts nothing from the network. It only opens connections that Casvisor asks for over its own connection, and only to addresses in the gateway's **Allowed networks**: one CIDR such as `10.0.0.0/8`, or one IP address, per line. A host name is resolved by the agent and checked by its addresses. Leave the list empty to allow every address. Changes reach a connected agent right away.

The agent can be restricted further on its own machine with `--allow 10.1.0.0/16,10.2.0.5`; it then connects only to addresses that both lists allow, whatever is set in Casvisor.

## Network domains

Gateways that reach the same network can share its assets and stand in for each other. Give them the same **Network domain**, such as `dc-beijing`: an asset that uses any gateway of the domain then goes through the domain. SSH jump hosts and agents can be in the same domain; Casvisor Desktop devices can't be in one.

| Field | Meaning |
| --- | --- |
| Network domain | The domain of the gateway. Empty, the default, uses the gateway on its own, as before. |
| Priority | The gateways of a smaller number are used first; those of a larger number only when none of the smaller ones can be reached. |
| Weight | How the connections are shared among the gateways of the same priority: a gateway of weight 2 gets about twice as many as one of weight 1. |

For each connection, Casvisor tries the enabled gateways of the domain in that order, with the ones last found unhealthy at the end, and moves on to the next one when a gateway can't be reached: a jump host that doesn't answer or refuses the login, an agent that is offline, or an asset outside an agent's allowed networks. When a gateway is reached but the asset isn't, the error is returned right away, since the next gateway would most likely fail the same way. When no gateway of the domain can be reached, the error names each one with its reason. A disabled gateway is skipped, also when it is the one the asset names.

### Health checks

Casvisor checks every enabled gateway once a minute: it logs in to a jump host, and checks that an agent is online. Connections count too: a gateway that couldn't be reached is unhealthy until it is reached again. The list of gateways shows each one's status (**Healthy** with the time the login took, **Unhealthy**, or **Not checked** yet; online or offline for agents), its domain, priority and weight, and its last error with the time; the gateway's page also shows when it was last checked. The status is kept in memory and checked again after a restart.

`networkGatewayCheckInterval` in `conf/app.conf` sets the interval in seconds, 60 by default; `0` turns the checks off. Every check of a jump host is a login on it, which shows in its auth log.
