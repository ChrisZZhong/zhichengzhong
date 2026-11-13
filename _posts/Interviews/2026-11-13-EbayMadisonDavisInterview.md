---
layout: post
title: "eBay HM — Madison-Davis Payment Project"
date: "2026-11-13"
description: "支付编排、Outbox、通知恢复、项目深挖与英文口述"
tag: Interviews
prime: false
---

配套：[Java / Spring / Streaming](/blog/Interviews/2026-11-13-EbayJavaSpringInterview) · [Fiserv 项目](/blog/Interviews/2026-11-13-EbayFiservInterview)

更新：2026-11-13。按 HM 会关心的 project、ownership、scale/impact、Java/Spring、排障和协作整理。先讲一条完整主线，再让面试官选方向追问。

这份是口述准备稿。项目事实来自已归档的个人材料，不是代码审计或生产验收报告。括号里的待补项需要自己核实，不能背成已经发生的事。

## 先把能说的和还不能说的分开

| 类别 | 现在能怎么用 |
| --- | --- |
| 已有材料支持的个人自述 | ECWS 为银行和 credit unions 提供支付编排；自己重构 orchestration 为 `fs-internal-services`，拆出异步 receipt email；参与应用侧集成、发布与排障 |
| 已明确的职责边界 | DP、Kafka/CDC 平台、Core/Mainframe、reconciliation 不是自己独立建设或运维；自己负责所属应用链路及跨团队协作 |
| 已确认的设计时序 | 收到 Mainframe response 后，以 Oracle 本地事务一起写 workflow record 和 outbox；这段事务不跨越前面的远程调用等待 |
| 个人估计或简历结果 | 月请求 5–10 亿、峰值约 1,000 QPS 是回忆估计；3× capacity、约 90% 长尾失败下降是自述结果，缺统计报告与完整口径 |
| 准备稿中的进一步设计 | atomic claim、租约、完整通知状态机、provider 查询、UNKNOWN 邮件对账、精确 topic/Pod/retry 参数；尚不能称为实际生产实现 |

特别注意：**Outbox/CDC 解耦本身有个人材料支持；具体表、唯一约束、claim 协议和成功率口径仍未核实。** 不能把这一整块都说成没做过，也不能把准备稿里补出来的实现细节全部算进自己的交付。

旧开场写过“超过 99% 通知成功”，但阅读记录说明当前简历未列这个数；本稿不把它放进开场。旧稿还把“provider acceptance 已落库”写成成功口径，当前没有实际 dashboard 定义支持。

## 60 秒英文开场

> At Madison-Davis, I worked on ECWS, a payment orchestration service used by banks and credit unions. My main responsibility was refactoring the orchestration module into a Java and Spring Boot service and separating receipt email delivery from the payment workflow.
>
> For the notification path, we used an Oracle transactional outbox, CDC, and Kafka, with retries and a dead-letter path for failures. My scope was the application integration and recovery behavior. Other teams operated the Kafka and CDC platforms and the Mainframe-backed payment capabilities.
>
> The challenging part was defining what each component could guarantee when a dependency failed. I also worked with infrastructure, QA, and application teams on releases, logging, and troubleshooting.

先停在这里。不要主动背分区数、数据库版本、全部 Mainframe 请求类型。对方问 impact，再讲核实过的结果；问难点，再进入失败路径。

## Q1. 这个项目到底解决什么问题？

**基本回答**

旧编排运行在固定 Linux 服务器上，峰值时段出现过 request 卡住、需要重启恢复，以及用户收不到 receipt email 的现象。旧日志放在数据库里，我们的数据库访问权限又有限，定位问题比较困难。

我的工作包括重构 orchestration，以及把 receipt email 从支付主流程拆出来。这样支付编排可以独立部署和扩展，通知有自己的异步消费与失败恢复路径；迁移中也加入 Splunk 集中日志和 global trace ID。

### Follow-up：旧系统根因是什么？

目前材料确认的是现象，还不能下结论说一定是线程池耗尽、连接泄漏或死锁。面试时要把“看到什么”和“证明了什么”分开。

可以说：`We observed requests getting stuck during peak periods. I would separate that observation from a confirmed root cause; I don't want to attribute it to a thread or connection leak without the incident evidence.`

待补：挑一个自己参与过的具体 incident，把时间线、日志、最终结论补上。没有那条记录，就不要把平台迁移故事改写成某次故障修复故事。

## Q2. 你个人负责什么？团队负责什么？

**基本回答**

我是 mid-level Software Developer，接到的是 orchestration 模块重构任务；迁移后的服务叫 `fs-internal-services`。在这个范围内，我拆出 email receipt 链路，做应用侧 Outbox/CDC/Kafka 集成，以及 retry、backoff/jitter、DLQ/replay。

| 我能讲的 ownership | 需要清楚划出的边界 |
| --- | --- |
| 编排应用和通知链路的实现、集成、排障 | 不是整个支付平台的 architect |
| 向平台团队提供 source/destination/schema 等契约 | 不是自己运维 Kafka 集群或 CDC runtime |
| 与 DP team 提票、联调流量 | 不声称维护 DataPower 或 SOAP Translator |
| 与基础设施、QA、应用团队协作发布 | 不声称自己实现所有网络、DB HA 或 Mainframe 能力 |
| 解释超时和本地提交失败的恢复边界 | reconciliation 已存在，但不是自己实现 |

### Follow-up：哪些决定是你做的？

选两个能讲出过程的决定：例如通知从主链路分离、失败分类与重试策略。每个补清楚：原要求是什么、你提出了哪部分、谁参与评审、谁拍板、你落地到什么文件或测试。当前材料不足以填这段决策过程，不能一律说 `I designed everything`。

## Q3. Walk me through one payment request.

### 基本链路

```text
Legacy SOAP client → DataPower → 独立 SOAP-to-REST Translator
                                      ↓
                             fs-internal-services
                                      ↓
                                  Core APIs
                                      ↓
                         Mainframe-backed capabilities

Mainframe response → Oracle workflow record + outbox（同一本地事务）
                  → CDC → Kafka → Email Consumer → 邮件服务
```

DataPower 处理鉴权、限流与 routing；SOAP-to-REST 是前面的另一个 server 做的，不是 DP 自动完成。Core 面向编排暴露 HTTP API，内部仍可能通过 MQ request/reply 访问 Mainframe，这两件事不矛盾。

### Follow-up：DB2 是干什么的？

初始 DB2 lookup 用于获取用户相关信息，不是获取 token。transactionID 在请求 token 中携带，是另一件事。上游生成 ID 的确切组件和唯一性范围还需要核实。

### Follow-up：HTTP 变 REST 后，老客户怎么办？

材料记录旧版本保留，给客户 18 个月迁移到新 server，新客户逐步接 REST。不能据此说所有客户已迁完，也不能自行补充灰度、双写或自动回滚实现。

## Q4. 为什么拆微服务？为什么不是只加机器？

**基本回答**

我会围绕真实边界讲：编排和通知的延迟、扩容与失败方式不同。邮件失败不应该让支付请求继续等待；独立通知链路也更容易观察失败和安排补发。OpenShift 为应用提供水平扩展的部署基础，但服务拆开本身不会自动解决下游瓶颈。

### Follow-up：拆开后付出了什么代价？

增加了事件契约、重放、跨服务追踪和运维复杂度。我们需要明确业务结果、通知意图、消息和发送结果分别在哪一层能查到，而不能只看 HTTP 返回成功。

### Follow-up：你用了哪些 Design Pattern？

先讲解决了什么问题，再说名字。Transactional Outbox 有实际材料支持；Strategy、Factory、Adapter 可以用于解释不同通知渠道或下游封装，但没有证据说明项目使用，就说“如果扩展，我会考虑”，不要为了显得懂模式而补一套历史。

## Q5. Outbox 解决了哪个一致性问题？

**基本回答**

如果先提交 workflow record，再发 Kafka，两步之间崩溃可能导致本地记录有了、通知事件没了；反过来先发 Kafka，又可能让下游看到后来回滚的业务变化。我们将 workflow record 和 outbox 放在同一个 Oracle 本地事务里，然后通过 CDC 发布已提交的通知意图。

Outbox 模式用来协调应用本地状态与对外事件；Debezium 的 Outbox Event Router 读取 outbox 并转换为事件。它不是把 Mainframe、Oracle 和邮件服务包进一个全局事务。[Debezium 官方说明](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)

### Follow-up：收到 Mainframe response 就一定发邮件吗？

不一定。response 也可能是失败或其他业务状态；要由响应码和通知资格规则决定。真实响应码映射、哪些状态触发 receipt，目前材料没有列出，需要自己补。

### Follow-up：为什么不直接 CDC 所有业务表？

这是设计解释：数据库变化不必然代表“应该发 receipt”。显式 outbox 把通知意图表达出来，减少其他状态更新或修复动作被误当成通知的风险。实际事件字段、event type 和 schema 版本策略待核实。

## Q6. Java / Spring 事务边界怎么落地？

**基本回答**

确认过的时序是先等远程 Core/Mainframe response，再开本地 Oracle 事务写 workflow record 和 outbox。不要把等待 MQ、调用 HTTP 或 SMTP 放进这段本地写事务。

下面是**说明边界的伪代码，不是项目原代码**；真实实体、repository、异常类型和业务规则都需要核实。

```java
// Orchestrator 和 WorkflowWriter 是不同的 Spring-managed beans。
public PaymentResponse handle(PaymentRequest request) {
    CoreResult result = coreClient.execute(request); // 在本地写事务之外
    workflowWriter.recordResult(request, result);
    return responseMapper.map(result);
}

@Transactional
public void recordResult(PaymentRequest request, CoreResult result) {
    workflowRepository.save(toWorkflowRecord(request, result));
    if (notificationPolicy.isEligible(result)) {
        outboxRepository.save(toReceiptEvent(request, result));
    }
}
```

### Follow-up：有 `@Transactional` 就一定生效吗？

默认 proxy 模式下需要经代理调用；同一个对象内直接 self-invocation 不会额外触发该注解的事务拦截。还要确认两个 repository 参与同一个事务管理器和数据库事务，不能只看注解存在。[Spring 官方说明](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

### Follow-up：写 outbox 失败怎么办？

目标是两个本地写入一起回滚。要真实测试异常传播与 rollback 配置；Spring 常见默认规则对 runtime exception 和 checked exception 不一样，不能 catch 后吞掉异常还宣称原子提交。这里是验证要求，不是已确认的项目异常类配置。

## Q7. Mainframe 成功了，自己的服务失败怎么办？

**基本回答**

这正是 Outbox 没有覆盖的跨系统窗口。材料已确认：已有 reconciliation service 会处理 Core 超时导致结果未知，以及 Mainframe 成功后本地持久化失败导致的不一致。我负责 orchestration 和通知链路，不负责 reconciliation 的实现。

| 失败位置 | 能确定什么 | 不能直接做什么 |
| --- | --- | --- |
| Core 调用超时 | 没有在等待期限内取得明确结果 | 把超时等同付款失败，然后重新扣款 |
| Mainframe 成功、本地 Oracle 写入失败 | 本地可能缺 workflow/outbox | 指望邮件 DLQ 自动发现不存在的事件 |
| Oracle commit 超时 | 客户端不知道提交结果 | 直接认定数据库没提交 |
| Oracle 已提交、CDC 暂时不可用 | 通知意图已在本地持久化 | 将付款当失败，或跳过恢复过程重发支付 |

### Follow-up：reconciliation 怎么补邮件？

目前不知道它的数据来源、触发机制、修复时限，以及是否通过同一应用入口补出 outbox。可以说明需要恢复“本地状态和通知意图的一致性”，但不能说已经实现了某个 callback 或 repair API。

可直接说：`Our existing reconciliation service handled those cross-system inconsistencies. I owned the orchestration and notification flow, and I would need to verify the exact repair-to-outbox handoff.`

## Q8. 支付幂等和邮件幂等有什么不同？

**基本回答**

支付请求带唯一 transactionID，后端对同一 ID 提供幂等行为；同一交易重试保留原 ID。但幂等具体由 orchestration 还是 Core 实现、如何持久化并处理并发，当前还没核实。

通知的业务去重 key 在材料中是 `transactionId + notificationType`，图里有 consumer 回写 Oracle。它与支付防重解决的是两种不同副作用，不能因为邮件去重就推导付款不会重复。

### Follow-up：两个消费者同时查到没发过呢？

单纯 `alreadySent → send → markSent` 有 check-then-act 竞争。设计上可以用数据库唯一约束、条件更新/claim 来限制同一通知的并发处理；但项目真实 claim、状态表和租约协议尚未确认。这部分只能作为改进讨论。

### Follow-up：邮件已经发了，但标记 SENT 前崩了？

本地 claim 也无法消掉外部副作用的不确定窗口。需要先知道邮件服务是否支持业务幂等键、发送结果查询或可靠回执；当前能力未知。不能把 SMTP Message-ID 当成已经获得服务端去重保证。

## Q9. Kafka 为什么仍会重复？Offset 何时提交？

**基本回答**

按 at-least-once 思考：处理后、提交 offset 前崩溃，接管消费者可能重读。Kafka 内部的事务能力也不会自动把外部邮件发送变成 exactly-once；外部系统需要额外配合。[Kafka 官方 delivery semantics](https://kafka.apache.org/41/design/design/)

### Follow-up：你的项目到底怎么提交 offset？

当前材料没有确认真实 AckMode、auto-commit 与失败转发配置，所以不能背成“我用 RECORD 并保证先落 SENT”。原则上要在处理完成或失败责任可靠转交后才推进；具体代码要核实，尤其注意 Kafka 转发成功但原 offset 尚未提交的重复窗口。

### Follow-up：增加 consumer 就能一直扩容吗？

对于这里讨论的传统 consumer group，同一个分区在组内由一个 consumer 分配处理。额外 consumer 超过有效分区数不会继续增加这种模型的并行度；还要看邮件服务速率、Oracle 和单次处理时延。实际分区数不明，不用准备稿里的 48 当生产答案。

## Q10. Retry、DLQ、replay 怎么解释？

**基本回答**

实际材料支持的链路是：main topic → Email Consumer → 暂态失败进入 retry topics，使用 exponential backoff + jitter；不可重试或耗尽后进 DLT，再做 controlled replay。正常时邮件失败较少，SMTP 或网络异常时可能集中出现。

### Follow-up：为什么不是 listener 里 sleep？

Retry topics 可以把等待移出主消费路径，但代价是原有处理顺序可能改变。Spring 的 non-blocking retry 文档明确提示这一 ordering 变化；如果业务要求严格顺序，需要另外设计，不能只说 Kafka 有序。[Spring Kafka 官方机制](https://docs.spring.io/spring-kafka/reference/retrytopic/how-the-pattern-works.html)

### Follow-up：哪些失败不应该盲重试？

这是准备时应会的分类：明确暂态拒绝、确定不合法的数据、权限/配置错误、发送后结果不明，处理不应相同。尤其网络 timeout 不一定证明邮件没被接受，要结合失败阶段和服务协议判断。

### Follow-up：具体几次，间隔多少？

图上 1m/2m/4m 与旧问答的 15s/1m/4m/16m/30m 不一致。实际次数、jitter、cap 尚未确认，不选一个看起来漂亮的数字硬背。DLT 只保留失败线索，仍要有人诊断、修复、审计并决定能否 replay。

## Q11. Scale 和 impact 怎么讲才经得起追问？

**基本回答**

先区分业务到达流量、稳定处理容量、通知流量。材料的月请求 5–10 亿、peak hour 约 1,000 QPS 是估计；按 30 天折算月量，平均约 193–386 QPS，算术相容不代表监控已证明。请求数不能直接换算支付笔数或邮件数。

| 指标 | 当前证据状态 | 说之前补什么 |
| --- | --- | --- |
| 3× peak capacity | 简历/个人自述结果 | 旧新环境、稳定持续时间、延迟与错误门槛、流量模型 |
| 长尾通知失败约下降 90% | 简历/个人自述结果 | “失败”定义、观察窗口、分母、重试后还是当次失败 |
| 通知成功超过 99% | 仅准备稿；当前简历未列 | 实际成功定义及报告；没核实先不说 |
| 5–10 秒 | 本地流程观察 | 不能当生产平均、p95/p99 或 SLA |
| 48 partitions、6 Pods、120/s | 容量参考设计 | 不能当已部署参数或结果依据 |

### Follow-up：3× 是你单独做到的吗？

讲清这是更广泛迁移的项目结果，自己的贡献是所属编排和通知部分，不将整个团队平台成果都归到自己。如果无法回忆比较基线，先讲功能结果：支付不再等待邮件、通知失败有独立恢复路径、排障有集中日志与 trace ID。

### Follow-up：流量变成 10× 怎么办？

先测瓶颈：应用在途请求、Core latency、连接池、Oracle commit、CDC lag、邮件配额。扩 Pod 可能增加下游压力；Kafka 可以缓冲通知，不能代替同步 HTTP 请求正在占用的资源。

## Q12. 客户说“付款成功但邮件没到”，怎么 debug？

### 基本排查路径

先用 transactionID / trace ID 限定一笔请求，再沿责任链查，不先猜是 Kafka 的问题。下面是**建议排查顺序**，不是一场已证实事故的复述。

1. 核实 Core/Mainframe 最终结果及通知资格：这笔是否应该发 receipt？
2. 查本地 workflow record 和 outbox：通知意图是否落库？
3. 有 outbox 没事件：查 CDC 进度、错误、路由/schema；找平台团队协查。
4. 已在 Kafka：查对应 consumer 的处理日志、积压、失败分类及 retry/DLT。
5. 已尝试发送：区分邮件服务拒绝、结果不明、接受后退信，以及“用户未见到”。
6. 确定恢复入口；replay 通知时保留业务标识，不能重新触发付款。

### Follow-up：哪些监控最有用？

材料明确加入了 Splunk 与 global trace ID。以下指标是准备建议，不能全部说成已经上线的 dashboards：请求量/错误/分段时延、连接池等待、outbox 到 Kafka 延迟、consumer lag 和最老消息年龄、retry/DLT 增量、邮件接受/拒绝/未知结果、恢复后的净排空速度。

`lag=0` 只说明消费位置跟上了，不能独立证明用户收到邮件。trace ID 用于串联一次执行；幂等 ID 用于识别同一业务意图，重试可能有不同执行 trace，但不应该随意换业务 ID。

## 测试怎么讲：把“我做过”和“我会补”分开

材料支持跨 QA/CAT/production 协作，没有逐条证明下面测试已经跑过。面试前标出自己实际写过、执行过、参与验收过的部分；其余用 `I would add a test for...`。

| 层级 | 应能解释的测试 | 核心断言 |
| --- | --- | --- |
| Unit | 资格判定、响应映射、异常分类 | 失败响应不误触发 receipt；分类符合真实协议 |
| DB integration | workflow/outbox 的提交与回滚 | 任一个写入失败不留下半个本地事务 |
| Contract | Core 响应、event schema、consumer 反序列化 | 生产者消费者理解相同的字段与业务含义 |
| Duplicate/concurrency | 同一通知重复、并发消费 | 验证真实去重机制，不能只验证单线程 happy path |
| Fault injection | Core 超时、本地提交失败、CDC 停顿 | 不重复付款；未知结果保留恢复责任 |
| Notification failure | 邮件明确拒绝、发送后响应丢失 | 能区分失败和未知；不声称本地锁消除所有重复 |
| Recovery | retry 转发失败、DLT replay、消费者重启 | 责任不静默丢失；重放仍走正常校验 |
| Load/release | 峰值、依赖变慢、发布期间在途处理 | 测有效完成率和恢复时间，不只看 CPU |

## HM / BQ：三条故事，先填真实过程

### 故事 1：Most difficult project — 编排改造与邮件解耦

- **Situation：** 旧流程有峰值卡住、receipt 缺失和排障困难；不是每种现象都已有确认根因。
- **Task：** 自己负责 orchestration 重构及通知应用链路；实际交付时间与验收目标待补。
- **Action：** 讲自己落地的一两个改变、怎样验证、怎样与平台/QA配合；不要用组件清单代替行动。
- **Result：** 优先讲已支持的架构结果；3×/约90%需能回答测量口径。
- **Reflection：** 一个真实取舍或做得不够好的地方：[待补]。

英文骨架：`The hardest part was [真实难点]. I was responsible for [具体范围]. I changed [自己实现], worked with [实际团队] to verify [验收], and the outcome was [有依据结果]. One thing I would improve is [真实反思].`

### 故事 2：Ownership / cross-team collaboration

有材料支持的切入点：与 DP team 提票打通流量；向 Kafka/CDC 团队给配置与 schema；与 QA、基础设施、应用团队做 CAT/production release。

填空：`哪次依赖阻塞了什么 → 我先收集了什么证据 → 我如何给对方可执行的信息 → 谁负责哪个动作 → 怎样确认恢复/验收`。

没有证据说发生过争执、对方拒绝合作或你说服了 senior。若 HM 问 conflict，用实际发生过的分歧；不要把普通联调包装成冲突故事。

### 故事 3：Production issue / debugging

已知现象不能自动成为你亲手解决的 incident。先填下面这条，再练 90 秒口述：

| 必填项 | 你的真实内容 |
| --- | --- |
| 什么时候、什么告警/反馈 | [待补] |
| 用户影响及范围 | [待补，不猜金额/人数] |
| 自己看到的日志/trace/指标 | [待补] |
| 排除了哪些假设、凭什么 | [待补] |
| 临时止损与最终修复 | [待补，区分本人/他人] |
| 修复后如何验证与防复发 | [待补] |

## 面试前优先核实的 10 项

1. 自己实际改的 service/class/module、关键 PR 或测试类别，至少能举一个具体例子。
2. Java、Spring Boot、Spring Kafka、ORM 的真实项目版本；参考设计版本不等于生产版本。
3. Oracle workflow/outbox 表的真实字段、事务入口与唯一约束。
4. 支付 transactionID 的生成方、唯一范围，以及真正执行幂等的服务。
5. 通知去重的真实表、并发协议、offset 提交方式；不默认存在 atomic claim。
6. 邮件服务是否有幂等/查询/回执，以及结果不明时现有流程怎么处置。
7. 实际 retry 次数、间隔、jitter、DLT/replay 操作方式。
8. reconciliation 怎样补 workflow/outbox；它已存在这一点不用再待确认。
9. 3× 与约90% 的基线、窗口和分母；核实前不用 >99% 作为业绩。
10. 一个真实跨团队故事、一个真实排障故事、CAT 的实际含义和自己承担的发布步骤。

## 项目材料入口

本地归档：`工作/工作经历/MadisonDavis/资料-000027PaymentProject/`。

- `Current.md` / `Record.md`：项目入口与版本。
- `原件版本/V0001/ProjectContextNotesV0001.md`：个人确认的职责、架构时序和恢复边界。
- `衍生资料/ReadingNotesR0001.md`：不同材料之间的差异与待核实处。
- `原件版本/V0001/InterviewOpeningAndDifficultProjectV0001.md` / `PaymentDeepDiveQuestionsV0001.md`：旧口述与深挖稿。
- `原件版本/V0001/EcwsPaymentEmailReferenceDated20260913V0001.md`：容量与配置参考设计。
- 同目录的 `HighLevelArchitectureV0001.jpg`、`NetworkArchitectureV0001.jpg`、`CoreWorkflowV0001.jpg`、`NotificationArchitectureV0001.png`：架构图。

技术链接用于解释通用机制；实际版本、配置和个人交付范围以自己的项目记录为准。
