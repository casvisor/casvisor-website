---
title: "Run from source"
description: "Build Casvisor's Go backend and React web UI from the repository. It runs on SQLite with its own accounts, with nothing else to install."
---

Running from source is how you develop Casvisor. To run it without Docker, you can also download a ready-built archive for your system from [GitHub Releases](https://github.com/casvisor/casvisor/releases) and use the configuration below.

## What you need

| | Version | What for |
| --- | --- | --- |
| Go | 1.23 or later | The backend |
| Node.js and Yarn | Node 20 or later, Yarn 1 | The web UI |
| MySQL or MariaDB | 5.7 / 10.3 or later | Optional: the database is SQLite unless you choose MySQL |
| Casdoor | | Optional: sign-in through Casdoor instead of the built-in accounts, see [Connect Casdoor](./casdoor.md) |

All four protocols are handled inside the Go binary; nothing else needs to run beside it.

## Build and run

```bash
git clone https://github.com/casvisor/casvisor
cd casvisor/web
yarn install
yarn build
cd ..
go run .
```

`yarn build` writes the web UI to `web/build`, which the backend serves. Casvisor listens on port 19000 (`httpport` in `conf/app.conf`). On first start it creates the SQLite database `db/casvisor.db` and the administrator `admin`, whose password it prints in its output; open `http://localhost:19000` and sign in with it. Recordings go to `recordings/`.

## Configure

The defaults need no changes. Put your own settings in `conf/app.local.conf`, which overrides `conf/app.conf` and is not in git. For example, to use MySQL and sign in through Casdoor:

```ini
driverName = mysql
dataSourceName = root:123456@tcp(localhost:3306)/
dbName = casvisor
casdoorEndpoint = https://door.example.com
clientId = <client ID>
clientSecret = <client secret>
casdoorOrganization = "<organization>"
casdoorApplication = "<application>"
```

With MySQL, Casvisor creates the database named by `dbName` on first start, so the account in `dataSourceName` needs the right to create a database. [Configuration](../operations/configuration.md) explains each key.

## Working on the web UI

The web UI is React with Vite and shadcn/ui. For development, run Vite on its own and let it send API calls to the backend:

```bash
cd web
yarn dev
```

It serves on port 18001 and forwards `/api`, WebSockets included, to `http://localhost:19000`. Set `CASVISOR_BACKEND` to point it at another backend.

## Building for other systems

The backend is pure Go with `CGO_ENABLED=0`, so one machine can build for the others:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o casvisor .
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o casvisor.exe .
```

Copy the binary together with `conf/`, `data/`, `swagger/` and `web/build/`, which it reads at run time from its working directory.
