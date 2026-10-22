---
title: "FAQ"
description: "Common questions about Casvisor: what a bastion host is, whether Casdoor is required, why sign-in fails, using your own SSH client, where passwords are kept, and how to get help."
---

## What is a bastion host?

A server that sits between people and the systems they administer, so that every connection goes through one place that decides who may connect and keeps a record. It is also called a jump server, jump host or, in larger products, privileged access management (PAM).

## Is Casdoor required?

Yes. Casvisor signs people in only through Casdoor and takes users and groups from it. Casdoor is open source as well, and can itself sign people in through LDAP, SAML, OIDC or social logins, so Casvisor can sit behind the directory you already have. See [Connect Casdoor](../getting-started/casdoor.md).

## Sign-in comes back with an error

- **Redirect URI not allowed**: add `https://<your Casvisor>/callback` to the Casdoor application's Redirect URLs.
- **A signature or token error after Casdoor sends you back**: Casvisor does not have the application's certificate. Use v1.110.0 or later, and check its log for `InitAuthConfig`: it fetches the certificate from Casdoor at start; see [About the certificate](../getting-started/casdoor.md#about-the-certificate).
- **Casvisor cannot reach Casdoor**: `casdoorEndpoint` has to work from the Casvisor server as well as from the browser. In Docker, `localhost` is the container itself.

## A user signs in but sees no assets

They are not an administrator and no enabled permission gives them **Connect** on anything, from their address, at this time. Check the permission's users and groups, its assets and tags, its client IPs and its time window. A new Casdoor group membership counts from their next sign-in.

## An RDP connection fails straight away

Casvisor connects to RDP itself, so the Casvisor server has to reach the asset's port 3389. The message in the tab says which step failed: a refused or timed-out connection points at the network or firewall, an authentication error at the account. Casvisor uses NLA; a server that only offers legacy RDP security is not supported.

## A Telnet connection fails straight away

Telnet goes through guacd. Check that guacd is running at `guacamoleEndpoint` and that guacd itself can reach the asset's host and port.

## Can I use my own SSH client, scp or VS Code?

Yes, for SSH assets, through the [SSH gateway](../assets/ssh-gateway.md): register your public key under **SSH keys**, then `ssh -p 2222 <asset>@<casvisor host>`. VS Code Remote also needs the **Forward** action in your permission. RDP and VNC are reached from the browser only.

## The SSH gateway answers "Permission denied (publickey)"

The gateway does not know the key your client offered. Check that the public key is added under **SSH keys** of the user you mean to be, and that your client offers that key, for example with `ssh -i ~/.ssh/id_ed25519`. The gateway takes no passwords. Once the key is accepted, any other refusal is printed as `casvisor: ...` with the reason.

## Where are the passwords of assets kept?

In Casvisor's MySQL database, encrypted when `credentialKey` is set and as they are when it is not; see [Encryption](../assets/assets.md#encryption). The API only returns them masked, and the browser never receives them. You can also leave the account empty so that each user types their own.

## Does Casvisor record sessions?

Not as a replay yet. The session list records who connected to what, from where and for how long; the [commands](../audit/commands.md) run in SSH sessions are kept; files moved and every change go into the operation log; and administrators can [watch SSH sessions live](../audit/sessions.md#watching-a-session-live). Recording and playback are on the [roadmap](./roadmap.md).

## Is there a hosted or enterprise version?

No. Casvisor is Apache-2.0 open source, and there is no paid edition.

## Where do I get help?

Open an issue on [GitHub](https://github.com/casvisor/casvisor/issues), or ask on [Discord](https://discord.gg/yfKcuHVAHB).
