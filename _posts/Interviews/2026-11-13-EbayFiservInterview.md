---
layout: post
title: "eBay HM — Fiserv Configuration Project"
date: "2026-11-13"
description: "Kafka 到 Redis、批处理、一致性、项目深挖与英文口述"
tag: Interviews
prime: false
---

配套：[Java / Spring / Streaming](/blog/Interviews/2026-11-13-EbayJavaSpringInterview) · [Madison-Davis 项目](/blog/Interviews/2026-11-13-EbayMadisonDavisInterview)

这份稿围绕 2026-11-13 招聘邮件要求：technical experience、individual contribution、scale / impact、collaboration、ownership 和 production problem-solving。
使用方式沿用自己的笔记习惯：先用中文理解，再讲英文短答；每题先回答基本问题，面试官继续追问才展开 follow-up。
文中的技术演练是准备方案，不是 Fiserv 源码；STAR 的空白需要用自己的真实经历填写。

## 先把项目口径对齐

| 项目 | 现有材料能支持什么 | 口述时怎么处理 |
| --- | --- | --- |
| 业务背景 | 配置数据来自 Mainframe / DB2，Redis 提供低延迟读取，Kafka 传播数据 | 可作为项目主线；不说 Redis 是 source of truth |
| 个人贡献 | 多份准备稿一致提到 Java / JavaEE bulk-load consumer、约 100 条 batching、短 timer | 讲自己负责的 ticket 和代码；精确类名、配置名待回忆 |
| 吞吐量 | 归档阅读记录指出简历约 **100k msg/s**，准备稿多为 **10k msg/s** | **存在十倍差异，暂不选择任何一个作为已核实结果** |
| 延迟 | 材料一致写受影响配置访问路径平均 API latency 降低 >50% | 要补 before / after、endpoint、窗口和测量来源；不能改说 P99 或所有 API |
| reconciliation | 多份准备稿写窗口化 Message Counts；归档记录指出当前简历未列此交付 | 先确认自己做的是 success counter、比对逻辑、告警还是 re-run 中哪些部分 |
| offset / retry | Global Picture 表述较宽；Deep Dive 与英文开场把策略和生产恢复归给 lead / team | 不自动合并为“我全部设计和实现”；说明所接触的接口与实际职责 |
| 30 ms | 总览及设计基线出现；没有对应发布配置或测试报告 | 主动讲 short time-based flush；精确数字被问到时说明需核对版本 |
| Spring / Reactor | 本次项目原件写 Java / JavaEE，没有 Spring Boot、Reactor、Cloud Stream 的实作依据 | 第 7–9 组是知识与迁移设计；只有本人确认后才加入项目经历 |
| 高级一致性保护 | UUID、hash / digest、audit、CDC reconciliation 被列为后续选项 | 用 “I would improve…”；不写进 “I delivered…” |

不要猜 100k 是峰值、10k 是持续值：这只是可能解释，材料没有证明。也不要把改成更小数字称为“保守所以正确”。
本稿依据既有准备材料整理，不是提交记录或生产监控的独立核验。原件中“可以直接说”的语句也需要与归档差异一起判断。

## 项目开场：先讲清楚，再讲数字

### 60–90 秒基本回答

> At Fiserv, I worked on a customer configuration serving project in Java. Downstream services repeatedly needed the same configuration, and those reads put pressure on a mainframe-backed data source.
>
> The system used Redis to serve repeated reads, while Mainframe/DB2 remained the source of truth. Configuration records were loaded through Kafka. My contribution was on the bulk-load consumer, particularly batch handling with a size threshold and a short time-based flush.
>
> The engineering challenge was balancing ingestion efficiency with predictable processing delay. It also required a clear boundary between fetching a message, successfully writing it to Redis, and considering the work complete.
>
> I can walk through the consumer changes I worked on, the trade-offs behind batching, and how I would investigate incomplete propagation. The broader platform and recovery policies involved the lead and other owners.

中文理解：先说重复配置读取的问题，再画 DB2 → Kafka → consumer → Redis；最后把自己的代码贡献圈出来。
只有确认 reconciliation 个人范围后，才补：“I also implemented [the success counter / window comparison / mismatch signal], working with [owner] on recovery.”
只有核对测量口径后，才补：“For [endpoint scope] over [window], average latency decreased from [A] to [B]. The ingestion group sustained [verified rate] under [conditions].”
如果被问简历中的 100k：直接承认当前笔记数字不一致，说明要核对测量范围；不要当场编一个峰值／平均值解释。

### 白板架构：标出 ownership

```text
Mainframe / DB2 — source of truth
    │ upstream bulk-load producer [team / upstream owner]
    ▼
Kafka bulk-load topic
    ▼
Java consumer → bounded batch / short timer → Redis serving layer
    │              [自己的 ticket 范围待具体化]           │
    └── success-count / window comparison [贡献粒度待确认] │
                                                       ▼
                                                downstream reads
CDC/change events = broader architecture context; not my producer implementation
```

读路径的 fallback / fail-closed 是按业务风险制定的策略；准备稿提到它们，不代表已核实每个 endpoint 都有同一种实现。
先问面试官希望深入 bulk ingestion、read path，还是 consistency；不要一口气背完整架构。

## 1. Why Redis? 为什么不是直接扩 DB2？

**基本回答**

重复读是核心问题。Redis 可以承担高频 serving traffic，让权威数据源主要负责持久数据与必要校验；收益和代价分别是读延迟下降、数据新鲜度与恢复问题增加。
项目是 Kafka 主动预热与事件刷新背景下的 configuration serving，不宜只用 “cache-aside” 一词覆盖全部路径。
英文：“We separated the authoritative data model from the read-serving path. Redis reduced repeated source reads, but it introduced a freshness obligation.”

### Follow-up：Redis 没有某个 key，返回什么？

- 区分未配置、未加载、已停用、Redis 暂时不可用；不能全部返回默认配置。
- 低风险读取可以按约定回源；关键 routing / entitlement 是否允许旧值，由业务要求决定。
- 回源必须考虑并发上限和 DB2 承载能力；Redis 故障时无限回源会转移故障。
- TTL 不证明值足够新；某个旧值仍可能处在 TTL 内。版本／更新时间与业务容忍度是另外的维度。

**失败场景**

Redis 全部超时，但 DB2 健康。先确认允许降级的请求范围，再限制回源并发、观察 source latency 和错误率；我会解释这个设计，不声称本人曾实施该事故恢复。
回答结尾：“The correct fallback depends on what a wrong configuration can do, not just whether the cache is reachable.”

## 2. 为什么 100 条 batching？timer 怎样工作？

**基本回答**

批处理摊薄网络与调度开销；size threshold 控制单批大小，time threshold 避免低流量永远凑不满。
“100” 是项目准备稿中的近似值，不是 Redis 最佳实践常数，更不自动等于 Kafka 的 `max.poll.records`。
业务 batch、Kafka poll 返回集合、Redis pipeline 是三个层次：要能分别画出来。

### Follow-up：timer 是每 30 ms 固定 flush，还是第一条进入后开始计时？

这是不同实现。现有材料不足以确定原代码；需要回忆计时起点、空批行为、shutdown drain，以及 timer 与收消息是否同线程。
演练伪代码使用单线程状态机，计时器只向同一执行器投递 flush 请求，避免两个线程同时清空 buffer：

```text
onRecord(record):
    if batch is empty: startDeadline()
    append(record)
    if batch.size >= limit: flushSnapshot()
onDeadline():
    if batch is not empty: flushSnapshot()
```

`flushSnapshot` 的实现还要保留 in-flight 记录身份；失败不能因 buffer 已清空而消失。
Redis pipelining 减少逐条等待响应的往返开销，但不能据此推断某批已全成功；这是技术解释，不是确认项目用了哪个 Redis 客户端。[Redis pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/)
失败场景：最后只来 3 条且永远没有第 4 条；测试必须验证它们会被时间条件触发，且只触发一次。

## 3. 10k / 100k、50%：怎样回答 scale 和 impact？

**基本回答**

先定义 metric，再给数字：records received、successful Redis writes、unique configurations、API requests 是不同计数。
吞吐需要补齐 group / instance、持续／峰值、负载与 payload、统计窗口、重复重试是否计入。
延迟需要补齐均值还是 percentile、同一 endpoint 与负载、缓存命中率，以及是否同期发生别的改变。

### Follow-up：batch 100、30 ms 能算出吞吐吗？

不能直接算真实集群吞吐。`100 / 0.03` 只对应很强假设下的单一批周期，timer 不等于服务时间，批可能提前达到阈值，系统也可能有并发。
容量估算可以先测每实例可持续完成速率，再考虑 partition 分配、key skew、Redis 容量、恢复余量；不要用测量结果反推未经确认的分区数。

| 需要找回的证据 | 填写 |
| --- | --- |
| 100k 所在简历条目对应测量对象 | [ ] |
| 10k 所在准备稿的数字来源 | [ ] |
| before / after 平均延迟、时间窗口 | [ ] |
| 自己的改动、其他团队改动与归因 | [ ] |

英文：“I want to distinguish ingestion throughput from read API latency. I also need to reconcile two different throughput figures in my notes before giving you a precise number.”
这句用于确实被追问的情况；面试前更好的工作是提前核实，而不是把模糊数字背熟。

## 4. Kafka offset 谁提交？manual commit 到底是什么意思？

**基本回答**

三个责任要分开：团队决定处理成功标准；应用／框架按策略请求提交；Kafka 保存 group 的 committed offset。
`poll` 读到消息、Redis 成功响应、应用 acknowledgment、broker 上 commit 完成并不是同一个时刻。
本项目材料未确认实际 ack mode，也未证明本人写过 `commitSync`；回答实际经历时先限定自己负责 batch 与哪一个完成回调。

### Follow-up：为什么不能提交整批最大 offset？

同一 partition 的 41 成功、42 失败、43 成功，提交 44 会使重启从 44 开始，42 被跳过。
要管理“按读取顺序已经连续处理完成的前缀”，而不是完成集合里的最大值；不同 partition 分开跟踪。
原生 API 的示意：`consumer.commitSync(Map.of(tp, new OffsetAndMetadata(nextSafeOffset)))`。
这里是演练，不是项目代码；调用时还要满足分区仍归本 consumer、线程与错误处理约束。[KafkaConsumer API](https://kafka.apache.org/36/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)

**失败场景**

- Redis 已写、commit 前 crash：重放可能发生；需要 replay-safe side effects。
- commit 已成功、Redis 尚未写：恢复可能跳过记录；所以完成标准不能只看提交请求已发出。
- Redis 超时：结果可能未知，不能一律视作“服务器肯定没写”。
- 转交 retry queue 后提交：必须先确认可靠交接，并解释转交与 commit 之间的失败窗口；不是自动获得分布式原子性。

英文：“I distinguish an application acknowledgment from a durable offset commit. The recovery boundary must not move past unfinished work.”

## 5. Retry、幂等与 exactly-once 怎么说？

**基本回答**

原件对于个人 retry ownership 有冲突；先说团队／lead 制定的部分，再说自己理解的 failure model。
不要把 Kafka 一概说成固定 at-least-once；消费方式与提交时机决定效果。本例讨论的是处理成功后提交、失败可能重放的设计。
Redis 写入与 Kafka offset 提交没有因为“用了 Kafka”就处于同一原子事务，因此不能宣称已经端到端 exactly-once。

### Follow-up：同一个 key 重复 SET，不就幂等了吗？

重复写同一个值可能不会改变最终值，但旧事件晚到仍可覆盖新值。幂等重复与版本顺序是两个问题。
演练方案：source version 较新才替换，比较与写入在 Redis 内原子完成；相同版本不同内容要作为异常处理，而非默默成功。
只在 Java 里先 GET 再 SET 会有竞态；可讨论 script 或 WATCH / MULTI，但不声称项目已实现它们。Redis transaction 也没有传统数据库式的执行错误回滚。[Redis transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)

**失败场景**

网络故障属于可能恢复的 transient error；格式错误通常不能靠重复执行修好。区分 bounded retry、backoff、告警与人工／隔离恢复。
三层各重试 3 次可能放大调用；明确哪个层拥有 retry budget。恢复旧 bulk load 前，还需检查它会不会覆盖较新的 change event。
删除也有顺序问题：只删 key 不保留版本信息，旧更新可能让已停用配置复活；versioned tombstone 是改进选项，不是已有交付。
英文：“Replay safety means controlling both duplicate effects and stale writes. A deterministic key alone does not solve ordering.”

## 6. Message Counts reconciliation 能证明什么？

**基本回答**

准备稿描述的是同一 bulk job / window 的 published count 与 successful Redis-write count 比较；先确认自己实现的具体部分，再使用第一人称。
不要用“消费数”替代“成功写入数”，也不要把普通成功 attempt 数当成唯一业务记录数。
producer 重试和 consumer 重放都会影响计数；需要相同的 job 身份、窗口边界、计数规则和结束条件。

### Follow-up：count 一样，是否证明完整？

不能。A 写了两次、B 没写，计数仍可能相同；值或版本错误也不会被总数发现。
如果当前实现没有去重，坦率说明这是 health signal，不能补造 UUID 去重。内容摘要、唯一事件身份、抽样源核验是未来增强。
还要问 success counter 存在哪里、是否持久化、write 与 count 之间崩溃怎么办；计数自身也是一个需要恢复的状态。

**失败场景**

正常 backlog 导致窗口暂时不一致：先检查 job 是否结束与允许滞后，再看持续 mismatch，避免每次 flush 都误告警。
反例演练：`published = 100, successful attempts = 100`，其中一个重复、一个缺失；解释为何不能宣称 load 已完整验证。
英文：“The count comparison was a propagation-health signal. It could surface a persistent gap, but it did not prove unique records or payload correctness.”
re-run 的执行权限、触发者、范围和审批由实际经历决定；“我上报告警”不等于“我操作生产全量重放”。

## 7. Reactor、Cloud Stream、Kafka Streams 是什么关系？

**基本回答**

以下是 eBay 技术准备，**不是已证实的 Fiserv 实作**。能说清概念，并不意味着可以说在项目中采用。

| 名称 | 主要解决什么 | 不等于什么 |
| --- | --- | --- |
| Java Stream | 内存数据的函数式遍历／聚合 | 不等于 Kafka 消息流或 Reactive Streams |
| Project Reactor | `Flux` / `Mono` 与异步组合、需求协调 | 本身不是 broker，也不替你定义业务提交成功 |
| Spring Cloud Stream | 应用函数与消息系统的 binder／binding 集成 | 不等于“只要使用就全部 reactive” |
| Spring for Apache Kafka | Kafka listener、container、ack 等集成 | 不等于 Cloud Stream，也不等于 Kafka Streams |
| Kafka Streams | Kafka 上的流处理库／拓扑 | 不是 Reactor 的别名 |

### Follow-up：`Function<Flux<A>, Flux<B>>` 就是端到端 backpressure？

不是。函数内部使用 reactive API，不保证 binder、客户端和 Redis 调用都支持相同的流控方式；普通 Kafka binder 与 reactive binder 也不是同一个实现。
imperative handler 和 reactive function 的错误处理边界不同；不能默认把 binder 的 message retry 配置照搬给 reactive 链。[Cloud Stream reactive functions](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/producing-and-consuming-messages.html)
英文：“Reactor describes how I compose processing. Cloud Stream connects that processing to messaging infrastructure. The binder determines important runtime behavior.”
失败场景：函数里对每条消息另起异步任务并立即返回；框架认为 handler 已返回，不代表 Redis side effect 已完成。

## 8. 如果用 Reactor 实现 batching，要注意什么？

### 基本回答与短代码

下方仅表达操作符组合；假定 `writeConfirmed` 是正确返回完成／错误信号的异步函数，**没有包含 Kafka 消费、offset 或生产恢复**。

```java
Flux<List<Record>> batches = records
    .bufferTimeout(batchLimit, flushInterval);
Flux<Void> writes = batches.concatMap(batch ->
    Mono.defer(() -> writeConfirmed(batch)));
```

`bufferTimeout` 可按数量或时间发出 batch；`concatMap` 顺序订阅内部工作，便于讨论有序完成；`flatMap` 可引入并发，不能假定完成顺序等于输入顺序。[Reactor Flux API](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html)
它没有神奇地增加 Redis capacity。buffer、prefetch、in-flight、payload 大小仍需明确边界；慢下游不能无限堆积内存。

### Follow-up：把 `retryWhen` 放哪里？

重试整个流和重试一个 batch 的作用范围不同。`retry` 会重新订阅其上游；需要检查是否重复读取／重复 side effect。
`doOnError` 只观察错误，不修复它；`onErrorResume(e -> Mono.empty())` 可能把失败变成完成，接着推进进度就危险。[Reactor error handling](https://projectreactor.io/docs/core/release/reference/coreFeatures/error-handling.html)
失败场景：100 条中 90 条已写、连接断开；整批重试只有在写操作可安全重放且计数不会误加时才合理。
不要口述“加个 `.subscribe()` 就完成了”：要说明谁管理订阅、终止错误、关闭和 side effect 完成信号。

## 9. Spring Boot 服务怎么组织？手动 ack 怎样解释？

**基本回答**

如果用 Spring 重写，我会按变化原因拆成 ingestion adapter、batch coordination、Redis writer、reconciliation service；通过构造器注入依赖，方便隔离测试。
这是设计提案。现有项目材料没有证据证明采用这些 Spring bean，也不能把“知道 SOLID”变成“实际用了某个 Design Pattern”。
批处理有可变状态，不能假定 singleton bean 就线程安全；先明确线程模型与 buffer 所有者，再决定锁、单线程执行器或分区隔离。

### Follow-up：Spring 的 manual ack 等于立即 commit 吗？

普通 Spring Kafka container 的 `MANUAL` 与 `MANUAL_IMMEDIATE` 含义不同；实际提交还受调用线程、container 配置和事务等条件影响。
`enable.auto.commit=false` 也不自动意味着每条都是业务代码直接提交，container 仍可能按配置管理提交。[Spring Kafka container](https://docs.spring.io/spring-kafka/reference/kafka/receiving-messages/message-listener-container.html)
Cloud Stream 普通 Kafka binder 可配置 manual acknowledgment；要确认项目版本、binding 名称与实际 API，不能混用不同 binder 的 acknowledgment 类型。[Cloud Stream manual ack](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/manual-ack.html)
演练伪代码：`writeAndWaitForOutcome(record); acknowledgeIfSafe(record);`；重点是第一步的完成含义，而非注解或方法名背得多。
失败场景：`writeAsync(record); ack.acknowledge();`——提交路径可能领先于异步写入完成。先写失败测试证明时间关系，再修改流程。
英文：“I would make completion explicit at the service boundary, so the adapter acknowledges completed work rather than merely scheduled work.”

## 10. Production troubleshooting：配置为什么没更新？

**基本回答**

先澄清客户影响、受影响 key／范围、开始时间、最近变更，再建立一条记录从 source 到 serving 的证据链。
排查次序：source 当前值 → job / event → Kafka topic-partition-offset → consumer outcome → Redis 实际 key/value → downstream read。
日志以 job / correlation ID 关联；不要把敏感配置 payload 或完整客户信息打进日志。

| 信号 | 能回答的问题 | 不能单独证明 |
| --- | --- | --- |
| consumer lag / oldest age | 是否积压、延迟多老 | Redis 数据一定正确 |
| batch size / flush reason / latency | 凑批还是处理慢 | 配置业务有效 |
| Redis timeout / error / latency | 存储或网络是否异常 | timeout 一定未写入 |
| reconciliation gap / age | 某 job 是否持续不对齐 | 哪条 payload 出错 |
| read latency / errors / fallback | 客户路径是否受影响 | 所有节点与版本一致 |

### Follow-up 与失败场景

lag 是 0 但数据旧：检查提前提交、错误 key、旧事件覆盖、下游本地缓存、缺失上游事件；不要先重启一切。
讲真实事故时填：我看见的信号 [ ]、我亲自验证的假设 [ ]、团队采取的止损 [ ]、恢复证据 [ ]。
如果没有独立 on-call 经历：“I supported diagnosis within my component; production recovery decisions were owned by [actual owner].”

## 11. 你怎么测试，怎么避免修完又坏？

**基本回答**

先讲自己真的写过的测试 [待填]；下面是补齐准备的测试设计，不能全部改成过去时。
单元测试验证边界，集成测试验证外部接口与失败语义，负载测试验证吞吐／延迟取舍；每项都有可观察的 assertion。

| 用例 | 预期检查 |
| --- | --- |
| 99 / 100 / 101 条 | size threshold 与剩余数据不丢、不重复 flush |
| 低流量与空 buffer | timer 生效；空批不产生无意义写入 |
| timer 与第 100 条同时触发 | 每条仅属于一个 batch；in-flight 状态可追踪 |
| Redis 部分成功／timeout | 未知结果不被计为可靠成功；未完成工作不被越过 |
| 写入后、commit 前 crash | 重启重放保持最终业务结果；计数语义仍可解释 |
| 旧 bulk 与新更新交错 | 如果实现了版本保护，旧数据不会覆盖新数据 |
| 持续负载＋慢 Redis | backlog 可观测、内存有界、恢复后能追赶 |

### Follow-up：测试怎么确定性地复现时间竞态？

用可控制的时钟／scheduler 和可控制完成时机的 fake writer，不靠 `sleep(30)` 碰运气。
把失败测试先缩小到一个 batch 或 partition；修复后跑同类边界，解释为什么修复建立了 invariant。
准备时把“实际做过的测试”和“现在补充的测试设计”各举一个例子。

## 12. Ownership、协作与 eBay Search 的关联

**基本回答**

ownership 可以是把一个 ticket 从澄清、实现、验证到交接做完整，不需要声称自己拥有整个主机、Kafka 与 Redis 平台。
跨团队讲清楚输入契约、完成标准、失败时谁处理、需要对方提供什么证据；技术分歧用测量和风险讨论，而非只说“我说服了 senior”。
映射到 Search：共同点是权威数据与 serving copy、更新传播、freshness、回放和可观测性；搜索索引与 Redis 配置不是同一个产品。
英文：“The transferable lesson is keeping a fast serving layer trustworthy. I would apply the same discipline to update propagation and freshness in a search backend.”

### 三个可填 STAR

| 故事 | S / T | A：只填自己的动作 | R / 复盘 |
| --- | --- | --- | --- |
| 性能与交付 | 哪条路径慢 [ ]；我的 ticket [ ] | 测量 [ ]、batch 改动 [ ]、验证 [ ] | 已核实延迟／吞吐 [ ]；其他团队贡献 [ ] |
| 难题与排障 | 具体现象与影响 [ ] | 假设 [ ]、证据 [ ]、找到原因 [ ]、与谁协作 [ ] | 恢复信号 [ ]；新增测试／监控 [ ] |
| 技术分歧／优先级 | 双方方案与约束 [ ] | 我听到的担忧 [ ]、实验／折中 [ ]、决定记录 [ ] | 结果 [ ]；我改变看法的地方 [ ] |

若没有 mentorship 实例，不编“带 junior”；可讲真实的 peer support、代码解释、文档或 review 协作，明确对象和范围。
每个故事准备 45 秒与 2 分钟两版：背景少讲，自己的判断与动作多讲，结果最后用已核实证据落地。

## 无 AI 口述自测：45 分钟

1. 5 分钟：关掉准备稿，用英文开场并画链路；标出自己与团队边界。
2. 10 分钟：随机抽第 2、4、6 组，分别讲 batch、commit、count 的区别。
3. 10 分钟：解释两个失败窗口：Redis 写后 crash；部分 batch 失败但后续消息成功。
4. 10 分钟：选一个真实 STAR，连续追问三次 “What did you personally do?”。
5. 5 分钟：区分 Reactor / Cloud Stream，说明为何代码异步不等于完成可靠。
6. 5 分钟：回看录音，只记事实缺口、逻辑跳步和冗长处；下一遍用自己的话讲。

按最新邮件，正式面试过程中不使用 AI 工具；自测应能离开此稿完成，不依赖实时提示。

## 面试前待核实清单

- [ ] 100k 与 10k：找到原测量或真实上下文；不能自行解释为 peak / sustained。
- [ ] >50%：endpoint 范围、before / after、平均值口径、时间窗口与团队归因。
- [ ] batch 实现：100 的来源、timer 起点、30 ms 是否真实 release 配置、线程模型。
- [ ] 实际 Kafka integration：原生 consumer、框架／版本、ack mode；谁写策略、谁写代码。
- [ ] reconciliation：本人完成哪些模块；去重／计数持久化是否存在；re-run 由谁执行。
- [ ] 实际 Redis 客户端、pipeline／批接口、key 格式；没有证据就不填 TTL、分区数、节点数。
- [ ] 两个真实测试，一个排障／困难案例，一个合作／分歧案例；没有则如实说明范围。

## 项目材料入口

本地归档：`工作/工作经历/Fiserv/资料-000028ConfigurationProject/`。

- `Current.md` / `Record.md`：项目入口与版本。
- `衍生资料/ReadingNotesR0001.md`：100k / 10k、ownership 与 reconciliation 的材料差异。
- `原件版本/V0001/ConfigurationDeepDiveQuestionsV0001.md` / `InterviewOpeningAndDifficultProjectV0001.md`：旧口述与深挖稿。
- `原件版本/V0001/RedisKafkaGlobalPictureUpdated20260903V0001.md`：整体链路与工作背景。
- `原件版本/V0001/RedisKafkaCapacityBaselineDated20260913V0001.md`：容量参考设计。
- `原件版本/V0001/RedisInterviewKnowledgeV0001.md`：通用 Redis 知识。

技术原理对照文中的 Apache Kafka、Redis、Spring、Reactor 官方文档；查阅日期为 2026-11-13。当前文档版本不代表项目当年的版本。
