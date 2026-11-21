---
layout: post
title: "Pattern: Single Service Instance per Host"
date: 2026-11-20
description: "Reserve each host for one service instance. Provision, replace, and scale hosts with that instance as the deployment unit."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/single-service-per-host.html"
---

## Context

A resource-intensive service needs predictable throughput or exclusive hardware. Sharing a host would make contention and incident attribution harder.

## Problem

When should an instance get the entire capacity and lifecycle of a host?

## Forces

A dedicated machine reduces contention and simplifies measuring utilization. Packing density falls, so equipment, startup time, and spare capacity matter.

## Solution

Deploy one instance to each host and treat the entire host as the scaling and rollout unit. Keep the host image reproducible and spread replicas across failure domains. Draining an instance should also remove the host from load-balancing rotation.

![Encoder queue to Dedicated host to Encoder instance.](/system-design-patterns/single-service-per-host/diagram)

## Examples

Each resource-intensive media encoder runs on a dedicated host. An autoscaler adds identical hosts when the queue stays backed up.

## Resulting context

Capacity and failures are easier to attribute to one workload. Dedicated hosts can waste idle resources and increase startup and fleet-management costs.

## Related patterns

- [Multiple service instances per host](/blog/SystemDesign/2026-11-20-pattern-multiple-services-per-host)
- [Service instance per VM](/blog/SystemDesign/2026-11-20-pattern-service-per-vm)
- [Service instance per container](/blog/SystemDesign/2026-11-20-pattern-service-per-container)

## Verify the behavior

Terminate one host under its expected production workload. Check replacement time and spare capacity. Compare utilization during peaks and idle periods with a shared deployment to see whether the isolation is worth the cost.
