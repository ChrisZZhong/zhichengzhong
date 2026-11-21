---
layout: post
title: "Pattern: Microservice chassis"
date: 2026-11-20
description: "Share a maintained runtime foundation for concerns such as health checks, telemetry, configuration, and request handling."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/microservice-chassis.html"
---

## Context

New services repeatedly need configuration, telemetry, health probes, and request handling. Copying each integration makes shared fixes hard to propagate.

![A copied template has to be updated separately in each generated service.](https://microservices.io/i/patterns/microservice-template-and-chassis/Service_template_limitations.png)

## Problem

How can a team start from production-ready defaults and improve those defaults across deployed services?

## Forces

A copied scaffold accelerates the first release. Ongoing fixes to build logic, dependencies, and instrumentation need a versioned delivery path that each service can adopt.

## Solution

Provide a versioned dependency or platform SDK with defaults and clean override points. Document which concerns the framework owns. Run cross-service compatibility tests before rolling out a new release of the chassis.

![Services reuse shared build logic and supporting libraries through a chassis.](https://microservices.io/i/patterns/microservice-template-and-chassis/Microservice_chassis.png)

## Examples

Spring Boot and Spring Cloud are examples of foundations for a JVM chassis. The team's contribution is a supported set of dependencies, build conventions, and default configuration that can be upgraded as a unit.

Several JVM services adopt the same internal dependency set, which configures tracing and health endpoints while allowing service-specific business code.

## Resulting context

Improvements can propagate through versioned dependencies. Changes can also affect many services at once, so publish compatibility guidance and support migration paths.

## See also

[Related references on Microservices.io](https://microservices.io/patterns/microservice-chassis.html#see-also).

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/microservice-chassis.html#learn-more).

## Related patterns

- [Service template](/blog/SystemDesign/2026-11-20-pattern-service-template)
- [Externalized configuration](/blog/SystemDesign/2026-11-20-pattern-externalized-configuration)
- [Sidecar](/blog/SystemDesign/2026-11-20-pattern-sidecar)

## Verify the behavior

Upgrade one service without changing the others. Confirm its health endpoints, metrics, and log formats remain compatible. Track adoption and make rollback possible if a shared default causes unexpected behavior.
