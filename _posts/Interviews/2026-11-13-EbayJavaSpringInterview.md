---
layout: post
title: "eBay HM — Java / Spring / Streaming"
date: "2026-11-13"
description: "从项目出发复习 Java、Spring、事务、消息流、测试和生产排障"
tag: Interviews
prime: false
---

这份按自己的老笔记习惯整理：先能用几句话讲清，再接 follow-up 和代码。
用途是 eBay Search Backend 的 HM 准备，也能给后面的 debug / refactor 打基础。它不是公司题库。

配套：[Madison-Davis 项目](/blog/Interviews/2026-11-13-EbayMadisonDavisInterview) · [Fiserv 项目](/blog/Interviews/2026-11-13-EbayFiservInterview)

## 0. 这次先复习哪些

11/13 recruiter 邮件明确提到 Java、Spring Boot、微服务、分布式系统、API、常见后端设计模式、生产排障、监控和测试。
回答时先确认问题，再解释思路；项目要讲个人贡献和取舍。邮件已明确面试期间不使用 AI。

|优先级|先做到什么|可以连到的项目|
|---|---|---|
|P0|DI / proxy / transaction 能用自己的话解释|支付编排与本地数据库写入|
|P0|读懂消息处理链路、失败与重试边界|通知、Kafka → Redis|
|P0|集合、异常、线程池和测试能看代码分析|批量写、并发与错误处理|
|P0|讲一个有证据的排障过程|用真实项目材料，不临时编事故|
|P1|API、安全、JPA、缓存与配置|根据 HM 的追问展开|
|P1|设计模式、系统扩展与观测|解释为什么需要，而不是背名词|

普通 Java 片段按 Java 17+ 语法写；Spring 示例是学习片段，省略业务类和项目依赖，不是可直接启动的工程。框架版本、binder 和提交模式都以实际项目配置为准，不能从当前官方文档推断自己或 eBay 的版本。

## 1. Java 基础：先把值、状态和集合讲清

### 1.1 equals / hashCode / 不可变对象

- 对象的 `==` 比较引用；`equals` 的值语义由类定义。
- 覆写 `equals` 时要保持 `hashCode` 契约：相等对象必须有相同 hash，相同 hash 不保证相等。
- 作为 HashMap key 的对象，放进去后别再改变参与 equals/hashCode 的字段。
- `final List` 只是引用不能重新赋值，里面的元素仍可能改变。不可变 DTO 要考虑防御性拷贝，内部元素是否可变也要看。

小例子：

```java
String a = new String("PAID");
String b = new String("PAID");
boolean sameObject = a == b;            // false
boolean sameValue = Objects.equals(a, b); // true，也处理 null
```

**Follow-up：**“字符串常量有时用 == 也通过”不证明实现正确；应该用不同实例写回归测试。
这类问题能解释清楚，比记一串底层术语更有用。[Object 契约](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html)

### 1.2 集合怎么选

|集合|典型用途|容易追问|
|---|---|---|
|ArrayList|顺序遍历、按索引读取|中间插删要移动；扩容有成本|
|HashMap / HashSet|按 key 找对象、去重|equals/hashCode、重复 key、可变 key|
|ArrayDeque|队列、栈、BFS|通常不需要用老的 Stack|
|PriorityQueue|Top K、最早截止任务|只保证堆顶；遍历不等于有序|
|ConcurrentHashMap|多线程共享映射|单个操作安全不代表整段业务原子|

一个常见并发错误：

```java
// 即使 map 是 ConcurrentHashMap，这两步也不是一个原子操作。
if (!map.containsKey(key)) {
    map.put(key, value);
}

// 只解决“这个 key 没有值就放入”的原子语义。
map.putIfAbsent(key, value);
```

跨多个 key、修改 value 内部对象、扣库存再写订单，仍要另想一致性方案。
不要在 `computeIfAbsent` 的计算函数里随意塞慢网络调用。[ConcurrentHashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)

### 1.3 金额为什么别随手用 double

明确货币、精度和舍入规则。使用 BigDecimal 时优先从十进制字符串或约定的最小货币单位构造。
`new BigDecimal("2.0").equals(new BigDecimal("2.00"))` 为 false，因为 scale 不同；`compareTo` 为 0。

```java
BigDecimal price = new BigDecimal("12.30");
BigDecimal total = price.multiply(BigDecimal.valueOf(3));
// 保留几位、在哪一步舍入，要由业务契约决定。
```

**项目联系：**支付编排要先说清自己负责传递、校验还是金额计算；不能因为讨论 BigDecimal 就声称做过账务计算。[BigDecimal](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html)

## 2. 异常、并发和 JVM：沿着失败路径回答

### 2.1 Checked / unchecked exception

Checked exception 要在编译时 catch 或声明；unchecked 不要求这样处理，二者都可能在运行时发生。
不要把 catch 写成“记录日志然后 return success”。

```java
try {
    rawJdbcDao.save(change); // 此自定义 DAO 声明 throws SQLException
} catch (SQLException ex) {
    throw new ConfigWriteException("Could not persist configuration", ex);
}
// ConfigWriteException 为示例 RuntimeException 子类；保留 cause。
```

这里演示原生 JDBC 的 checked exception。Spring Data Repository 通常使用 Spring 的数据访问异常体系，不能把 `save` 默认理解成会抛出声明式 `SQLException`。[Spring 异常转换](https://docs.spring.io/spring-framework/reference/data-access/dao.html)

**Follow-up：**

- 谁负责重试？不能每一层都独立重试。
- 是短暂故障还是输入本身不合法？后者反复重试通常没有意义。
- try-with-resources 管理连接/流；归还连接池和关闭物理连接不是一个概念。
- 错误返回要有稳定语义，日志保留定位信息，不打印秘密或完整敏感 payload。

### 2.2 synchronized / volatile / Atomic

- `synchronized`：对同一把 monitor 的互斥，以及相关可见性。
- `volatile`：可见性和排序约束，不让 `count++` 变成原子操作。
- Atomic 类：单个值的原子更新；多字段业务不变量仍需共同保护。
- `ConcurrentHashMap` 的 value 如果是普通可变 List，也不会被自动变成线程安全。

Java 线程状态是 NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED；没有独立的 RUNNING 枚举。
`wait()` 释放被等待对象的 monitor；`sleep()` 不释放当前持有的 monitor。它们不能混记。[Thread.State](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.State.html) · [Object.wait](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#wait())

### 2.3 Executor / CompletableFuture

线程池要讲大小、排队、拒绝、超时和关闭。请求量增加时，队列不能被默认当无限缓冲。
CompletableFuture 适合组合异步结果；调用 `get/join` 仍可能阻塞。

```java
// client 调用为示意；executor 由应用配置和管理生命周期。
CompletableFuture<Account> account =
    CompletableFuture.supplyAsync(() -> client.loadAccount(id), executor);

CompletableFuture<View> result =
    account.thenApply(this::toView);
```

- `thenApply`：T → U；`thenCompose`：T → CompletionStage<U>（常为 CompletableFuture），展开结果，避免嵌套。
- 没指定 executor 的 async 方法通常用 common pool；不要默认它适合大量阻塞 I/O。
- `orTimeout` 让 future 超时完成，不保证底层远程调用真的取消。
- `exceptionally(ex -> null)` 很可能把故障伪装成正常值；先定义降级是否合理。

**英文短答：**“I would bound concurrency and queueing, define timeouts, and make failures visible instead of turning every exception into a successful fallback.” [CompletableFuture](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html)

### 2.4 CPU 高、内存高、线程卡住，先查什么

先确认影响与时间范围，再对齐部署、流量和依赖变化。以下是排查练习，不是已发生的个人事故：

|现象|先找证据|不要直接下结论|
|---|---|---|
|CPU 高|热点线程/采样、GC、序列化、循环|直接说扩容就解决|
|堆持续涨|GC 后存活量、队列长度、缓存数量、保留引用|把所有增长都叫 memory leak|
|响应慢但 CPU 不高|连接池等待、线程栈、远程延迟、锁竞争|以为没有 CPU 压力就健康|
|平均值正常但部分用户很慢|p95/p99、按接口和成功/失败拆分|仅看 average|

堆、线程栈、类元数据、直接内存要区分；不要把所有 OOM 都当成堆不足。具体诊断工具用自己真正操作过的，没有操作过就讲会如何验证。

## 3. Java Stream 和 Spring streaming 是不同东西

### 3.1 Java Stream：进程内数据处理

沿用旧文里的 `filter/map/flatMap/collect`，重点补上语义：

- intermediate operations 通常惰性求值，terminal operation 触发处理。
- 一个 stream 不重复消费；元素不会自动变成 Optional，某些终止操作才返回 Optional。
- `map` 转换一个元素，`flatMap` 把每个元素产生的流展开。
- `peek` 不适合承载必须执行的业务副作用；部分操作可能被优化。
- `parallelStream` 不自动更快，尤其小集合、阻塞 I/O、共享可变状态。

```java
Map<String, Long> counts = events.stream()
    .filter(e -> e.isValid())
    .collect(Collectors.groupingBy(
        Event::customerId,
        Collectors.counting()
    ));
```

**Follow-up：**同一个 event 重复出现，要计两次还是按 eventId 去重？先定义计数单位，再写 pipeline。
本段 Event 为学习用类型。[Java Stream](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html)

### 3.2 五种名字先分层

|名字|负责什么|不自动提供什么|
|---|---|---|
|Java Stream|进程内序列变换|broker、offset、持久化|
|Reactor Flux / Mono|响应式序列与异步组合；0..N / 0..1 个值|每步自动换线程、外部系统事务|
|Spring Cloud Stream|函数 bean + binding/binder 对接消息中间件|业务幂等、任意依赖的 exactly-once|
|Spring Kafka Listener|容器拉取/分发消息，调用业务方法|仅凭方法签名确定 ack/retry 规则|
|Kafka Streams|Kafka 处理 topology、聚合、join、window、state store|把 Redis/邮件一起变成 Kafka 事务|

`EventConsumer` 可能只是项目自定义类名。遇到陌生代码，先看接口、调用者、配置和异常契约，不靠名字猜框架。

## 4. Spring 核心：DI、Bean 与 Boot

### 4.1 DI 的面试回答

“对象由容器创建和装配，业务类声明依赖。依赖通过接口和构造器传入，业务逻辑更容易单测和替换实现。”

```java
@Service
class NotificationService {
    private final MailGateway gateway;

    NotificationService(MailGateway gateway) {
        this.gateway = gateway;
    }
}
```

构造器清楚表达必需依赖；出现循环依赖时先检查职责，别第一反应换 field injection 或加 lazy 来掩盖。
多个候选 bean 可用 Qualifier 明确选择，Primary 表达默认候选。

BeanFactory 不只支持 XML；ApplicationContext 在其基础上提供更多应用能力。通常启动时创建非 lazy singleton，但可配置延迟初始化。
singleton 是每个容器、每个 bean definition 的实例语义，不等于整个 JVM 只能有一个，也不自动保证线程安全。[IoC](https://docs.spring.io/spring-framework/reference/core/beans/basics.html) · [Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)

**Follow-up：**singleton 直接注入 prototype，通常在注入时拿到一个对象，并不会每次调用自动换新实例；按需获取可用 provider 等机制。

### 4.2 Boot 到底帮了什么

- starter：一组相关依赖。
- auto-configuration：根据 classpath、已有 bean、配置条件创建合适的默认组件。
- 用户配置可让部分默认配置退让；失败时看条件报告，不靠猜。
- `@SpringBootApplication` 组合 Boot 配置、自动配置和组件扫描。

Boot 不会因为一个注解自动把缺少的依赖写进 pom。Spring 也不要求所有配置必须 XML。[Boot 自动配置](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)

### 4.3 配置与环境

结构化配置适合 `@ConfigurationProperties` + 校验，单个值可用 `@Value`。配置来源有优先级；“文件里写了”不代表运行时一定采用它。
Profile 适合选择环境配置/bean，不是权限控制。

配置热更新还要问：何时加载、哪些实例已更新、是否原子切换、非法值怎么拒绝、怎么回滚。
**Fiserv 的业务客户配置缓存，不要直接说成 Spring Cloud Config。** 归档材料只支持 Java/JavaEE 项目背景，未证实用了该框架。[外部化配置](https://docs.spring.io/spring-boot/reference/features/external-config.html)

## 5. Spring AOP 与事务：高优先级

### 5.1 proxy 怎么影响行为

Spring AOP 的常见实现是代理；调用穿过代理才有相应 advice。
默认 proxy 模式下，同一个对象内部 `this.method()` 不会重新走代理。
JDK interface proxy 和 class-based proxy 有不同限制；不要说任意 private/final 方法加注解都能被增强。[代理机制](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)

### 5.2 Transactional 实际保护哪里

先说资源、事务管理器和调用路径。一个本地数据库事务可以原子提交该事务里的多条写入，但不会自动覆盖 Mainframe、HTTP、Kafka 和邮件。

- 默认声明式规则通常对 RuntimeException / Error 回滚；checked exception、全局规则与 `rollbackFor` 要看配置。
- catch 后正常返回可能让事务提交；不要以为“发生过异常”就一定回滚。
- REQUIRED 通常参与已有事务；REQUIRES_NEW 是独立事务，可能增加连接需求，也改变提交语义。
- readOnly 常是优化/语义提示，不能把它当跨所有数据库的写入禁令。
- Boot 在满足自动配置条件时可以启用事务管理，不是每个 Boot 项目都要手写 EnableTransactionManagement。

**自拟 debug 例子：**

```java
@Service
class PaymentService {
    public void handle(Payment payment) {
        this.save(payment); // 自调用：不会单独激活 save 的代理事务
    }

    @Transactional
    public void save(Payment payment) {
        paymentRepository.insert(payment);
        outboxRepository.insert(eventFor(payment));
    }
}
```

如果调用时没有外层事务，这两条写入未必被期望的事务包住。可把“同库写入”提到独立 Spring bean，通过其代理调用，或使用明确的编程式事务。不是只把方法从 private 改成 public 就完成修复。

项目里可这样解释：先区分外部调用，再圈出本地原子写入；不要把长时间等待远程服务塞进数据库事务里。
这是通用原理，实际项目边界看配套项目笔记。[事务说明](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

## 6. API、持久化与安全

### 6.1 一次 Spring MVC 请求怎么走

大体是 filter chain → DispatcherServlet → controller → service → repository，再序列化响应。
Controller 管传输层输入输出，业务规则放 service，持久化细节放 repository/adapter。

- RequestBody 是反序列化；Valid 触发声明的校验。
- 参数格式合法不代表业务合法，例如金额格式对但账户没有权限。
- RestController 返回响应体，不要求每个方法再标 ResponseBody。
- ControllerAdvice 可统一错误映射；不要把所有异常包装成 HTTP 200。

**Follow-up：**超时后客户端重试，下游是不是已经执行？POST 是否需要 idempotency key？同 key 不同 payload 怎么处理？这些要先明确接口契约。[REST guide](https://spring.io/guides/gs/rest-service/)

### 6.2 JDBC / JPA / Hibernate

JDBC 是访问接口；JPA/Jakarta Persistence 是持久化规范；Hibernate 是实现之一；Spring Data JPA 提供 repository 抽象。
省掉 DAO 样板，不代表 SQL、索引、事务和数据库约束都不用管。

面试深挖可以检查：

- 一次请求实际发出多少 SQL？是否重复查询或 N+1？
- 关联对象如何加载？DTO/projection、fetch plan、分页怎么选择？
- 读取和更新之间竞争，用乐观版本检查、条件更新还是锁？
- 连接池等待时间是否比 SQL 执行更长？事务是不是持有连接太久？

旧文里 repository 接口继承关系有版本背景，别背成所有版本固定结构。[Spring Data 查询](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)

### 6.3 Authentication / Authorization

认证回答“是谁”，授权回答“能做什么”。JWT 可解码不等于已验证；签名、时效、issuer，以及适用场景的 audience 都要按契约检查。
签名 token 不等于加密 token，payload 不应随意放敏感数据。

讨论 Spring Security 时先说明过滤器链和认证后的权限检查，再讲自己的项目具体使用方式。不要声称所有项目都靠自写 JwtTokenUtil，也不要把角色校验等同于资源级访问权限。
[Spring Security JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)

## 7. 微服务：围绕失败和数据边界讲

### 7.1 为什么拆，代价是什么

先找业务能力和团队边界，再讨论独立部署、扩缩容、故障隔离。
代价包括网络故障、跨服务一致性、部署兼容、观测和调试成本。一个类大，不是立刻拆成微服务的充分理由。[模式目录](https://microservices.io/patterns/index.html)

### 7.2 同步 / Async / 消息队列

`@Async` 把工作交给 executor，不等于任务持久化。进程退出，内存里的待执行任务可能丢失；重试、排队、结果保存仍要设计。
默认代理模式下，自调用也会影响 Async；线程绑定的普通事务上下文不会因为开新线程自动延续。[Spring 异步执行](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)

Broker 适合解耦和缓冲，但还要定义保留、确认、消费失败与恢复。返回“已受理”与业务真正完成应有不同状态语义。

### 7.3 Outbox 能解决哪一个洞

同一数据库事务中写业务数据和待发布事件，再由 relay/CDC 发布。它解决本地写入与“需要发送事件”之间的原子性，发布仍可能重复。
它也不自动覆盖事务前已经发生的外部动作。[Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html)

重复事件需要业务幂等：例如持久化处理标识并与同库业务修改放进一个事务；先查后写仍可能竞争，唯一约束/原子条件很重要。
外部邮件是否已被接收却没拿到响应，则需要额外的供应商能力或不确定结果处理，不能只靠本地布尔值证明“恰好一次”。[Idempotent consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html)

### 7.4 Timeout / Retry / Circuit Breaker

- timeout 限制等待；本地超时不证明远端没执行。
- retry 适合可重试故障，结合退避、抖动、总时间预算和幂等。
- circuit breaker 在依赖持续失败时快速拒绝/降级，避免持续占用资源。
- bulkhead 限制一个依赖消耗的资源；扩线程池不能无限增加下游容量。

先说失败路径，再说选型。不要只背某个注解名字。[Circuit breaker](https://microservices.io/patterns/reliability/circuit-breaker.html)

## 8. Spring Cloud Stream：看懂函数、binding 与失败契约

### 8.1 Functional Consumer 示例

这是迁移性练习，不代表 Fiserv 原项目采用了 Spring Cloud Stream。业务类、依赖与连接配置省略：

```java
@Configuration
class StreamConfig {
    @Bean
    Consumer<ConfigChanged> applyConfig(ConfigService service) {
        return service::apply;
    }
}
```

```yaml
spring:
  cloud:
    function:
      definition: applyConfig
    stream:
      bindings:
        applyConfig-in-0:
          destination: config-events
          group: config-cache
          contentType: application/json
```

- Consumer 只有输入；Function 有输入与输出；Supplier 提供输出。
- `applyConfig-in-0` 对应函数名、方向和输入位置。
- binding 描述输入输出通道；binder 对接具体中间件。
- 还需要相应 binder 依赖、broker 配置与可转换的类型；这个片段不能独立运行。

**Follow-up：**业务方法抛异常以后谁重试？正常 return 是否代表成功？DLQ 是否配置？这些依赖 binder/container，不能只看函数签名。
[函数模型](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/producing-and-consuming-messages.html) · [Binding 配置](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/binding-properties.html)

### 8.2 Listener 与 EventConsumer 写法不同，怎么读

```java
@KafkaListener(topics = "config-events", groupId = "config-cache")
public void onConfig(ConfigChanged event) {
    service.apply(event);
}
```

这只是入口示意，还依赖 container factory、反序列化/转换和错误处理配置。
面对任何包装，按同一条链路检查：

```text
消息从哪里来 → 转换/校验 → 业务副作用 → 如何表示完成
                         └→ 异常 → 谁重试/暂停/转存
```

不要从“没有手动 ack 参数”推断没有提交机制，也不要从方法名推断 exactly-once。
先问清框架契约是正常的工程步骤。[KafkaListener](https://docs.spring.io/spring-kafka/reference/kafka/receiving-messages/listener-annotation.html)

### 8.3 offset 和副作用的两个窗口

对于简化的“写外部存储，再提交消费位点”流程：

|故障窗口|可能结果|需要继续问|
|---|---|---|
|业务未完成，却已提交位点|恢复后业务漏处理|提交与异步完成是否脱节|
|业务成功，提交前崩溃|恢复后重复处理|重复执行是否安全|
|一批只成功部分|不能笼统宣称整批成功|逐分区进度、重试和部分失败协议|

提交位点表示该分区下一次恢复读取的位置；它不是外部 Redis/数据库成功的证明。具体容器模式要读配置。
这些是理解和练习方向，没有证据证明 eBay 会考 Kafka 专项 debug。[KafkaConsumer 官方示例](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)

## 9. Reactor：批处理不等于持久化

### 9.1 bufferTimeout 小例子

```java
Mono<Void> persist(Flux<ConfigChanged> events) {
    return events
        .bufferTimeout(100, Duration.ofMillis(200))
        .concatMap(batch -> writer.write(batch))
        .then();
}
// 约定 writer.write 返回 Mono<Void>，完成信号表示写入完成。
// 类型/import/业务实现省略；这是 Reactor 示例，不包含 Kafka ack。
```

数量或时间阈值达到时形成批次。concatMap 顺序处理这些异步写入；flatMap 可并发交错，需要显式考虑顺序与并发上限。

这段只组装 pipeline，需要调用方或框架订阅才开始处理；订阅者还要观察失败和完成。不能在 listener 内随手 `.subscribe()` 后立即返回，就视为消息已经处理完成。

**三个容易说过头的地方：**

- 200ms 是这里的 buffer 时间参数，不是端到端延迟保证。
- 内存 buffer 不是 durable queue，重启恢复依赖其他机制。
- 返回 reactive 类型不代表底层阻塞 I/O 已变非阻塞；不能把 JDBC 调用直接塞进 event-loop 然后声称异步完成。

**Follow-up：**下游比上游慢怎么办？限制并发、排队与需求；决定何时暂停、降级、拒绝或持久化。不能靠无限内存队列一直接。
[Reactor Flux](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html)

### 9.2 和自己的工作怎样连接

Fiserv 材料中的“按条数 + 短时间窗口批量写 Redis”，可以帮助理解这个 trade-off。
但 Reactor 只是本笔记的表达方式，不能反向说原项目用了 Reactor。
吞吐提升与额外等待要一起讲；“每批条数 × 批次数”也不等于业务唯一事件数。

## 10. Testing：证明行为，不只报 coverage

|层次|该证明什么|示例|
|---|---|---|
|Unit|纯业务规则、分支与错误传播|非法输入、重复事件、状态转移|
|Web slice|路由、校验、序列化、错误映射|MockMvc 请求/响应|
|Integration|框架和真实依赖之间的行为|事务回滚、唯一约束、消息重投|
|Contract|服务双方对请求/事件的兼容性|字段变化、错误码、schema|

Mockito 的 Mock 是替身；Spy 部分调用真实行为；InjectMocks 把依赖注入被测对象，本身不把被测对象变成 mock。
普通 stubbing 常用 `when(...).thenReturn(...)`；对 spy 可用 `doReturn(...).when(...)` 避免 stubbing 时调用真实方法。[Mockito](https://site.mockito.org/javadoc/current/org/mockito/Mockito.html)

**自拟回归测试：值相同、实例不同**

```java
@Test
void treatsEqualStatusValuesTheSame() {
    String input = new String("PAID");
    assertTrue(StatusRules.isPaid(input));
}
// StatusRules 为练习用纯函数；再补 null、未知状态等契约用例。
```

Mock 数据库不能证明真实事务会回滚；mock Kafka 入口也不能证明真实 rebalance 行为。测试层次要和声称的保证匹配。[Spring testing guide](https://spring.io/guides/gs/testing-web/)

版本注意：旧项目里的 MockBean 可以解释；Boot 3.4 起已标记弃用，现代 Spring 的 MockitoBean 需按项目版本选用，别混拷注解。[MockBean 版本说明](https://docs.spring.io/spring-boot/3.4/api/java/org/springframework/boot/test/mock/mockito/MockBean.html)

## 11. Monitoring / Observability：能说出下一步查什么

### 11.1 指标、日志、trace 分工

Metrics 看量、趋势和分布；logs 看具体事件；trace 关联一次请求的跨组件耗时。Eureka 是服务发现，不是完整监控系统。
Actuator 提供运行状态端点；常见前缀是 /actuator，暴露哪些端点和访问权限要明确配置。[Boot observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html)

Google SRE 的四个 golden signals：

|信号|放到自己的链路中|
|---|---|
|Latency|API/处理/外部调用的分位数，成功和失败分开|
|Traffic|请求率、输入事件率、完成率|
|Errors|异常、超时、错误业务结果|
|Saturation|线程/连接池、队列、CPU、内存|

先区分用户症状和内部原因，再结合外部探测与内部遥测。告警应对应可行动的问题，不能每条日志都叫醒人。[Google SRE 监控章](https://sre.google/sre-book/monitoring-distributed-systems/)

### 11.2 自拟排障题：API p99 突然变高

1. 对齐影响接口、地区/实例、开始时间和最新变更。
2. 看请求量/错误率，确认是所有请求慢还是某条依赖路径慢。
3. 用 trace/分段计时定位 DB、外部调用、排队或本地计算。
4. 看连接池等待、慢查询、线程栈、GC；带着假设查证据。
5. 选择可回滚的止损措施，再验证恢复；随后补回归、容量或告警。

这里只是排查顺序。面试讲“我做过的事故”时，替换成自己真实做过的动作和证据，不能照抄成经历。

## 12. Refactor：一个小类怎么讲得有工程味

练习对象：一个 manager 同时校验、算规则、写库、发通知。

1. 先确认契约，用测试记录返回值、异常与副作用。
2. 优先改正确性/事务问题，再讨论命名和风格。
3. 提取纯计算与 I/O；让业务规则依赖小接口。
4. 多种可替换规则确实存在时再考虑 Strategy；只需要提取方法时，不必增加整套层次。
5. 一次改一处，跑相关测试，再跑回归，解释扩展代价。

SOLID 可以这样落地：SRP 看变化原因，OCP 看新增规则要改哪里，LSP 看是否破坏调用契约，ISP 看依赖的接口是否过大，DIP 看业务是否被具体外部客户端绑死。

**英文表达：**

> I'd first preserve the existing behavior with tests. Then I'd separate the business rules from the external dependencies, make one small change, and verify that the observable behavior stays the same.

## 13. System Design 怎么接到 Java 项目

按邮件提供的 Primer，先澄清需求、规模与假设，再画关键组件和数据流，深入一个关键路径，最后讨论瓶颈与取舍。
不要开始就画 Kafka + Redis + Kubernetes。[System Design Primer](https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question)

在自己的项目里先练三个不同问题：

- 支付：外部系统已成功，本地记录失败，如何知道真实结果？
- 通知：已受理、已发送、供应商接受、用户收到，分别代表什么？
- 配置缓存：读很快，但是读到旧值，业务能容忍多久、如何发现与修复？

这些是架构追问。只有来源支持的实现才能用过去式说“我做了”；临场方案要说“I would …”。

## 14. 旧笔记中这次不要继续背的表述

|旧表述|这次采用的口径|
|---|---|
|sleep 会释放锁|不会释放持有的 monitor；wait 的语义不同|
|BeanFactory 只支持 XML|容器接口与配置形式分开|
|singleton 天然安全/天然不安全|取决于共享状态、并发访问和实现|
|Boot 自动生成依赖|starter 管依赖组合，auto-config 管条件装配|
|Transactional 覆盖所有调用|先看代理、事务管理器和资源范围|
|InjectMocks 是 mock service|通常创建/使用真实被测对象并注入依赖|
|日志只用于 debug，Eureka 就是监控|日志也是观测来源，Eureka 主要做发现|
|Java Stream 元素就是 Optional|只有特定 API 返回 Optional|
|换 Log4j2 就安全|按具体版本与官方修复公告核对|

最后一项参见 [Apache Logging 安全公告](https://logging.apache.org/security.html)。本次在新笔记里纠正，没有改写原有博客文章。

## 15. 面试前自测与资料入口

合上笔记，尝试每题说 60–90 秒，再加一个失败例子：

1. 你怎么用 DI 改善测试？singleton 的状态风险是什么？
2. 为什么标了 Transactional 仍可能不生效？
3. 远端超时为什么不一定能直接重试？
4. Java Stream、Flux、Cloud Stream 和 Listener 分别负责什么？
5. 一批消息处理一半失败，怎样判断能否提交？
6. 单测通过为什么还不能证明事务/重投正确？
7. p99 上升时，下一步看什么证据？
8. 哪个设计决定是自己做的？有什么真实验证结果？

不用逐字背答案。先讲机制，再用一个真实例子支撑，最后说明约束。

### 邮件给的四个入口怎么用

- [Spring Guides](https://spring.io/guides)：优先 REST、事务、测试与消息相关小例子，理解一条完整路径。
- [Microservices Patterns](https://microservices.io/patterns/index.html)：按自己遇到的问题读 Outbox、幂等、隔离和调用失败。
- [System Design Primer](https://github.com/donnemartin/system-design-primer)：练需求澄清与取舍，不要求背完整目录。
- [Google SRE Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)：把抽象信号变成自己项目的可观察结果。

### 回到自己的旧文章

- [Java Basic](/blog/Java%26Spring/2023-01-20-Java-basic)
- [Java 8 Stream](/blog/Java%26Spring/2023-03-30-Java8-Stream)
- [DI](/blog/Java%26Spring/2023-04-06-Dependency-Injection)
- [Spring Boot](/blog/Java%26Spring/2023-04-07-Spring-Boot)
- [事务](/blog/Java%26Spring/2023-04-09-Transactions-in-Spring)
- [测试](/blog/Java%26Spring/2023-04-15-Testing-in-Spring)
- [异步](/blog/Java%26Spring/2023-06-11-async-communication)
- [监控](/blog/Java%26Spring/2023-06-19-monitoring)

整理基准：2026-11-13。旧文章用于恢复知识和写作习惯；技术语义按文中官方资料复核。学习示例不作为个人生产经历。
