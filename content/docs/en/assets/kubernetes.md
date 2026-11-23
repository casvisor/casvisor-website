---
title: "Kubernetes"
seoTitle: "Casvisor: Kubernetes shells, pod logs, files and kubectl through a bastion host"
description: "Kubernetes clusters as Casvisor assets: shells, logs and file transfer for containers in the browser, and kubectl, Lens or any other client through Casvisor with a kubeconfig it issues, every request checked against the permission, its namespaces and the command rules, and recorded."
---

A Kubernetes cluster is an asset whose address is its API server. Users pick a namespace, a pod and a container in the browser, and open a shell in it, read its log or copy files in and out. Or they download a kubeconfig and use kubectl, Lens or any other Kubernetes client as usual, through Casvisor. Either way the cluster's token stays on the server, every request goes through the user's [permission](../access-control/permissions.md), its namespaces and the [command rules](../audit/commands.md), and shells are recorded like the web terminal.

## Adding a cluster

Add an asset (see [Assets](./assets.md)) with:

| Field | Value |
| --- | --- |
| Protocol | `Kubernetes`. |
| Address | The API server, such as `https://10.0.0.1:6443`, or a host name with the port below. A path is kept, for API servers behind a proxy such as Rancher. Only https. |
| Port | 6443 by default, and taken from the address when it has one. |
| Username | A name for the token, shown in the account list. |
| Password | A bearer token, such as the token of a ServiceAccount. It decides what Casvisor may do on the cluster; the permission decides what each user may do with it. |
| Database | The namespace opened first, `default` when empty. |
| Fingerprint | The SHA-256 of the API server's public key, see below. |
| Network gateway | To reach a cluster in another network (see [Network gateways](./network-gateways.md)). |

A token for Casvisor, from a ServiceAccount bound to `cluster-admin` or to a narrower role:

```bash
kubectl -n kube-system create serviceaccount casvisor
kubectl create clusterrolebinding casvisor --clusterrole=cluster-admin --serviceaccount=kube-system:casvisor
kubectl -n kube-system create token casvisor --duration=8760h
```

[System accounts](./accounts.md) of a Kubernetes asset are more tokens, such as one bound to a read-only role, and the permission decides which one a user gets.

The API server's public key is pinned the first time a request with the token is accepted, rather than its certificate, since k3s and kubeadm renew certificates but keep the key. A different key is refused afterwards, with a message giving both; clear **Fingerprint** when the change is expected. A token the API server rejects does not pin anything.

## In the browser

**Connect** opens the cluster: the namespaces on the left (the ones the permission covers, when it does not cover them all), the pods of the selected one, and their containers. A container opens with three tabs:

- **Terminal**: a shell in the container, `bash` when the container has it and `sh` otherwise. Commands are read and checked against the command rules, the terminal is [recorded](../audit/recordings.md), and administrators can [watch it live](../audit/sessions.md#watching-a-session-live), as for SSH.
- **Logs**: the log of the container, from the last 100 to 5000 lines or all of it, followed as it grows, optionally with timestamps or from the container's previous run. **Download** saves the whole log.
- **Files**: download a file, or a directory as a tar file, and upload files into a directory. It works the way `kubectl cp` does, with `tar` in the container, so the image needs `tar`. Downloads and uploads need the **Download** and **Upload** actions, and are written to the [operation log](../audit/operation-logs.md) as `kubernetes-download` and `kubernetes-upload`.

The terminal and the files are only for running pods and namespaces the permission does not keep read-only; the log is always there.

## kubectl

The key icon at the top of the pod list opens **kubectl**: **Download kubeconfig** saves a kubeconfig for the cluster, valid for eight hours:

```bash
export KUBECONFIG=~/Downloads/casvisor-prod.yaml
kubectl get pods
kubectl exec -it web-0 -- sh
```

The kubeconfig points kubectl to Casvisor's own address, at `https://casvisor.example.com/kubernetes/<organization>/<asset>`, with a token of Casvisor in it, not the cluster's. Casvisor checks each request, sends it on with the asset's token through its network gateway, and passes the answer back, so kubectl works as it does against the cluster: `get`, `apply`, `edit`, watches, `logs -f`, `exec`, `attach`, `cp` and `port-forward`. Impersonation headers (`--as`) are dropped.

Casvisor has to be reached over **HTTPS**: kubectl does not send a token over plain http. The kubeconfig carries no CA, so the certificate of Casvisor's address has to be one the client trusts. Behind a reverse proxy, let `/kubernetes/` through with WebSockets and without a short read timeout, since watches, `logs -f` and shells stay open (see [Behind a reverse proxy](../operations/reverse-proxy.md)).

Each kubeconfig is a session of its own in [Sessions](../audit/sessions.md), with `kubectl` as its target, and its requests are its commands, such as:

```text
delete namespaces/dev (DELETE /api/v1/namespaces/dev)
create pods/web-0/exec -n prod (GET /api/v1/namespaces/prod/pods/web-0/exec?command=sh&container=app&stdin=true&tty=true)
```

with their status and time. Requests that only discover the API, like `/api` and `/openapi/v3`, are listed when they fail. The **kubectl** dialog lists the kubeconfigs that are still valid, your own or, for administrators, everyone's, and **Revoke** ends one. Kubeconfigs stay valid across restarts of Casvisor.

### Shells, commands and files

- `kubectl exec -it` and `kubectl attach -it` start a session of their own, recorded and watched like the terminal in the browser, with each command typed checked against the command rules.
- `kubectl exec <pod> -- <command>` checks the command against the command rules before it runs, and lists it in a session of its own.
- Piping into a command, as `kubectl exec -i <pod> -- sh -c 'cat > /tmp/x' < file` does, needs the **Upload** action, as it sends data into the container. A shell without a terminal, `kubectl exec -i <pod> -- sh`, is refused: open it with `-it`, so that its commands are recorded.
- `kubectl cp` needs **Upload** to copy into a container and **Download** to copy out, and is written to the operation log.
- `kubectl port-forward` needs the **Forward** action. Its traffic is passed through, not recorded.

Casvisor opens `exec`, `attach` and `port-forward` over WebSockets, which kubectl uses by default since 1.31. Older clients that use SPDY are refused, with a message saying so.

### Revoking

Revoking a kubeconfig, or stopping its session in [Sessions](../audit/sessions.md), ends at once the requests in progress, such as watches and `logs -f`, and the shells opened with it, and kubectl shows why. So does losing the permission: a watch or a shell in a namespace taken out of the permission ends as soon as the permission is saved, or within half a minute when it runs out, and every request is checked again as it comes. A kubeconfig that expires ends its session the same way.

The **kubectl** connect method of [connect rules](../access-control/connect-rules.md) covers kubeconfigs: a rule that rejects it keeps a user to the browser.

## Namespaces and read-only permissions

A [permission](../access-control/permissions.md#kubernetes-namespaces) can be limited to some namespaces, and to reading only. On a Kubernetes asset:

- A request in a namespace needs that namespace in the permission.
- What has no namespace, like nodes, cluster roles or a list of pods across all namespaces (`kubectl get pods -A`), needs `*`.
- A namespace itself can be read in its own permission, but changing or deleting a namespace needs `*`.
- A read-only permission allows `get`, `list` and `watch`. Shells, file transfers and port forwarding create things in the pod, and need a namespace the permission does not keep read-only.

When several permissions cover the user, their namespaces add up, and a namespace is writable when one of them allows it. A list across namespaces is refused, not filtered, when the permission does not cover them all; the message names the namespaces the user has.

## Command rules

[Command rules](../audit/commands.md) apply to kubectl requests as well as to the commands typed in shells. A request is matched as its verb, its resource with the name and subresource, and its namespace:

| Request | Matched as |
| --- | --- |
| `kubectl delete ns dev` | `delete namespaces/dev` |
| `kubectl -n prod delete pod web-0` | `delete pods/web-0 -n prod` |
| `kubectl -n prod delete deploy api` | `delete deployments.apps/api -n prod` |
| `kubectl -n prod exec -it web-0 -- sh` | `create pods/web-0/exec -n prod` |
| `kubectl get pods -A` | `list pods` |
| `kubectl version` | `get /version` |

For example, `^delete namespaces` blocks deleting namespaces, and `^(delete|patch|update) .* -n prod$` holds changes in `prod` for review with a **Review** rule. kubectl cannot wait for a review: the request is refused with the number of the review, and the same command run again after an administrator approves it goes through, once.
