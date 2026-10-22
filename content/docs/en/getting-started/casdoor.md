---
title: "Connect Casdoor"
description: "Sign in to Casvisor through Casdoor instead of its built-in accounts: create an organization and an application for it, set the redirect URL, and copy the client ID and secret into app.conf."
---

Out of the box Casvisor signs people in with its own accounts (see [Users and administrators](../access-control/users-and-admins.md)). Connect it to [Casdoor](https://casdoor.ai) when you want single sign-on with your other applications, or anything the built-in accounts do not have.

With Casdoor, Casvisor keeps no accounts of its own. People sign in through Casdoor with OAuth 2.0, and Casvisor takes their name, organization, groups and administrator flag from the token Casdoor gives back. Anything Casdoor supports at sign-in, such as MFA, passkeys, LDAP, SAML or GitHub and Google logins, therefore works for Casvisor without further setup.

## In Casdoor

1. **Organization.** Create one for the people who will use Casvisor, or use an existing one. Users of this organization are the ones who can sign in; its administrators manage Casvisor.
2. **Groups** (optional). Create groups such as `ops` or `dba` and put users in them. Casvisor's [permissions](../access-control/permissions.md) can grant an asset to a whole group.
3. **Application.** Create an application in that organization, for example `app-casvisor`:
   - **Redirect URLs**: add `https://casvisor.example.com/callback`, using the address people open Casvisor at. For a local test that is `http://<your-ip>:19000/callback`.
   - **Cert**: any certificate works; Casvisor fetches it. See [About the certificate](#about-the-certificate).
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

Setting `casdoorEndpoint` is what switches Casvisor from its own accounts to Casdoor. It is Casdoor's address with no trailing slash. It has to work both from people's browsers, which are sent there to sign in, and from the Casvisor server, which exchanges the sign-in code for a token there. Restart Casvisor after changing it. The web UI reads the same four values, so nothing needs to be rebuilt. Each of these keys can also be given as an environment variable of the same name, for example `docker run -e casdoorEndpoint=https://door.example.com ...`, which takes precedence over the file.

## About the certificate

Casvisor needs the public key of the certificate the application signs its tokens with. From v1.110.0 it fetches it from Casdoor at start: it asks for the application, reads which certificate the application uses, and downloads that certificate, falling back to Casdoor's `/.well-known/jwks` when the first way returns nothing. Nothing has to be configured, and changing the application's certificate in Casdoor only needs a restart of Casvisor.

If Casdoor cannot be reached when Casvisor starts, Casvisor keeps trying every 10 seconds in the background. Until it succeeds, sign-in only works for tokens signed with the old public `cert-built-in` key that Casdoor shipped with before v4.10, so sign-ins in that window usually fail with a signature error. Check Casvisor's log for `InitAuthConfig` if they do not recover.

Versions before v1.110.0 only knew that old key, so with a Casdoor installed from v4.10 on they cannot sign anyone in. Upgrade.

## Who becomes an administrator

A user who signs in is an administrator of Casvisor when **Is admin** is on for them in Casdoor, or when they belong to Casdoor's `built-in` organization. Administrators see the management pages and can reach every asset. Everyone else gets the workbench and only the assets a permission gives them. See [Users and administrators](../access-control/users-and-admins.md).

## Moving from the built-in accounts

Assets, permissions and command rules belong to an organization. With the built-in accounts that is the one named by `casdoorOrganization`, `casvisor` unless you changed it. After switching to Casdoor, users see the assets of their own Casdoor organization. So if you plan to move to Casdoor later, set `casdoorOrganization` to the name of that Casdoor organization from the start, or give the Casdoor organization the name `casvisor`.

The built-in accounts are not used while `casdoorEndpoint` is set. They stay in the database, and emptying `casdoorEndpoint` again brings them back.
