---
title: "FAQ"
description: "Common questions about Casvisor: what a bastion host is, whether Casdoor is required, the first password, why sign-in fails, using your own SSH client, where passwords and recordings are kept, and how to get help."
---

## What is a bastion host?

A server that sits between people and the systems they administer, so that every connection goes through one place that decides who may connect and keeps a record. It is also called a jump server, jump host or, in larger products, privileged access management (PAM).

## Is Casdoor required?

No. Out of the box Casvisor keeps its own accounts, with groups and administrators; see [Users and administrators](../access-control/users-and-admins.md). Connect [Casdoor](../getting-started/casdoor.md), which is open source as well, when you want single sign-on, MFA, or sign-in through LDAP, SAML, OIDC or social logins, so that Casvisor sits behind the directory you already have.

## What is the first password?

On first start Casvisor creates the administrator `admin` and prints a random password in its log: `docker logs casvisor` in Docker. Set `adminPassword` before the first start to choose it instead. It is only created while there are no users at all. If you lose it on a fresh install, remove the database, the `casvisor-db` volume in Docker, and start again; once there are other administrators, any of them can set a new password under **Users**.

## I forgot the password of a built-in account

An administrator sets a new one under **Users**. After 5 wrong passwords, sign-in for that user from that address is refused for 15 minutes.

## Sign-in through Casdoor comes back with an error

- **Redirect URI not allowed**: add `https://<your Casvisor>/callback` to the Casdoor application's Redirect URLs.
- **A signature or token error after Casdoor sends you back**: Casvisor does not have the application's certificate. Use v1.110.0 or later, and check its log for `InitAuthConfig`: it fetches the certificate from Casdoor at start; see [About the certificate](../getting-started/casdoor.md#about-the-certificate).
- **Casvisor cannot reach Casdoor**: `casdoorEndpoint` has to work from the Casvisor server as well as from the browser. In Docker, `localhost` is the container itself.

## A user signs in but sees no assets

They are not an administrator and no enabled permission gives them **Connect** on anything, from their address, at this time. Check the permission's users and groups, its assets and tags, its client IPs and its time window. A new Casdoor group membership counts from their next sign-in.

## An RDP connection fails straight away

Casvisor connects to RDP itself, so the Casvisor server has to reach the asset's port 3389. The message in the tab says which step failed: a refused or timed-out connection points at the network or firewall, an authentication error at the account. Casvisor uses NLA; a server that only offers legacy RDP security is not supported.

## A Telnet connection fails straight away

Casvisor connects to Telnet itself, so the Casvisor server, or the asset's network gateway, has to reach the asset's host and port, 23 by default. Casvisor types the stored account at the device's `login:` and `password:` prompts; a device with other prompts gets nothing typed, and the user logs in by hand.

## Can I use my own SSH client, scp or VS Code?

Yes, for SSH assets, through the [SSH gateway](../assets/ssh-gateway.md): register your public key under **SSH keys**, then `ssh -p 2222 <asset>@<casvisor host>`. VS Code Remote also needs the **Forward** action in your permission. RDP, VNC and Telnet are reached from the browser only.

## The SSH gateway answers "Permission denied (publickey)"

The gateway does not know the key your client offered. Check that the public key is added under **SSH keys** of the user you mean to be, and that your client offers that key, for example with `ssh -i ~/.ssh/id_ed25519`. The gateway takes no passwords. Once the key is accepted, any other refusal is printed as `casvisor: ...` with the reason.

## Where are the passwords of assets kept?

In Casvisor's database, encrypted when `credentialKey` is set and as they are when it is not; see [Encryption](../assets/assets.md#encryption). The API only returns them masked, and the browser never receives them. You can also leave the account empty so that each user types their own.

## Does Casvisor record sessions?

Yes, all of them: SSH, Telnet, VNC and RDP, replayed in the browser from **Sessions**. The recordings are files under `recordings/`, `/recordings` in Docker; see [Recordings](../audit/recordings.md) for where they go, how long they are kept and how to turn them off. Besides that, the [commands](../audit/commands.md) run in SSH and Telnet sessions are kept, and files moved and every change go into the operation log.

## Is there a hosted or enterprise version?

No. Casvisor is Apache-2.0 open source, and there is no paid edition.

## Where do I get help?

Open an issue on [GitHub](https://github.com/casvisor/casvisor/issues), or ask on [Discord](https://discord.gg/yfKcuHVAHB).
