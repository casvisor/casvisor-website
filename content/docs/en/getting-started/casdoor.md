---
title: "Connect Casdoor"
description: "Casvisor signs people in through Casdoor. Create an organization and an application for it, set the redirect URL and certificate, and copy the client ID and secret into app.conf."
---

Casvisor has no user table and no login form. People sign in through [Casdoor](https://casdoor.ai) with OAuth 2.0, and Casvisor takes their name, organization, groups and administrator flag from the token Casdoor gives back. Anything Casdoor supports at sign-in, such as MFA, passkeys, LDAP, SAML or GitHub and Google logins, therefore works for Casvisor without further setup.

## In Casdoor

1. **Organization.** Create one for the people who will use Casvisor, or use an existing one. Users of this organization are the ones who can sign in; its administrators manage Casvisor.
2. **Groups** (optional). Create groups such as `ops` or `dba` and put users in them. Casvisor's [permissions](../access-control/permissions.md) can grant an asset to a whole group.
3. **Application.** Create an application in that organization, for example `app-casvisor`:
   - **Redirect URLs**: add `https://casvisor.example.com/callback`, using the address people open Casvisor at. For a local test that is `http://<your-ip>:19000/callback`.
   - **Cert**: note which certificate it uses. See [About the certificate](#about-the-certificate).
   - Turn off **Enable signup** unless anyone who finds the page should get an account.
4. Copy the application's **Client ID** and **Client secret**.

## In app.conf

```ini
casdoorEndpoint = https://door.example.com
clientId = 0ba528121ea87b3eb54d
clientSecret = 04f4ca1c0d8bf9f3bb7a0ac6ab6c5a1cb4fd4c62
casdoorOrganization = "my-org"
casdoorApplication = "app-casvisor"
```

`casdoorEndpoint` is Casdoor's address with no trailing slash. It has to work both from people's browsers, which are sent there to sign in, and from the Casvisor server, which exchanges the sign-in code for a token there. Restart Casvisor after changing it. The web UI reads the same four values, so nothing needs to be rebuilt.

## About the certificate

Casvisor checks the signature of Casdoor's tokens with a public key compiled into it, `controllers/token_jwt_key.pem`. That file is the public key of the `cert-built-in` certificate that Casdoor shipped with before v4.10, when every Casdoor used the same key pair.

- **Casdoor before v4.10**, with the application on `cert-built-in`: works as it is.
- **Casdoor v4.10 or later**, or an application on a certificate of its own: open the certificate under **Certs** in Casdoor, copy its **Certificate** (the `-----BEGIN CERTIFICATE-----` block) into `controllers/token_jwt_key.pem`, and [build Casvisor from source](./source.md). Since v4.10 each Casdoor generates its own `cert-built-in` on first start, so this applies to every new installation. Sign-in fails with a signature error until the key matches.

Taking the certificate from configuration, so the Docker images work with any Casdoor, is the first item on the [roadmap](../more/roadmap.md).

## Who becomes an administrator

A user who signs in is an administrator of Casvisor when **Is admin** is on for them in Casdoor, or when they belong to Casdoor's `built-in` organization. Administrators see the management pages and can reach every asset. Everyone else gets the workbench and only the assets a permission gives them. See [Users and administrators](../access-control/users-and-admins.md).
