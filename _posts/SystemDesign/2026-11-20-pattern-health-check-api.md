---
layout: post
title: "Pattern: Health Check API"
date: 2026-11-20
description: "Expose a lightweight endpoint for the checks infrastructure needs. Distinguish whether a process should be restarted from whether it can serve new traffic."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/health-check-api.html"
---

## Context

A process can answer a TCP connection before it is ready to accept work. Conversely, restarting every process during a shared database outage can make recovery worse.

## Problem

How can an automated router or monitor tell whether an instance is able to serve traffic?

## Forces

Routing and restart decisions are different. A dependency failure may justify removing a replica from rotation yet make it unproductive to restart the process.

## Solution

Define startup, liveness, and readiness based on the platform's decisions. Liveness asks whether restarting this process might help. Readiness asks whether this instance can accept new requests safely. Bound the work a probe can trigger and avoid exposing raw dependency details publicly.

![Platform probe to Service health API branches to Ready for traffic and Restart if unhealthy.](/system-design-patterns/health-check-api/diagram)

## Examples

Spring Boot Actuator exposes health contributors that can report the application and its dependencies. For routing, group only the checks required to serve the relevant traffic.

A reservation instance can respond to liveness while it warms up. Readiness becomes healthy only after it has initialized enough to safely handle requests.

The source uses Spring Boot Actuator to expose a health endpoint. The configuration below illustrates separate Actuator endpoints for liveness and readiness in a current Spring Boot application.

### Spring Boot probes example

With Actuator on the classpath, the following configuration exposes the health endpoint and explicitly enables the probe groups. The standard HTTP paths are `/actuator/health/liveness` and `/actuator/health/readiness`.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      probes:
        enabled: true
```

Point your platform's liveness and readiness probes to those paths. Verify the paths on the port that actually represents application traffic, especially if Actuator has a separate management port. Add dependency checks to readiness only when their loss should make this particular instance stop receiving traffic, and weigh what happens if all replicas observe the same shared outage. [Spring Boot Actuator endpoints and probes](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.kubernetes-probes).

## Resulting Context

Routing and recovery can react automatically. Overly deep liveness checks can restart healthy processes during a shared dependency outage.

## Related patterns

- [Service deployment platform](/blog/SystemDesign/2026-11-20-pattern-service-deployment-platform)
- [Server-side discovery](/blog/SystemDesign/2026-11-20-pattern-server-side-discovery)
- [Circuit breaker](/blog/SystemDesign/2026-11-20-pattern-circuit-breaker)

## Verify the behavior

Start an instance slowly and verify it stays out of rotation without being repeatedly restarted. Then make a required dependency briefly unavailable and verify readiness changes in the intended scope.
