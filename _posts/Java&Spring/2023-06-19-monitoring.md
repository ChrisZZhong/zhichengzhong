---
layout: post
title: "Operating Spring Boot Services: Async Work, Messaging, and Observability"
date: 2023-06-22
description: "Choose between an executor and a broker, manage environment-specific configuration, and monitor a running Spring Boot service."
tag: Java & Spring
---

Once a Spring service can answer requests, the next questions are where long-running work should happen, where settings come from, and how to tell whether the service is healthy. These notes collect those decisions in one place.

## Async work and executors

Suppose a home page needs four independent calls: user information (2 seconds), account information (4 seconds), billing information (1 second), and usage information (5 seconds). Sequentially they take about 12 seconds. With enough capacity to run concurrently, they can finish in about 5 seconds plus overhead. The response still depends on the slowest required call. Add timeouts and decide which results are optional.

In Spring, add `@EnableAsync` to a configuration class and put `@Async` on a method of a Spring bean. Call it from another bean so the call passes through the proxy. Use a named executor, for example `@Async("reportExecutor")`, to give report work its own capacity limits. Boot often supplies an application task executor, while the framework's fallback when no suitable executor is configured is `SimpleAsyncTaskExecutor`. Check the actual configuration before assuming tasks use a bounded pool.

```java
@Async("reportExecutor")
public CompletableFuture<Report> generate(ReportRequest request) {
    return CompletableFuture.completedFuture(reportBuilder.build(request));
}
```

The example assumes a `reportExecutor` bean and a report builder on the service. Spring schedules the invocation on that executor. Return a future when the caller needs the result or failure. For independent Java tasks and explicit executor ownership, see [Executors and futures](/blog/Java%26Spring/2023-01-20-Java-basic#executors-and-futures).

## Messaging with RabbitMQ and Kafka

An executor keeps work in the application's process. Use a broker when work must be handed off to a separate worker or survive a producer restart, and configure the durability guarantees you need. For example, a report endpoint can create a job, publish a message, and return a job ID while a worker generates the report.

In RabbitMQ, a producer sends to an **exchange**. A **binding** tells the exchange how to route to a **queue**. A consumer receives from the queue and acknowledges processing. Concurrent consumers and redeliveries can change observed processing order.

| Exchange type | Routing behavior |
| --- | --- |
| Direct | Exact match between routing key and binding key. |
| Fanout | Deliver to all bound queues regardless of routing key. |
| Topic | Match the routing key against binding patterns. |
| Headers | Match message headers against binding arguments. |

Configure a **dead-letter exchange** for messages you need to retain outside the normal processing path, such as messages rejected without requeue or expired by TTL. Bind a dead-letter queue for inspection or recovery. Cap retries and make handlers idempotent so a delivery repeated after a failure cannot apply the same operation twice. [RabbitMQ dead lettering](https://www.rabbitmq.com/docs/dlx).

Kafka models messages as records in a retained, partitioned log. Consumer groups track their offsets and can replay retained records. Ordering is per partition. RabbitMQ's exchanges are useful when routing jobs to queues, and Kafka is useful when readers need independent consumption or replay of an event history.

## Spring profiles and secrets

Use `@Profile("dev")` on a component or configuration class to register it only in the development profile. Use files such as `application-dev.properties` for environment-specific values and select the profile externally using `SPRING_PROFILES_ACTIVE=dev` or `--spring.profiles.active=dev`.

```java
@Configuration
@Profile("dev")
class DevConfig {
    // Define beans that should exist only in development.
}
```

Jasypt is an encryption library sometimes used to store encrypted property values. The application still needs access to a decryption key. Keep that key and production credentials outside Git, for example in a deployment secret store.

## Centralized configuration with Spring Cloud Config

For one service, local and externalized Boot configuration may be enough. With a fleet of services, a Config Server can read shared and per-application settings from a versioned backend, such as a Git repository. Clients can pick settings using their application name and active profile.

1. Add the Config Server dependency to a server application, enable it with `@EnableConfigServer`, and configure the server's Git backend.
2. Add `spring-cloud-starter-config` to each client using a Spring Cloud release compatible with its Boot version.
3. Import the config source and set a client application name.

```properties
spring.application.name=report-service
spring.config.import=configserver:http://localhost:8888
```

Use an `optional:` prefix when startup should be allowed if the server is unavailable. A `bootstrap.properties` connection is an older approach and requires enabling the legacy bootstrap mechanism. If selected beans must reload at runtime, apply `@RefreshScope` where appropriate and provide a controlled refresh mechanism. [Spring Cloud Config client](https://docs.spring.io/spring-cloud-config/reference/client.html).

## Monitoring with Actuator, metrics, and logs

Add `spring-boot-starter-actuator` for operational endpoints. With the default base path, health is under `/actuator/health`. Endpoints such as `/actuator/info`, `/actuator/metrics`, and `/actuator/beans` are available only when enabled and exposed as appropriate. Expose what operators need and restrict access.

- **Health** answers whether an instance or dependency is up. Set health checks according to how the service should be restarted or removed from traffic.
- **Metrics** answer how often or how long something happens. Track request rate, error rate, latency, and executor or queue saturation. Use a metrics backend for aggregation and alerting across instances.
- **Logs** show individual events. With Boot's usual logging starter, Logback is the default. Configure `logging.level` or use `logback-spring.xml` for custom settings. Use `INFO` for routine events, `WARN` for degraded but recoverable conditions, `ERROR` for failures, and `DEBUG` or `TRACE` for extra detail while diagnosing a problem. Include a correlation ID where practical to follow work across services.

Eureka helps consumers discover service instances. Use health checks and telemetry to decide whether those instances are working as expected. [Spring Boot Actuator endpoints](https://docs.spring.io/spring-boot/3.5/reference/actuator/endpoints.html).
