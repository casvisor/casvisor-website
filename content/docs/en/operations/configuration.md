---
title: "Configuration"
description: "Every key of Casvisor's conf/app.conf: the HTTP port, the MySQL connection, guacd, the Casdoor application, sessions in Redis and the operation log."
---

Casvisor reads `conf/app.conf` from its working directory when it starts. In the Docker images that is `/conf/app.conf`; mount your own file there. Restart Casvisor after changing it.

Two ways to keep your own values apart from the file in the repository:

- **`conf/app.local.conf`**, in the same format. Every key in it overrides `conf/app.conf`. It is not in git, so pulling a new version never conflicts with it; it is the place for `dataSourceName`, `clientSecret` and `credentialKey`.
- **Environment variables** of the same name as the key, which override both files for most keys, including the Casdoor ones, `driverName`, `dataSourceName`, `credentialKey`, `allowedUsers` and `isDemoMode`. `dbName` and `guacamoleEndpoint` are read from the files only.

```ini
appname = casvisor
httpport = 19000
runmode = dev
SessionOn = true
copyrequestbody = true
driverName = mysql
dataSourceName = root:123456@tcp(localhost:3306)/
dbName = casvisor
tableNamePrefix =
isDemoMode = false
logPostOnly = true
redisEndpoint =
guacamoleEndpoint = 127.0.0.1:4822
casdoorEndpoint = https://door.casdoor.com
clientId = b108dacba027db36ec26
clientSecret = 124140638b4f9de7e78e79ba22d451c17bfa9688
casdoorOrganization = "casbin"
casdoorApplication = "app-casvisor"
```

The Casdoor values in the file as shipped belong to Casbin's public demo and will not sign anyone in to your Casvisor. Replace them; see [Connect Casdoor](../getting-started/casdoor.md).

## Server

| Key | Default | Meaning |
| --- | --- | --- |
| `httpport` | `19000` | The port Casvisor listens on, for the web UI, the API and the connection WebSockets. |
| `runmode` | `dev` | Beego's run mode. `prod` turns off Beego's development error pages. |
| `appname`, `SessionOn`, `copyrequestbody` | | Beego settings Casvisor relies on. Leave them as they are. |

## Database

| Key | Default | Meaning |
| --- | --- | --- |
| `driverName` | `mysql` | MySQL and MariaDB are the supported databases. |
| `dataSourceName` | `root:123456@tcp(localhost:3306)/` | The MySQL DSN up to and including the `/`, without the database name. |
| `dbName` | `casvisor` | The database. Casvisor creates it, and its tables, at start if they do not exist. |
| `tableNamePrefix` | empty | A prefix for the API rule table, for sharing a database. |

When the environment variable `RUNNING_IN_DOCKER` is `true`, `localhost` in `dataSourceName` is replaced by the Docker host's address, so a container can reach a MySQL server running on its host.

## Connections

| Key | Default | Meaning |
| --- | --- | --- |
| `guacamoleEndpoint` | `127.0.0.1:4822` | Where guacd listens. Used for Telnet only. See [Protocols](../assets/protocols.md#guacd). |

## Casdoor

| Key | Meaning |
| --- | --- |
| `casdoorEndpoint` | Casdoor's address, reachable from both the browsers and the Casvisor server, without a trailing slash |
| `clientId`, `clientSecret` | The client ID and secret of the Casdoor application |
| `casdoorOrganization` | The organization of the application |
| `casdoorApplication` | The name of the application |

The web UI is built with Casbin's demo values and Casvisor replaces them with these when it serves the UI, so the same build works with any Casdoor.

## Sessions and logs

| Key | Default | Meaning |
| --- | --- | --- |
| `redisEndpoint` | empty | Empty keeps sign-in sessions as files under `tmp/`. Set it to a Redis address, such as `127.0.0.1:6379`, to keep them in Redis instead, so people stay signed in when the container is replaced. |
| `logPostOnly` | `true` | Log only the calls that change something. See [Operation logs](../audit/operation-logs.md). |
| `isDemoMode` | `false` | For a public demo: sessions end after 15 minutes, each client IP can have only a few open at a time, and users can only stop their own sessions. |

## Security

| Key | Default | Meaning |
| --- | --- | --- |
| `credentialKey` | empty | Encrypts stored passwords and private keys. See [Encryption](../assets/assets.md#encryption). |
| `allowedUsers` | empty | Comma-separated `organization/name` of the only users who may sign in. Empty lets everyone in the organization sign in. See [Users and administrators](../access-control/users-and-admins.md#limiting-who-can-sign-in). |
