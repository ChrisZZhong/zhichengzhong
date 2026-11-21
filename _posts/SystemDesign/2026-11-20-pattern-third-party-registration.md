---
layout: post
title: "Pattern: 3rd Party Registration"
date: 2026-11-20
description: "Use a scheduler, controller, or registrar to publish and remove service endpoints based on workload lifecycle and readiness."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/3rd-party-registration.html"
---

## Context

Services run on different runtimes, and requiring each service to speak the same registry protocol creates repeated framework work. A scheduler can already observe instance creation and health.

## Problem

How can services join discovery without implementing the registry's protocol themselves?

## Forces

A controller can watch workload lifecycle across runtimes. It must reconcile missed termination events and distinguish a process that exists from one ready to receive requests.

## Solution

Have a separate controller watch the authoritative workload state and reconcile routable endpoints with that state. Treat missed watch events and repeated notifications as normal. Use readiness rather than mere process existence when adding an endpoint.

![Workload lifecycle to Platform registrar to Service registry.](/system-design-patterns/third-party-registration/diagram)

## Examples

A Kubernetes controller observes readiness and reconciles the Service's EndpointSlices. The application exposes a health signal and never calls the discovery API directly.

A deployment controller watches container health and updates the set of routable endpoints before older replicas exit.

The source names a registrar outside the application process, including Netflix Prana for non-JVM workloads. A platform controller can serve the same role by publishing what it observes about lifecycle and readiness.

## Resulting context

Registration is consistent across application runtimes. The controller and its health model must reflect what the application can actually serve.

## Related patterns

- [Self-registration](/blog/SystemDesign/2026-11-20-pattern-self-registration)
- [Service registry](/blog/SystemDesign/2026-11-20-pattern-service-registry)
- [Service deployment platform](/blog/SystemDesign/2026-11-20-pattern-service-deployment-platform)

## Verify the behavior

Restart the controller between an instance creation and deletion. On its next reconciliation it should remove orphaned endpoints and restore registrations that still describe ready workloads.
