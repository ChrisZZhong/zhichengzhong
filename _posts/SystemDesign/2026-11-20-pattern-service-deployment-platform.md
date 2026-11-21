---
layout: post
title: "Pattern: Service deployment platform"
date: 2026-11-20
description: "Declare the desired replicas, resources, and rollout policies. Let a platform reconcile the desired state with actual instances and networking."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/service-deployment-platform.html"
---

## Context

Every team needs rollouts, health checks, a stable service address, and autoscaling. Hand-building them across projects makes operations inconsistent and costly.

## Problem

How can multiple teams deploy and scale services through the same interface?

## Forces

A platform has to reconcile resource limits, instance health, discovery, and rollouts across different runtimes. Its abstraction must remain useful for operators during failures.

## Solution

Use a scheduler or managed platform that reconciles declared state. Describe the artifact, ports, replicas, resources, health probes, and rollout conditions. Service teams still need visibility into platform events and clear access to diagnose failed placements.

![Desired state to Platform controller to Running replicas.](/system-design-patterns/service-deployment-platform/diagram)

## Examples

Kubernetes uses a Deployment to reconcile replicas and a Service to expose a stable name. Managed functions and PaaS offerings expose different abstractions while also handling deployment and placement.

A team declares a minimum of three checkout replicas and a readiness endpoint. The platform replaces failed replicas and stops a bad rollout when new replicas do not become ready.

The reference names Kubernetes and managed application platforms as examples. Both operate on a workload declaration, although scheduling and rollout controls are exposed at different levels.

## Resulting context

Shared automation removes repeated host tasks. Teams still need visibility into scheduling, placement, quotas, and how to recover when platform behavior diverges from intent.

## Related patterns

- [Service instance per container](/blog/SystemDesign/2026-11-20-pattern-service-per-container)
- [Third-party registration](/blog/SystemDesign/2026-11-20-pattern-third-party-registration)
- [Health check API](/blog/SystemDesign/2026-11-20-pattern-health-check-api)

## Verify the behavior

Deliberately deploy an image that never becomes ready. Old replicas should keep serving while the platform surfaces the failure. Then remove a node and check how long it takes the platform to restore the desired capacity.
