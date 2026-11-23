---
title: "Local clients"
seoTitle: "Casvisor: open assets in Xshell, WinSCP, mstsc, DBeaver and psql"
description: "Open an asset from the asset list in a client on your own machine: SSH clients such as Xshell and SFTP clients such as WinSCP through the SSH gateway, Remote Desktop Connection (mstsc) through Casvisor's Remote Desktop Gateway, which signs in to Windows with the stored password, and DBeaver, Navicat, mysql and psql through the database proxy. Casvisor Launcher picks the client you have installed."
---

Besides the browser, an asset can be opened in a client on your own machine, straight from the asset list. On **Assets**, the **Open in a local client** button of each asset opens a menu of what fits the asset. Every link and command in it carries a token that stands for you and the account you would connect as, so no public key has to be [registered](./ssh-gateway.md#registering-a-public-key) first. For SSH and RDP it is a one-time token: it works once, within two minutes. For database clients it is a [database token](#database-clients), which lasts hours, since database clients connect again and again.

| Asset | Menu item | What it does |
| --- | --- | --- |
| SSH | **Open in SSH client** | Opens `ssh://<token>@<host>:<port>`, which Xshell, SecureCRT, Termius and other clients that handle `ssh://` links pick up |
| SSH | **Open in SFTP client** | Opens `sftp://<token>@<host>:<port>` in WinSCP, FileZilla or another client that handles `sftp://` links |
| SSH | **Copy one-time SSH command** | Copies `ssh -p 2222 <token>@casvisor.example.com`, for any terminal |
| RDP | **Open in Remote Desktop Connection (mstsc)** | Downloads a `.rdp` file that mstsc opens, see [Remote Desktop Connection](#remote-desktop-connection) |
| MySQL, PostgreSQL | **Open with Casvisor Launcher** | Opens a `casvisor://launch?type=db&...` link, which [Casvisor Launcher](#casvisor-launcher) hands to a database client, see [Database clients](#database-clients) |
| MySQL, PostgreSQL | **Copy mysql command**, **Copy psql command** | Copies `mysql -h casvisor.example.com -P 3307 -u <token> -p<token> app` or `psql "postgresql://<token>:<token>@casvisor.example.com:5433/app?sslmode=prefer"` |
| MySQL, PostgreSQL | **Copy JDBC URL** | Copies `jdbc:mysql://...?user=<token>&password=<token>&sslMode=PREFERRED` or `jdbc:postgresql://...`, for DataGrip, IntelliJ and other JDBC tools |
| MySQL, PostgreSQL | **Copy DBeaver connection command**, **Download DBeaver connection** | Copies `dbeaver -con "driver=mysql|host=...|user=<token>|password=<token>|..."`, which opens the connection in DBeaver, or downloads a `data-sources.json` with it |
| Other | **Copy one-time port forwarding command** | Copies `ssh -p 2222 -N -L 13389:win-01:3389 <token>@casvisor.example.com`, see [Port forwarding to other assets](./ssh-gateway.md#port-forwarding-to-other-assets) |
| SSH, RDP | **Open with Casvisor Launcher** | Hands a `casvisor://` link to [Casvisor Launcher](#casvisor-launcher), which opens the asset in the SSH, SFTP or Remote Desktop client you have |

The menu also keeps the commands for a registered public key, which do not expire. The SSH items need the [SSH gateway](./ssh-gateway.md); the Remote Desktop items need the web UI to be opened over HTTPS; the database items need the [database proxy](#database-clients) to be on for the asset's protocol.

## SSH and SFTP clients

The token is the SSH user name. The client signs in with SSH's `none` method, which every common client tries first, and the gateway takes it to the asset and account the token was issued for, so the client needs no password or key. From there it is the same as signing in with a public key: the permission is checked again, the [login rules](../access-control/login-rules.md) apply, shells are recorded and checked against [command rules](../audit/commands.md), and file transfers follow the Upload and Download actions.

A token used once, or older than two minutes, is refused with `Permission denied`; open the menu again for a new one. A port forwarding token only forwards ports, and only to its own asset: opening a shell with it is refused.

## Remote Desktop Connection

Casvisor has a Remote Desktop Gateway built in, at `/remoteDesktopGateway/` on the address of the web UI. **Open in Remote Desktop Connection (mstsc)** downloads `<asset>.rdp`; open it within two minutes. The file names Casvisor as the gateway (`gatewayhostname`), carries the token as the gateway access token, and fills in the user name of the account. mstsc then reaches the asset through Casvisor, which connects to it through its [network gateway](./network-gateways.md) if it has one.

- It needs **Connect** and **Forward** on the asset.
- The gateway tells mstsc what to keep out of the session: the clipboard without both Copy and Paste, local drives without both Upload and Download, and always printers, serial ports and plug-and-play devices.
- The file is not signed, so mstsc shows a warning about an unknown publisher before it connects.
- mstsc only uses a gateway over HTTPS with a certificate it trusts, so the items show only when the web UI is opened over HTTPS. Behind a reverse proxy, the proxy has to pass the gateway's requests on, see [Behind a reverse proxy](../operations/reverse-proxy.md#the-remote-desktop-gateway).
- The session is listed as a [session](../audit/sessions.md) with the mode `tunnel`, which administrators can stop and which ends when Forward is taken away, and written to the [operation log](../audit/operation-logs.md) as `rdp-gateway`. It is not recorded or checked against command rules.

### When the account has a password

When the account you connect as has a password stored in Casvisor, Casvisor signs in to Windows with it, and the user never sees or types it. This is what lets users reach a server whose password only the administrators know.

- The `.rdp` file turns CredSSP off in mstsc (`enablecredsspsupport:i:0`), so mstsc does not ask for a password and speaks TLS to Casvisor, inside the gateway's HTTPS tunnel.
- Casvisor connects to the asset with Network Level Authentication (CredSSP) and the stored password when the asset asks for it, or with TLS otherwise, and passes the account and password to Windows at logon. The asset's certificate is pinned on the first connection, as in the browser; a different one is refused until the fingerprint of the asset is cleared.
- The certificate mstsc sees is Casvisor's own, a self-signed one kept in the database, so the first time mstsc says it cannot verify the identity of the remote computer. Check **Don't ask me again for connections to this computer** and click **Yes**; [Casvisor Launcher](#casvisor-launcher) tells mstsc to trust it, so there is no question at all.
- If Casvisor cannot sign in, for example because the stored password is wrong, it logs why and passes mstsc through to the asset as below. An asset that requires Network Level Authentication then refuses mstsc, which says so.
- Casvisor sees the RDP traffic in the clear in this mode, but does not record it yet.

When the account has no stored password, the RDP bytes pass through as they are, encrypted between mstsc and the asset, and mstsc asks for the Windows password itself, so you log in with an account you know.

Set `disableRdGateway = true` in `conf/app.conf` to turn the gateway off. It is always off with `isDemoMode = true`.

## Database clients

Casvisor has a database proxy built in, so that DBeaver, Navicat, DataGrip, `mysql`, `psql` and other clients on your own machine reach MySQL (and MariaDB) and PostgreSQL assets through it. Casvisor listens on a port for MySQL clients and one for PostgreSQL clients, and speaks each protocol itself; it is off until a port is set:

```ini
dbProxyMysqlPort = 3307
dbProxyPostgresqlPort = 5433
```

### Signing in

The client signs in with a **database token** as both the user name and the password. The database items of the **Open in a local client** menu issue one for you, for the asset and the account you would connect as, and put it into what they copy. A database token is not used up: database clients connect again and again, for a new tab, a metadata query or after a timeout, so it works for any number of connections until it expires, after `dbProxyTokenHours` (8 hours by default). Open the menu again for a new one. A token issued on the page is reused by the menu while it has more than an hour left.

**Account management → Database tokens** lists your valid tokens, with the asset, when each was issued, when it expires, when and from where it was last used, and how many sessions it has open. **Revoke** deletes a token and disconnects its sessions. Administrators see and revoke the tokens of everyone in their organization. Tokens are kept in memory, so restarting Casvisor revokes them all.

Casvisor checks the token with the password methods the clients use by default, so no setting is needed on the client:

- **MySQL**: `caching_sha2_password`, the default of MySQL 8 clients, or `mysql_native_password` for a client that asks for it, such as older clients and `--default-auth=mysql_native_password`. A client with another method is asked for `mysql_native_password`.
- **PostgreSQL**: SCRAM-SHA-256, which libpq (`psql`), the JDBC driver, pgx and DBeaver all speak.

Each connection checks again that you may connect to the asset as the account, applies the [connect rules](../access-control/connect-rules.md) with the method **Database client** and the [login rules](../access-control/login-rules.md) with the method **Database client**, and is refused with the reason as a database error: `ERROR 1045` for MySQL, `FATAL` for PostgreSQL. A login rule that holds the sign-in for review keeps the client waiting until an administrator decides; once approved, the token connects from that client IP without asking again. A login rule asking for two-step verification refuses database clients, which can't ask for a code.

### TLS

Clients reach the proxy over TLS when they ask for it, which `mysql`, `psql` and the JDBC drivers do by default (`sslmode=prefer`, `sslMode=PREFERRED`), and in plain text otherwise. The certificate is `dbProxyCertFile` and `dbProxyKeyFile`, or the certificate Casvisor serves HTTPS with, or else a self-signed one made at start, which clients accept unless they are told to check it (`sslmode=verify-full`, `sslMode=VERIFY_IDENTITY`). The connection from Casvisor to the database is a separate one, with TLS and the pinned public key as in the [console](./databases.md#connections-and-tls), through the asset's [network gateway](./network-gateways.md) if it has one.

### What is checked and recorded

Each connection is a [session](../audit/sessions.md) of the asset, listed with the client's name (such as `mysql 8.4.3`, `DBeaver` or the PostgreSQL `application_name`) and the mode `gateway`. **Monitor** shows its statements as they run, **Replay** after it ends, and **Stop** disconnects the client. The session also ends when the token is revoked or expires, when Connect is taken away, or when the user is deleted or forbidden.

What the client sends is read before it goes to the database:

- **MySQL**: the text of `COM_QUERY`, every statement of it when the client sends several at once, and of `COM_STMT_PREPARE`; switching databases (`COM_INIT_DB`) as ``USE `db` ``.
- **PostgreSQL**: simple queries, every statement of them, and the `Parse` message of the extended protocol, which DBeaver, JDBC and pgx use for every statement.

Each is a [command record](../audit/commands.md) with its result: the rows returned or changed, the time it took and the error. A prepared statement is recorded when it is prepared; the rows of its runs are added to that record. [Command rules](../audit/commands.md) apply as in the console:

- **Block**: the statement does not reach the database, and the client gets an error such as `ERROR 1227 (42000): casvisor: the statement is blocked by the rule: no-drop` from MySQL or `ERROR: casvisor: the statement is blocked by the rule: no-drop` (SQLSTATE 42501) from PostgreSQL. The connection stays usable. In a PostgreSQL transaction, the transaction is aborted, as with any error.
- **Review**: the statement waits until another administrator approves it in **Command reviews**; `psql` shows a notice while it waits, other clients just wait. A rejected statement gets an error like a blocked one.
- **Alert**: the statement runs and the record carries the rule.

Ctrl+C in `mysql` and `psql` works: `mysql` sends `KILL QUERY` with the connection id Casvisor gave it, and `psql` a cancel request with Casvisor's key, which Casvisor turns into a cancel on the database server, or the withdrawal of a statement waiting for review.

Not passed through: changing the user of a MySQL connection (`COM_CHANGE_USER`), the binlog and replica commands, `LOAD DATA LOCAL INFILE` (the proxy does not offer it), PostgreSQL replication connections and function calls by OID. Data sent with `COPY ... FROM STDIN` goes through; the `COPY` statement itself is checked.

### The menu

For a MySQL or PostgreSQL asset, the **Open in a local client** menu has:

- **Open with Casvisor Launcher**: opens a link that [Casvisor Launcher](#casvisor-launcher) on your machine passes to a database client there:

  ```
  casvisor://launch?type=db&dbtype=mysql|postgresql&host=<proxy host>&port=<proxy port>&user=<token>&password=<token>&database=<database>&name=<asset>
  ```

- **Copy mysql command** or **Copy psql command**, for a terminal.
- **Copy JDBC URL**, for DataGrip, IntelliJ and other JDBC tools.
- **Copy DBeaver connection command**: `dbeaver -con "driver=mysql|name=db-01 (Casvisor)|host=...|port=3307|database=app|user=<token>|password=<token>|savePassword=true|connect=true"`, which DBeaver's command line takes to add and open the connection.
- **Download DBeaver connection**: a `data-sources.json` with the connection, to put into a DBeaver project.

The host in them is `dbProxyHost`, or `sshGatewayHost`, or the host name of the web UI. The database is the asset's **Database**, which the client can change.

The MySQL greeting is sent before Casvisor knows the asset, so the server version a MySQL client sees at first is `dbProxyMysqlVersion` (`8.0.40-casvisor` by default); `SELECT VERSION()` returns the real one. Set it when a driver chooses its behavior by version, such as a MariaDB driver connecting to MariaDB servers only.

The proxy is for MySQL and PostgreSQL. The other kinds of database are opened in the [console](./databases.md), or through [port forwarding](./ssh-gateway.md#port-forwarding-to-other-assets), which is not recorded. The proxy is off in demo mode.

## Casvisor Launcher

Casvisor Launcher is a small program for Windows, Linux and macOS that opens the `casvisor://` links of the **Open with Casvisor Launcher** menu items in a client you have installed, so a link does not depend on which program the system gives `ssh://` links to. Download `casvisor-launcher_<os>_<arch>` from the [latest release](https://github.com/casvisor/casvisor/releases/latest); the **No Casvisor Launcher yet? Download** item at the bottom of the menu links to it. A browser cannot tell whether the launcher is installed, so if nothing happens after you click an item, install it first.

Run it once without arguments. It registers itself for `casvisor://` links, writes its configuration file with the clients it finds, and shows where both are. Keep the program where it is, or run it again after moving it; `casvisor-launcher uninstall` removes the registration.

- **Windows**: registered for the current user under `HKEY_CURRENT_USER\Software\Classes\casvisor`, no administrator rights needed.
- **Linux**: a `casvisor-launcher.desktop` file in `~/.local/share/applications`, set as the handler of `x-scheme-handler/casvisor` with `xdg-mime`.
- **macOS**: a small `Casvisor Launcher.app` in `~/Applications` that receives the links and passes them to the program.

It picks a client by the type of the link, the first one found in this order unless the configuration file names another:

| Type | Windows | Linux | macOS |
| --- | --- | --- | --- |
| `ssh` | Xshell, SecureCRT, PuTTY, OpenSSH in Windows Terminal or a console window | OpenSSH in a terminal, PuTTY | OpenSSH in Terminal |
| `sftp` | WinSCP, FileZilla | FileZilla | FileZilla |
| `rdp` | Remote Desktop Connection (mstsc) | FreeRDP in a terminal | the app that opens `.rdp` files, such as Windows App |
| `db` | `mysql` or `psql` in a terminal, DBeaver | `mysql` or `psql` in a terminal, DBeaver | `mysql` or `psql` in Terminal, DBeaver |

For `rdp`, the launcher writes the `.rdp` file to a temporary folder and removes it a minute later. It names the remote computer `<asset>.casvisor`, and on Windows, when Casvisor signs in for you, it tells mstsc to trust Casvisor's certificate for that name only, so mstsc asks nothing but the unknown publisher question.

The configuration file is `%APPDATA%\casvisor-launcher\config.json` on Windows, `~/.config/casvisor-launcher/config.json` on Linux and `~/Library/Application Support/casvisor-launcher/config.json` on macOS:

```json
{
  "ssh": "putty",
  "sftp": "",
  "rdp": "",
  "mysql": "dbeaver",
  "postgresql": "",
  "paths": {
    "putty": "D:\\Tools\\putty.exe",
    "winscp": "C:\\Program Files (x86)\\WinSCP\\WinSCP.exe"
  }
}
```

`ssh`, `sftp`, `rdp`, `mysql` and `postgresql` choose the client of each type by name: `xshell`, `securecrt`, `putty`, `openssh`, `winscp`, `filezilla`, `mstsc`, `freerdp`, `mysql`, `psql` and `dbeaver`; empty takes the first one found. `paths` sets where a client is, and also `terminal` (Windows Terminal or the terminal emulator on Linux); a client not listed there is looked for in its usual install folders and on the `PATH`.

The links look like this, with the token in place of the user name or password:

```
casvisor://launch?type=ssh&host=casvisor.example.com&port=2222&user=<token>&name=web-01
casvisor://launch?type=sftp&host=casvisor.example.com&port=2222&user=<token>&name=web-01
casvisor://launch?type=rdp&host=casvisor.example.com&port=443&token=<token>&name=win-01&username=Administrator&autologon=1&certhash=<sha256>
casvisor://launch?type=db&dbtype=mysql&host=<proxy host>&port=<proxy port>&user=<token>&password=<token>&database=<database>&name=db-01
```

Any web page can open a `casvisor://` link, so the launcher only accepts host names, ports, tokens and database names made of the characters Casvisor puts there, starts the clients without a shell, and refuses anything else with a message.

## Tokens

A token is issued by `POST /api/add-client-token?assetId=<organization>/<name>&kind=<ssh|tunnel|rdp|db>&account=<account>` for the signed-in user, who must have Connect on the asset as that account, and Forward for `tunnel` and `rdp`. For `rdp` the answer also says whether Casvisor signs in for the user (`autoLogon`) and the SHA-256 fingerprint of the certificate mstsc then sees (`certHash`). Tokens are kept in memory, so they do not survive a restart. A one-time token is deleted when it is used; a database token lasts `dbProxyTokenHours`, 8 hours by default, and is listed by `GET /api/get-database-tokens` and revoked by `POST /api/revoke-database-token?tokenId=<id>`.

mstsc closes its first connection when it checks the certificate of the remote computer, and connects again with the same token. So an `rdp` token whose connection ends within 30 seconds, before the remote desktop has started, can be used again until it expires.
