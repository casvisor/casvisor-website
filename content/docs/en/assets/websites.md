---
title: "Websites"
seoTitle: "Casvisor: web assets through a reverse proxy or a remote browser, with permissions and audit"
description: "Internal websites such as Grafana, Jenkins or a router's admin page can be Web assets. Each opens on a subdomain of its own through Casvisor's reverse proxy, or in a remote browser that signs in for the user and records the screen, under the same permissions, command rules, revocation and session audit as the other assets."
---

Internal websites can be assets too: a monitoring dashboard, a CI server, the admin page of a router or a storage box. Users open them from Casvisor, and every request goes through Casvisor's reverse proxy, which checks the user's permission, applies the [command rules](../audit/commands.md), records what matters, and ends the session when the permission goes.

A website can also be opened in [Casvisor's browser](#casvisors-browser) instead: a Chrome that Casvisor runs on its server, whose screen the user sees and controls in the page, like a remote desktop. It signs in to the website for the user with a password the user never sees, records the screen, and works with websites that write their own address into their pages. The rest of this page up to that section is about the reverse proxy.

## Setting up the domain

Each website is served on a subdomain of its own, so that its paths, cookies and scripts work as they do at its own address. Pick a domain whose subdomains all reach Casvisor, such as `example-apps.com` next to a web UI at `casvisor.example.com`, and set it in `conf/app.conf`:

```ini
webAssetDomain = example-apps.com
```

Then:

1. Add a wildcard DNS record, `*.example-apps.com`, pointing at Casvisor or at its reverse proxy.
2. Give the reverse proxy a wildcard certificate for `*.example-apps.com`, and send those host names to Casvisor with the `Host` header kept (see [Behind a reverse proxy](../operations/reverse-proxy.md#websites)).

Websites are reached over the scheme of the request, as the reverse proxy reports it in `X-Forwarded-Proto`; write the scheme into the setting, as `https://example-apps.com`, to fix it. Until `webAssetDomain` is set, opening a Web asset fails with a message saying so.

Use a registrable domain of its own, not a subdomain of one the web UI or your other services are under. A website's scripts can set cookies for every parent of its host name up to the registrable domain, so websites under `*.web.example.com` could set cookies for `casvisor.example.com` and sign its users in or out of it. A website can still set cookies for the other websites under the same domain.

For a quick try on one machine, `webAssetDomain = web.localhost:19000` works without DNS in Chrome, Edge and Firefox, which send every `*.localhost` name to the machine itself.

## Adding a website

Add an asset as usual (see [Assets](./assets.md)), with:

| Field | Value |
| --- | --- |
| Protocol | `Web`. |
| Address | The website as Casvisor reaches it, such as `http://10.0.0.5:3000/` or `https://nas.lan/admin/`. The path and query are the page opened first. A host name alone uses the port below, over https on 443 and over http on any other port. |
| Port | Filled in from the address. |
| Username, Password | Sent to the website as HTTP basic authentication on every request, for websites protected that way. Leave them empty for a website with a sign-in page of its own: users then sign in there, as they would anywhere. |
| Fingerprint | For https websites, see below. |
| Network gateway | To reach a website in another network, as for other assets (see [Network gateways](./network-gateways.md)). |

**Test connection** opens the first page and shows its status, such as `HTTP 200 OK, nginx`. [System accounts](./accounts.md) of a Web asset are basic authentication accounts, and the permission decides which one a user gets; Casvisor cannot change their passwords.

### Certificates

An https website whose certificate the system trusts for its host name is accepted as is, including after the certificate is renewed. Any other certificate, such as a self-signed one, is recorded by its public key the first time Casvisor connects, and a different key is refused afterwards, with a message giving both. Clear the **Fingerprint** of the asset when the change is expected.

## Opening a website

**Connect** on a Web asset opens a new window, which starts a session and goes on to the website, on an address like `https://grafana--myorg.example-apps.com/`. The subdomain is `<asset>--<organization>` when both names can be part of a host name, and a fixed code made from them otherwise. In the [workbench](./connecting.md), a Web asset's tab has an **Open the website** button that does the same in a new window.

The window is signed in to the session by a link that works once, within a minute, and gets a cookie for that subdomain only. The cookie is Casvisor's: it is never passed on to the website, and the website's own cookies stay on its subdomain. Opening the same website again in the same browser ends the earlier session.

A session ends when:

- the user signs out at `/__casvisor__/signout` on the website's subdomain,
- nobody has used it for `webSessionIdleMinutes`, 30 by default (a WebSocket that stays open keeps it in use),
- an administrator stops it, or the user's permission is revoked, expires or leaves its hours, as for every session,
- Casvisor restarts.

After that, the website's pages say that the session has ended and why, and the user opens it again from Casvisor. Requests still running and WebSockets still open are cut when the session ends.

## What Casvisor changes on the way

So that the website works on its subdomain, Casvisor:

- sends the website its own host name in `Host`, and `X-Forwarded-For`, `X-Forwarded-Host` and `X-Forwarded-Proto` for the user's address and the subdomain,
- rewrites `Origin` and `Referer` from the subdomain to the website's own address, so that the website's checks of where a request comes from, including for WebSockets, pass,
- points redirects to the website's own address back to the subdomain,
- drops the `Domain` attribute of the website's cookies, and, when users reach Casvisor over plain http, their `Secure` attribute,
- drops the website's `Strict-Transport-Security` and `Alt-Svc` headers.

Page contents are passed through as they are. A website that writes its own full address into its pages, instead of following `X-Forwarded-Host`, links to that address, which users may not be able to reach; set its public URL to the subdomain where it has such a setting.

The paths under `/__casvisor__/` belong to Casvisor on every website's subdomain and are not passed to the website.

## Permissions and command rules

Connect lets a user open the website. Two other actions are checked on each request:

- **Upload**: without it, requests that send files (`multipart/form-data`) are refused.
- **Download**: without it, responses that the website sends as attachments (`Content-Disposition: attachment`) are refused.

Both follow the permission while the session is open: granting or removing them applies to the next request. Copy, Paste and Forward do nothing for websites; Forward is still what lets the [SSH gateway forward a port](./ssh-gateway.md#port-forwarding-to-other-assets) to the website, which passes through without any of these checks.

[Command rules](../audit/commands.md) are matched against each request as `METHOD /path?query`, such as `POST /api/users/42/delete`. **Block** refuses the request with the rule's name, and **Alert** lets it through and records it. For example, `^(POST|PUT|PATCH|DELETE) ` with the action Block makes a website read-only, and `^DELETE ` with Alert flags deletions.

## What is recorded

Each of these requests is a [command record](../audit/commands.md) of the session, with the time, the user, the client IP, the HTTP status and how long it took:

- pages the browser opens (navigations and frames),
- requests that may change something, that is every method other than GET, HEAD and OPTIONS,
- WebSockets, with status 101 and how long they stayed open,
- requests matched by a command rule, and requests refused for Upload or Download.

The images, scripts and API reads a page loads by itself are passed through without a record. In the [session list](../audit/sessions.md), **Monitor** on an online web session opens the list of its requests, which refreshes every 3 seconds, and **Replay** on a finished one shows the same list. Web sessions through the reverse proxy have no screen recording and no watermark.

## Casvisor's browser

With **Open in** set to **Casvisor's browser**, a Web asset opens in a headless Chrome, Chromium or Edge on the server of Casvisor, one for each session, with a profile of its own that is deleted when the session ends. Its screen is streamed into the connection page, and the mouse, the keyboard, typing in other languages and the clipboard go back to it. Above the screen are the address bar, back, forward and reload; pages the website opens in a new tab are shown in place of the first, with a button to close them. The option is only offered when Casvisor finds a browser on its server (see [Installing the browser](#installing-the-browser)), and it does not need `webAssetDomain`.

Use it when:

- users must not know the password of the website: Casvisor fills in the sign-in form for them,
- the screen should be recorded and watched like a remote desktop, not only the requests listed,
- the website writes its own full address into its pages, which breaks it on a subdomain: here the browser opens the website at its own address.

### The browser reaches nothing but the website

The browser goes out through a proxy of its session that lets through only the website's scheme, host and port, through the asset's [network gateway](./network-gateways.md) if it has one. Images, scripts and fonts from other hosts, such as a public CDN, are not loaded, and a link to another website opens a page of Casvisor saying that only this website can be opened. The browser's own pages, such as `chrome://` addresses, and files on the server can't be opened either, and cloud metadata addresses are refused.

Casvisor checks the https certificate of the website the same way as for the reverse proxy, pinning a self-signed one on first use (see [Certificates](#certificates)). The browser itself is given a certificate that Casvisor makes for each session, which only this browser trusts.

### Signing in for the user

Fill in the sign-in form of the asset, with CSS selectors such as `#username` or `input[name=email]`:

| Field | Value |
| --- | --- |
| Sign-in page | The page with the form, on the website, such as `/login`. Empty for the address of the website. |
| Username field | The field Casvisor types the username into. |
| Next button | For a sign-in in two steps, where the password field shows after the username, the button between them. Empty otherwise. |
| Password field | The field Casvisor types the password into. |
| Sign-in button | The button that signs in. Empty to submit the form of the password field. |

When a session starts, Casvisor opens the sign-in page and fills in the username and password of the asset, or of the [system account](./accounts.md) the user connects as. The screen stays hidden behind "Signing in to the website..." and the user's input is ignored until the website has moved on from the sign-in page, or for at most 8 seconds after the sign-in button. Any field still holding the password is then emptied before the screen is shown, so that a "show password" button of the website reveals nothing. If the form is not found, the user is told and can sign in by hand. The key button in the address bar signs in again, for a website that signed the user out.

Without a sign-in form, the asset's username and password are sent as HTTP basic authentication, as with the reverse proxy.

### Permissions and command rules

| Action | In Casvisor's browser |
| --- | --- |
| Connect | Opens the website. |
| Copy | Text copied in the browser with Ctrl+C or Ctrl+X goes to the user's clipboard. Text in a password field is never copied. |
| Paste | Ctrl+V and the clipboard button type the user's clipboard into the browser. |
| Upload | When the website asks for files, the user chooses them on their own computer and they are handed to the website. Without it, the file chooser does not open. |
| Download | Files the website downloads are kept on the server for the session, and the user saves them from the download button. Without it, downloads are cancelled. |

These follow the permission while the session is open, and the session is disconnected when Connect goes, as for every session.

Every page and frame the browser opens is matched against the [command rules](../audit/commands.md) as `METHOD /path?query`, the same as for the reverse proxy. **Block** shows a page of Casvisor naming the rule, **Alert** lets it open and records it, and **Review** shows a page that reloads by itself until another administrator approves it.

### What is recorded

- The screen, with the user's pointer, in the session's [recording](../audit/recordings.md), which administrators replay, [watch live](../audit/sessions.md#watching-a-session-live) and share like a remote desktop.
- Each page and frame opened, as a command record, with the rule and the action that matched it.
- Each upload and download, as `UPLOAD name (size)` and `DOWNLOAD /path (name)`, also when they are refused.

The replay lists these commands beside the screen, to jump to the moment they happened. In the session list these sessions have the protocol `Browser`.

### Installing the browser

Casvisor uses `remoteBrowserPath` from `conf/app.conf`, or else the first Chrome, Chromium or Edge it finds in the usual places and on the `PATH`. On a Linux server without a desktop, install Chromium from the distribution, such as `apt install chromium`; Casvisor starts it with `--no-sandbox` when it runs as root. Each session runs a browser of its own, which takes a few hundred MB of memory while it is open.
