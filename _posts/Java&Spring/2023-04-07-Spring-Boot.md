---
layout: post
title: "Spring Core and Boot: Beans, Dependency Injection, and AOP"
date: 2023-10-25
description: "How Spring wires beans, how Boot starts an application, and where proxies change method behavior."
tag: Java & Spring
---

**Interview answer:** Spring Framework provides the container, dependency injection, and infrastructure for features such as MVC, data access, and AOP. Spring Boot builds on it with starter dependencies, auto-configuration, and a conventional way to launch an application. The easiest example is a web starter: Boot can configure the servlet stack and embedded server from the dependencies you choose.

## Dependency injection and the IoC container

Inversion of control puts object creation and wiring in the container. With dependency injection, a service declares its collaborators and receives them from outside. For example, a checkout service takes a `PaymentProcessor` in its constructor and lets configuration choose the implementation.

`BeanFactory` is the underlying bean lookup and creation contract. `ApplicationContext` adds features such as application events, resources, and integration with configuration and post-processors. Boot applications normally use an `ApplicationContext`. Most singleton beans are initialized during context startup by default, though they can be made lazy. Configuration can come from Java configuration, component scanning, or XML.

## Bean annotations and injection

| Annotation | How I use it |
| --- | --- |
| `@Component` | Register a general-purpose class through component scanning. |
| `@Service` | Identify application or business logic. |
| `@Repository` | Identify data access code and make it eligible for persistence exception translation. |
| `@Controller` | Register a web controller for handler discovery. |
| `@Configuration` and `@Bean` | Declare beans explicitly, especially third-party classes that cannot be annotated for scanning. |

Prefer **constructor injection** for required dependencies. It makes them explicit and lets fields be final. Spring can use a single constructor without `@Autowired`. Setter injection can represent optional or replaceable dependencies. Field injection hides dependencies from the constructor and makes tests without Spring harder to set up. A constructor cycle is usually a sign that the responsibilities need to be separated.

When more than one bean matches a type, use `@Primary` to pick a preferred candidate or `@Qualifier` at an injection point to request a specific one.

```java
@Service
public class CheckoutService {
    private final PaymentProcessor payments;

    public CheckoutService(@Qualifier("cardProcessor") PaymentProcessor payments) {
        this.payments = payments;
    }
}
```

For `@PathVariable`, `@RequestParam`, and other request annotations, see [Spring Web APIs](/blog/Java%26Spring/2023-04-12-REST-in-Spring#request-mapping-and-binding).

## Bean lifecycle and scopes

A context loads bean definitions, creates the relevant instances, injects dependencies, and runs post-processors and initialization callbacks. Post-processors can wrap a bean in a proxy. When the context closes, it calls registered destruction callbacks for the beans it manages. `@PostConstruct` and `@PreDestroy` provide common lifecycle hooks.

| Scope | Lifetime |
| --- | --- |
| Singleton (default) | One instance per bean definition per container. Shared mutable state still needs coordination. |
| Prototype | A new instance per request for that bean, including injection into a new dependent bean. The caller handles destruction. |
| Request or session | One instance per HTTP request or HTTP session in a web-aware context. |
| Application or WebSocket | One instance tied to the servlet context or WebSocket session. |

**Interview check:** Suppose A is a singleton and B is a prototype. Every B into which you inject A gets the same A. If you inject B directly into A, A keeps the one B it received at construction. Inject an `ObjectProvider<B>` and call `getObject()` when you need a fresh B on demand. [Spring bean scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html).

## Auto-configuration

Starters bundle compatible dependencies for a feature. Auto-configuration uses conditions such as what's on the classpath, which properties are set, and which beans already exist. For instance, a user-supplied `DataSource` can replace Boot's default. Properties configure available features or override their defaults. Maven or Gradle manages the dependencies themselves.

`@SpringBootApplication` combines three jobs:

- `@SpringBootConfiguration` marks the main configuration and builds on `@Configuration`.
- `@EnableAutoConfiguration` enables conditional configuration.
- `@ComponentScan` normally starts in the package containing the application class. Put that class above the packages containing controllers, services, and repositories.

Run the app with `--debug` when you need to see which auto-configuration conditions matched. [Spring Boot auto-configuration](https://docs.spring.io/spring-boot/3.5/reference/using/auto-configuration.html).

## Create a Spring Boot project

In [Spring Initializr](https://start.spring.io/) or your IDE's Spring project wizard, choose Maven, Java, and a Spring Boot release compatible with your JDK. These examples use Boot 3 conventions, including Java 17 or newer and `jakarta.*` packages for APIs such as validation and persistence. The original Boot 2.6 and Java 8 setup is relevant to older projects, whose dependencies and imports should stay aligned with that stack.

1. Select **Spring Web** for HTTP endpoints. Add **Validation**, **Spring JDBC** or **Spring Data JPA**, and a database driver when the application needs them.
2. Import the generated Maven project. Keep the Java version in `pom.xml` aligned with the JDK. Let Boot manage versions for the dependencies it supports.
3. Run the generated application class or `./mvnw spring-boot:run`. Put feature settings in `src/main/resources/application.properties` or external configuration.

Continue with [a controller example](/blog/Java%26Spring/2023-04-12-REST-in-Spring#rest-controller-example) or [the database setup](/blog/Java%26Spring/2023-04-13-SpringDataJPA#connect-to-a-database-with-jdbc).

## Spring AOP and proxies

Aspect-oriented programming keeps behavior such as timing, logging, or transaction boundaries separate from business logic. In Spring AOP, a **join point** is a method execution. A **pointcut** selects the executions to intercept. **Advice** is the action to take, and an **aspect** packages the pointcut and advice together.

Advice can run before a method, after it returns, after it throws, after either outcome, or around it. An around advice can measure duration by starting a timer, proceeding to the target, and recording elapsed time in a finally block.

Spring AOP intercepts calls through a proxy. If one method calls another on the same object via `this`, the call bypasses that proxy. This explains many surprises with [transactions](/blog/Java%26Spring/2023-04-13-SpringDataJPA#transactions-and-acid) and [async methods](/blog/Java%26Spring/2023-06-19-monitoring#async-work-and-executors). Keeping the intercepted operation on a separate bean is often the clearest fix. [Spring AOP proxying](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html).
