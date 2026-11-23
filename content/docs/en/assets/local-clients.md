---
title: "Local clients"
seoTitle: "Casvisor: open assets in Xshell, WinSCP, mstsc, DBeaver and psql"
description: "Open an asset from the asset list in a client on your own machine: SSH clients such as Xshell and SFTP clients such as WinSCP through the SSH gateway, Remote Desktop Connection (mstsc) through Casvisor's Remote Desktop Gateway, and DBeaver, Navicat, mysql and psql through the database proxy, with a token instead of a registered public key."
---

Besides the browser, an asset can be opened in a client on your own machine, straight from the asset list. On **Assets**, the **Open in a local client** button of each asset opens a menu of what fits the asset. Every link and command in it carries a token that stands for you and the account you would connect as, so no public key has to be [registered](./ssh-gateway.md#registering-a-public-key) first. For SSH and RDP it is a one-time token: it works once, within two minutes. For database clients it is a [database token](#database-clients), which lasts hours, since database clients connect again and again.

| Asset | Menu item | What it does |
| --- | --- | --- |
| SSH | **Open in SSH client** | Opens `ssh://<token>@<host>:<port>`, which Xshell, SecureCRT, Termius and other clients that handle `ssh://` links pick up |
| SSH | **Open in SFTP client** | Opens `sftp://<token>@<host>:<port>` in WinSCP, FileZilla or another client that handles `sftp://` links |
| SSH | **Copy one-time SSH command** | Copies `ssh -p 2222 <token>@casvisor.example.com`, for any terminal |
| RDP | **Open in Remote Desktop Connection (mstsc)** | Downloads a `.rdp` file that mstsc opens, see [Remote Desktop Connection](#remote-desktop-connection) |
| MySQL, PostgreSQL | **Open with the Casvisor helper** | Opens a `casvisor://launch?type=db&...` link, which the Casvisor helper on your machine hands to a database client, see [Database clients](#database-clients) |
| MySQL, PostgreSQL | **Copy mysql command**, **Copy psql command** | Copies `mysql -h casvisor.example.com -P 3307 -u <token> -p<token> app` or `psql "postgresql://<token>:<token>@casvisor.example.com:5433/app?sslmode=prefer"` |
| MySQL, PostgreSQL | **Copy JDBC URL** | Copies `jdbc:mysql://...?user=<token>&password=<token>&sslMode=PREFERRED` or `jdbc:postgresql://...`, for DataGrip, IntelliJ and other JDBC tools |
| MySQL, PostgreSQL | **Copy DBeaver connection command**, **Download DBeaver connection** | Copies `dbeaver -con "driver=mysql|host=...|user=<token>|password=<token>|..."`, which opens the connection in DBeaver, or downloads a `data-sources.json` with it |
| Other | **Copy one-time port forwarding command** | Copies `ssh -p 2222 -N -L 13389:win-01:3389 <token>@casvisor.example.com`, see [Port forwarding to other assets](./ssh-gateway.md#port-forwarding-to-other-assets) |

The menu also keeps the commands for a registered public key, which do not expire. The SSH items need the [SSH gateway](./ssh-gateway.md); the Remote Desktop item needs the web UI to be opened over HTTPS; the database items need the [database proxy](#database-clients) to be on for the asset's protocol.

## SSH and SFTP clients

The token is the SSH user name. The client signs in with SSH's `none` method, which every common client tries first, and the gateway takes it to the asset and account the token was issued for, so the client needs no password or key. From there it is the same as signing in with a public key: the permission is checked again, the [login rules](../access-control/login-rules.md) apply, shells are recorded and checked against [command rules](../audit/commands.md), and file transfers follow the Upload and Download actions.

A token used once, or older than two minutes, is refused with `Permission denied`; open the menu again for a new one. A port forwarding token only forwards ports, and only to its own asset: opening a shell with it is refused.

## Remote Desktop Connection

Casvisor has a Remote Desktop Gateway built in, at `/remoteDesktopGateway/` on the address of the web UI. **Open in Remote Desktop Connection (mstsc)** downloads `<asset>.rdp`; open it within two minutes. The file names Casvisor as the gateway (`gatewayhostname`), carries the token as the gateway access token, and fills in the user name of the account. mstsc then reaches the asset through Casvisor, which connects to it through its [network gateway](./network-gateways.md) if it has one.

- It needs **Connect** and **Forward** on the asset.
- mstsc asks for the Windows password itself: Casvisor does not fill in the account's password, so you log in with an account you know.
- The RDP session is encrypted between mstsc and the asset, so Casvisor cannot see inside it. It is listed as a [session](../audit/sessions.md) with the mode `tunnel`, which administrators can stop and which ends when Forward is taken away, and written to the [operation log](../audit/operation-logs.md) as `rdp-gateway`, but it is not recorded or checked against command rules.
- The gateway tells mstsc what to keep out of the session: the clipboard without both Copy and Paste, local drives without both Upload and Download, and always printers, serial ports and plug-and-play devices.
- The file is not signed, so mstsc shows a warning about an unknown publisher before it connects.
- mstsc only uses a gateway over HTTPS with a certificate it trusts, so the item shows only when the web UI is opened over HTTPS. Behind a reverse proxy, the proxy has to pass the gateway's requests on, see [Behind a reverse proxy](../operations/reverse-proxy.md#the-remote-desktop-gateway).

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

### The menu and the helper

For a MySQL or PostgreSQL asset, the **Open in a local client** menu has:

- **Open with the Casvisor helper**: opens a link that the Casvisor helper on your machine passes to a database client there:

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

## Tokens

A token is issued by `POST /api/add-client-token?assetId=<organization>/<name>&kind=<ssh|tunnel|rdp|db>&account=<account>` for the signed-in user, who must have Connect on the asset as that account, and Forward for `tunnel` and `rdp`. Tokens are kept in memory, so they do not survive a restart. A one-time token is deleted when it is used; a database token lasts `dbProxyTokenHours`, 8 hours by default, and is listed by `GET /api/get-database-tokens` and revoked by `POST /api/revoke-database-token?tokenId=<id>`.
