---
title: "作业中心"
seoTitle: "Casvisor：在多台服务器上批量执行命令、脚本和Ansible playbook"
description: "作业在多台SSH资产上同时执行一条命令、一个Bash或PowerShell脚本、分发一个文件，或者执行一个Ansible playbook，按名称、标签或资产树节点选资产，可以设超时和并发数。每台资产的输出和结果分别保存，命令规则照样生效，每台资产上的执行都是一个有录像的会话。"
---

**作业中心**（`/jobs`）在多台服务器上同时做同一件事：执行一条命令、一个脚本、把一个文件拷过去，或者执行一个[Ansible playbook](#ansible-playbook)。它作用于SSH资产，Linux和Windows都可以，用资产上保存的账号，服务器上不用装任何东西。这个页面给管理员用。

## 新建作业

**新建作业**要填：

| 字段 | 含义 |
| --- | --- |
| 名称 | 选填，例如*检查磁盘空间*，方便在列表里找到。 |
| 类型 | **命令**、**脚本**、**文件分发**或**Ansible playbook**。 |
| 资产、资产标签、节点 | 按名称选的资产、带有其中任一标签的所有SSH资产，以及在其中任一资产树节点或其下级节点里的所有SSH资产，以作业开始时为准。只有SSH资产能执行作业，其他协议的资产会被跳过。表单里会列出作业将在哪些资产上执行。 |
| 命令 | 类型为命令时：一行命令。 |
| 脚本类型、脚本 | 类型为脚本时：**Bash**或**PowerShell**，以及脚本内容。 |
| 文件、目标路径 | 类型为文件分发时：先上传到Casvisor的文件（最大1 GB），以及放到哪里。 |
| Playbook、文件、变量、检查模式 | 类型为playbook时：见[Ansible playbook](#ansible-playbook)。 |
| 超时（秒） | 每台资产最多跑多久，默认60秒（playbook默认1800秒），最长一天。超过这个时间还没跑完的资产会被终止。 |
| 并发数 | 同时执行的资产数，默认10，最多100。 |

点**在N台资产上执行**开始。作业在后台跑，页面可以关掉。

## 各类型怎么执行

Casvisor以资产自己的账号经SSH连接每台资产（配置了[网域网关](./network-gateways.md)就经由网域网关），用`uname -s`判断它是Linux或Unix还是Windows，然后：

- **命令**：Linux和Unix上用`sh -c`执行；Windows上交给OpenSSH服务端的默认shell，除非把PowerShell设成了默认shell，否则就是`cmd`。
- **Bash脚本**：把脚本交给资产上的`bash -s`执行。Windows资产会失败，并提示改用PowerShell。
- **PowerShell脚本**：经SFTP把脚本传到资产上（Linux是`/tmp`，Windows是`C:\ProgramData\Casvisor\run`），Windows上用`powershell`、Linux上用`pwsh`执行，跑完删掉。
- **文件分发**：经SFTP拷贝文件。目标路径以`/`结尾或者是一个已有的目录时，文件以原名放进去；其他路径就是文件的新名字。缺少的目录会自动创建，已有的文件会被覆盖。也可以写`C:\temp\a.txt`这样的Windows路径。

在Linux上，资产有`timeout`命令时，命令会在它下面运行，超时时连同它启动的子进程一起结束。没有的话，到时间就给命令发信号，再切断连接。

命令或脚本以退出码0结束算成功，文件分发以写完文件算成功。账号要有作业所需的权限；需要root的操作，在命令里用`sudo`，只有这个账号能免密执行时才不会卡在输密码上。

## Ansible playbook

类型为**Ansible playbook**的作业在它的资产上执行一个playbook。由Casvisor自己执行，走的是和其他作业一样的SSH连接：Casvisor上（它也能跑在Windows上）和资产上都不用装Ansible，资产上有`sh`就行。每个任务都和其他命令一样经过命令规则、命令复核、录像和网域网关。

| 字段 | 含义 |
| --- | --- |
| Playbook | YAML格式的playbook，直接填写，或者打开一个`.yml`文件。 |
| 文件 | `copy`、`template`的`src`和`script`执行的文件，按文件名匹配：`src: files/nginx.conf`用的是添加的`nginx.conf`。 |
| 变量 | 额外变量，YAML或JSON，相当于`ansible-playbook -e`，优先级最高。 |
| 检查模式 | 照`ansible-playbook --check`执行：各模块只报告会改动什么，不真改。 |

**预检**只检查不执行，启动作业时也会先检查一遍：YAML写错、不认识的关键字、不支持的模块、选项或Jinja2写法、不存在的handler、没有添加的文件，都会在执行前报出来，并指出是哪个play的哪个任务。

### 怎么执行

清单（inventory）就是作业的资产。每台资产是一个主机，名字就是资产名；它属于以它的标签命名的组，以及它所在的每个节点和这些节点的上级节点各一个组。所以`hosts:`可以写`all`、资产名、标签、节点、`web*`这样的通配，或者用`!`排除、`&`取交集的列表，例如`dc1:!db`。`hosts`没有选中某台资产的play，在这台资产上跳过。

每台资产按顺序执行各个play，一个任务接一个任务，和其他资产互不等待，相当于Ansible的`free`策略；同时跑几台资产由作业的并发数决定。任务失败且没有忽略错误时，这台资产就停在那里，和Ansible一样。handler在play的最后执行，有任务通知它并且有改动时才执行，每个只执行一次。

命令以资产的账号执行。`become: true`用`sudo`以root或`become_user`执行；资产有口令时，`sudo`要口令就把它交给`sudo`，否则这个账号要能免密sudo。只支持`sudo`这一种become方式。

除非写了`gather_facts: false`，第一个play会收集几项facts：`ansible_distribution`、`ansible_distribution_version`、`ansible_distribution_major_version`、`ansible_os_family`、`ansible_system`、`ansible_kernel`、`ansible_architecture`、`ansible_hostname`、`ansible_fqdn`、`ansible_pkg_mgr`和`ansible_service_mgr`，`ansible_facts`下面也有一份。另外还有`inventory_hostname`、`ansible_host`、`ansible_port`、`ansible_user`、`group_names`和`ansible_check_mode`。

### 支持什么

模块（选项和Ansible一样，也可以写成`ansible.builtin.<名字>`）：

| 模块 | 说明 |
| --- | --- |
| `command`、`shell`、`raw`、`script` | `chdir`、`creates`、`removes`；`shell`和`script`还有`executable`。`command`和Ansible一样不经过shell。`script`把添加的文件传上去，带参数执行。 |
| `copy`、`template` | `src`（添加的文件）或`content`、`dest`、`mode`、`owner`、`group`、`force`、`backup`。校验和不一样才算改动。 |
| `file` | `state`为`file`、`directory`、`absent`、`touch`或`link`，链接用`src`，以及`mode`、`owner`、`group`、`recurse`。 |
| `lineinfile` | `line`、`regexp`、`search_string`、`insertafter`、`insertbefore`、`backrefs`、`firstmatch`、`create`、`state`、`backup`。正则用Go的，常见写法都支持，但不支持环视和模式里的反向引用。 |
| `apt`、`yum`、`dnf`、`package` | `name`（一个或一个列表）、`state`为`present`、`latest`或`absent`、`update_cache`；`apt`还有`purge`、`autoremove`和`install_recommends`。有包的版本变了才算改动。 |
| `service`、`systemd` | `state`为`started`、`stopped`、`restarted`或`reloaded`，`enabled`；`systemd`还有`daemon_reload`。 |
| `user`、`group` | `user`：`uid`、`group`、`groups`和`append`、`shell`、`home`、`create_home`、`system`、`comment`、`password`（哈希）、`remove`。`group`：`gid`、`system`。 |
| `get_url` | `url`、`dest`、`mode`、`owner`、`group`、`force`、`checksum`（只支持`sha256:`）、`timeout`、`headers`。在资产上用`curl`或`wget`下载。 |
| `debug`、`set_fact`、`assert`、`fail`、`ping` | |

关键字：`name`、`hosts`、`vars`、`become`、`become_user`、`gather_facts`、`pre_tasks`、`tasks`、`post_tasks`、`handlers`和`listen`、`notify`、`when`、`register`、`loop`和`with_items`以及`loop_control`（`loop_var`、`index_var`、`label`）、`ignore_errors`、`changed_when`、`failed_when`、`check_mode`、`no_log`、`environment`和`args`。`tags`可以写但不生效，所有任务都会执行。

模板和条件支持Jinja2常用的部分：`{{ }}`里的变量、属性和下标，`default`、`lower`、`upper`、`trim`、`int`、`float`、`string`、`bool`、`length`、`join`、`first`、`last`、`quote`、`replace`、`unique`、`sort`过滤器，`defined`、`undefined`、`none`、`succeeded`、`failed`、`changed`、`skipped`测试，`and`、`or`、`not`、`in`、比较、算术、`~`和行内的`if`/`else`。整个值只有一个`{{ }}`时保留原来的类型，和Ansible一样。

不支持、并且会在执行前报出来的：roles、`include_*`和`import_*`、`block`、`vars_files`、`delegate_to`、`run_once`、`until`和重试、`async`、lookup等函数调用、Jinja2语句（`{% %}`）、其他模块（包括Windows的`win_*`和各种collection），以及Windows资产。每台资产各自执行，所以拿不到其他主机的变量（`hostvars`）。

### 结果

作业页面按资产列出每个任务的play、模块、结果（**正常**、**已改动**、**失败**、**失败（已忽略）**或**跳过**）、信息、返回码和输出，循环的每一项也列出来；旁边是和`ansible-playbook`一样的输出，最后是PLAY RECAP。一台资产上没有未忽略的失败任务就算成功，退出码为0，否则为2。

每个任务记为一条[命令记录](../audit/commands.md)：`command`、`shell`和`raw`记命令本身，其他模块记模块和选项，例如`apt: name=nginx state=present`，脚本记文件名和内容。任务执行前按命令规则检查：命中拦截规则，这台资产停在这里，标为*已拦截*；命中复核规则，等另一位管理员批准这个任务。模块在资产上执行的命令也会检查，命中规则时也记下来，所以拦截`/etc/shadow`的规则同样能拦住对它的`lineinfile`。

## 查看作业

列表里每个作业显示名称、类型、状态、资产里成功和失败的台数、谁启动的、什么时候、用了多久。作业页面按资产列出状态、退出码、耗时、错误和输出，执行期间输出每隔几秒刷新。每台资产最多保留最后1 MB的输出。

| 状态 | 含义 |
| --- | --- |
| 等待中 | 还没开始，在等空闲的并发位置。 |
| 执行中 | 正在执行。 |
| 成功 | 退出码为0，或者文件已写好。 |
| 失败 | 退出码不为0，或者出错，例如登录失败。 |
| 超时 | 到了超时时间被终止。 |
| 已拦截 | 执行前被[命令规则](../audit/commands.md)拦下。 |
| 已取消 | 被**取消作业**终止，或者取消时还没轮到。 |
| 已中断 | 执行期间Casvisor重启了。 |

每台资产都成功，作业才算*成功*，否则是*失败*。

在作业页面上：

- **取消作业**：终止正在执行的，跳过还没轮到的资产。
- **重跑失败的**：在没有成功的资产上，原地再执行一次这个作业。
- **复制为新作业**：用同样的设置新建一个作业，改完再执行。

作业不在执行时可以删除，连同它的结果和上传的文件。为作业上传、但作业始终没有开始的文件，满一天后在Casvisor启动时删除。

## 计划作业

作业也可以按时间表自动运行，比如每晚备份、每小时检查。**计划作业**页面（`/job-schedules`）列出所有计划，在那里点**新建计划作业**，或者在新建作业页面点**定时运行**（会带上表单里已经填的内容）。

计划作业有作业的全部字段，另外还有：

| 字段 | 含义 |
| --- | --- |
| 执行时间 | 五段的cron表达式，依次是分、时、日、月、星期。`0 3 * * *`是每天03:00，`*/15 9-18 * * 1-5`是工作时间每15分钟，`0 2 * * SUN`是每周日02:00；也支持`@hourly`、`@daily`、`@weekly`、`@monthly`。表单里会显示接下来五次的运行时间。日和星期都写了时，和cron一样，满足其一就运行。 |
| 时区 | 按哪个时区理解执行时间，例如`Asia/Shanghai`，留空用服务器的时区。 |
| 启用 | 关闭后保留计划，但不运行。 |

playbook类计划保留自己添加的文件，每次运行复制一份给作业。

到了匹配的那一分钟，Casvisor启动一个普通作业，用计划的名字命名，在作业页面能看到并能点回它的计划；计划的**运行记录**列出它启动的所有作业。**立即运行**马上启动一次。计划上一次的作业还没跑完时，这一次跳过，并在计划上写明。Casvisor停机期间错过的运行不会补跑。

Webhook可以把作业结果发到群聊或自己的系统：`job.succeeded`（作业成功）、`job.failed`（作业失败，带上失败的资产和原因）和`job_schedule.missed`（到了时间但计划作业没有启动），在Webhook的事件里勾选即可。

作业以最后保存这个计划的管理员身份运行：按这位管理员适用的命令规则检查，作业也记在他名下。文件类计划保留自己的文件，每次运行复制一份给作业，所以删除旧作业不会把计划的文件删掉。

## 规则、会话和日志

- 命令或脚本在某台资产上执行之前，每一行都要按适用于启动作业的管理员和这台资产的[命令规则](../audit/commands.md)检查。命中拦截规则，这台资产标为*已拦截*，什么都不执行；命中复核规则，等另一位管理员批准；命中告警规则，照常执行并做标记。playbook按任务逐个检查，见[结果](#结果)。
- 每台资产上的命令或脚本记为一条[命令记录](../audit/commands.md)。文件分发记为`sftp put <文件> <目标路径>`。
- 每台资产上的执行是一个单独的[会话](../audit/sessions.md)，模式为`job`，用户代理为`Casvisor job`；停止这个会话，就停止这台资产上的作业。输出同时保存为这个会话的终端[录像](../audit/recordings.md)，和SSH会话一样回放。
- 启动、重跑、取消和删除作业会记进[操作日志](../audit/operation-logs.md)，动作分别是`start-job`、`rerun-job`、`cancel-job`和`delete-job`。

作业由管理员执行，不受[权限](../access-control/permissions.md)约束。要安装系统更新，请用[补丁管理](./patches.md)，它懂Windows Update和Linux的包管理器。
