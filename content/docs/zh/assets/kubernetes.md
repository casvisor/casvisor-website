---
title: "Kubernetes"
seoTitle: "Casvisor：经堡垒机进容器、看Pod日志、传文件和用kubectl"
description: "Kubernetes集群作为Casvisor资产：在浏览器里进容器、看日志、传文件；也可以用Casvisor签发的kubeconfig经Casvisor使用kubectl、Lens等客户端，每个请求都按权限、命名空间和命令规则检查并记录。"
---

Kubernetes集群是一种资产，地址是它的API server。用户在浏览器里选命名空间、Pod和容器，进容器开Shell、看日志或传文件；也可以下载kubeconfig，照常用kubectl、Lens等Kubernetes客户端，只是经由Casvisor。无论哪种方式，集群的令牌都只留在服务器上，每个请求都要经过用户的[权限](../access-control/permissions.md)、权限里的命名空间和[命令规则](../audit/commands.md)，Shell和网页终端一样录像。

## 添加集群

添加资产（见[资产](./assets.md)），填：

| 字段 | 值 |
| --- | --- |
| 协议 | `Kubernetes`。 |
| 地址 | API server，例如`https://10.0.0.1:6443`，或主机名加下面的端口。地址里的路径会保留，适用于Rancher等代理后面的API server。只支持https。 |
| 端口 | 默认6443，地址里带端口时取地址里的。 |
| 用户名 | 令牌的名字，显示在账号列表里。 |
| 密码 | Bearer令牌，例如某个ServiceAccount的令牌。它决定Casvisor在集群上能做什么；权限决定每个用户能用它做什么。 |
| 数据库名 | 默认打开的命名空间，不填为`default`。 |
| 指纹 | API server公钥的SHA-256，见下文。 |
| 网域网关 | 访问其他网络里的集群时用（见[网域网关](./network-gateways.md)）。 |

给Casvisor建一个令牌，ServiceAccount可以绑定`cluster-admin`，也可以绑定范围更小的角色：

```bash
kubectl -n kube-system create serviceaccount casvisor
kubectl create clusterrolebinding casvisor --clusterrole=cluster-admin --serviceaccount=kube-system:casvisor
kubectl -n kube-system create token casvisor --duration=8760h
```

Kubernetes资产的[系统账号](./accounts.md)就是更多的令牌，例如一个绑定只读角色的令牌，权限决定用户用哪一个。

第一次有请求带着令牌被API server接受时，Casvisor固定的是API server的公钥，而不是证书：k3s、kubeadm会换证书，但公钥不变。之后公钥变了就拒绝连接，提示里给出前后两个值；确认是预期的变化，就清空**指纹**。被API server拒绝的令牌不会固定任何东西。

## 在浏览器里

**连接**打开集群：左边是命名空间（权限没有覆盖全部命名空间时，只列权限里的）、所选命名空间的Pod和它们的容器。打开一个容器有三个标签页：

- **终端**：在容器里开Shell，有`bash`用`bash`，否则用`sh`。和SSH一样，命令会被读出并按命令规则检查，终端会[录像](../audit/recordings.md)，管理员可以[实时旁观](../audit/sessions.md#实时旁观)。
- **日志**：容器的日志，从最后100到5000行或全部，可以跟随新输出，可以带时间戳，也可以看容器上一次运行的日志。**下载**保存完整日志。
- **文件**：下载文件，或把目录打成tar包下载，以及把文件上传到某个目录。做法和`kubectl cp`一样，用容器里的`tar`，所以镜像里要有`tar`。下载和上传分别要**Download**和**Upload**动作，并记进[操作日志](../audit/operation-logs.md)，动作是`kubernetes-download`和`kubernetes-upload`。

终端和文件只对运行中的Pod、并且权限在这个命名空间不是只读时可用；日志总是可以看。

## kubectl

Pod列表上方的钥匙图标打开**kubectl**：**下载kubeconfig**保存这个集群的kubeconfig，有效期8小时：

```bash
export KUBECONFIG=~/Downloads/casvisor-prod.yaml
kubectl get pods
kubectl exec -it web-0 -- sh
```

kubeconfig里的地址是Casvisor自己的地址`https://casvisor.example.com/kubernetes/<组织>/<资产>`，里面是Casvisor签发的令牌，不是集群的令牌。Casvisor检查每个请求，换上资产的令牌经它的网域网关转给API server，再把结果传回去，所以kubectl用起来和直连集群一样：`get`、`apply`、`edit`、watch、`logs -f`、`exec`、`attach`、`cp`和`port-forward`都能用。模拟身份的请求头（`--as`）会被去掉。

Casvisor必须用**HTTPS**访问：kubectl不会在明文http上发送令牌。kubeconfig里不带CA，所以Casvisor地址的证书要是客户端信任的。放在反向代理后面时，`/kubernetes/`要放行WebSocket，也不要设很短的读超时，因为watch、`logs -f`和Shell会一直开着（见[反向代理](../operations/reverse-proxy.md)）。

每个kubeconfig在[会话](../audit/sessions.md)里是一个单独的会话，目标是`kubectl`，它的请求就是这个会话的命令，例如：

```text
delete namespaces/dev (DELETE /api/v1/namespaces/dev)
create pods/web-0/exec -n prod (GET /api/v1/namespaces/prod/pods/web-0/exec?command=sh&container=app&stdin=true&tty=true)
```

并带有状态码和耗时。只用来发现API的请求，如`/api`和`/openapi/v3`，失败时才记录。**kubectl**对话框列出仍然有效的kubeconfig（自己的；管理员看到所有人的），**撤销**让它失效。Casvisor重启后kubeconfig仍然有效。

### Shell、命令和文件

- `kubectl exec -it`和`kubectl attach -it`各开一个单独的会话，和浏览器里的终端一样录像、可以实时旁观，输入的每条命令都按命令规则检查。
- `kubectl exec <pod> -- <命令>`在命令执行前按命令规则检查，并记在一个单独的会话里。
- 往命令里灌数据，例如`kubectl exec -i <pod> -- sh -c 'cat > /tmp/x' < file`，相当于往容器里传数据，需要**Upload**动作。没有终端的Shell，即`kubectl exec -i <pod> -- sh`，会被拒绝：请用`-it`打开，这样它的命令才会被记录。
- `kubectl cp`往容器里复制要**Upload**，从容器里复制出来要**Download**，并记进操作日志。
- `kubectl port-forward`需要**Forward**动作，转发的流量原样透传，不录像。

Casvisor只用WebSocket打开`exec`、`attach`和`port-forward`，kubectl从1.31起默认就用WebSocket。还在用SPDY的旧客户端会被拒绝，并提示原因。

### 撤销

撤销kubeconfig，或在[会话](../audit/sessions.md)里断开它的会话，进行中的请求（例如watch和`logs -f`）和用它打开的Shell会立即断开，kubectl会显示原因。失去权限也一样：权限一保存，被移出的命名空间里的watch和Shell就断开，权限到期则在半分钟内断开；之后每个请求还会重新检查。kubeconfig到期时它的会话也会这样结束。

[连接方式规则](../access-control/connect-rules.md)的**kubectl**方式管的就是kubeconfig：拒绝它，用户就只能用浏览器。

## 命名空间和只读权限

[权限](../access-control/permissions.md#kubernetes命名空间)可以限定到某些命名空间，也可以只读。在Kubernetes资产上：

- 某个命名空间里的请求，要求权限里有这个命名空间。
- 不属于命名空间的资源，如节点、ClusterRole，或跨所有命名空间列Pod（`kubectl get pods -A`），要求权限里有`*`。
- 命名空间对象本身在它自己的权限里可以读，但修改或删除命名空间要`*`。
- 只读权限只允许`get`、`list`和`watch`。开Shell、传文件和端口转发会在Pod里创建东西，要求这个命名空间不是只读。

多条权限同时覆盖一个用户时，命名空间取并集，只要有一条允许修改，这个命名空间就可以修改。权限没有覆盖全部命名空间时，跨命名空间的列表会被拒绝，而不是过滤，提示里会列出用户有的命名空间。

## 命令规则

[命令规则](../audit/commands.md)既管Shell里输入的命令，也管kubectl的请求。请求按动词、带名称和子资源的资源、命名空间来匹配：

| 请求 | 匹配的文本 |
| --- | --- |
| `kubectl delete ns dev` | `delete namespaces/dev` |
| `kubectl -n prod delete pod web-0` | `delete pods/web-0 -n prod` |
| `kubectl -n prod delete deploy api` | `delete deployments.apps/api -n prod` |
| `kubectl -n prod exec -it web-0 -- sh` | `create pods/web-0/exec -n prod` |
| `kubectl get pods -A` | `list pods` |
| `kubectl version` | `get /version` |

例如，`^delete namespaces`拦住删除命名空间；用**Review**规则配`^(delete|patch|update) .* -n prod$`，`prod`里的修改要等审批。kubectl等不了审批：请求会被拒绝并给出审批编号，管理员批准后再执行同一条命令就能通过，只能用一次。
