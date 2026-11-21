---
layout: post
title: "Pattern: Multiple service instances per host"
date: 2026-11-20
description: "Run several service instances on one machine. Isolate their processes, configuration, and resource budgets as much as the deployment model allows."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/multiple-services-per-host.html"
---

## Context

A small fleet cannot afford one idle machine per service replica. Sharing hosts can improve utilization when workloads have compatible resource needs and urgency.

## Problem

How can several service instances share machine capacity while remaining independently operable?

## Forces

Processes can have distinct runtime versions, ports, and release times. Without explicit resource limits and placement policy, a busy process or broken host affects several services.

## Solution

Run services under distinct process supervision, identities, ports, and limits. Spread replicas across physical or virtual failure domains where possible. Reserve capacity for a process restart and avoid placing all instances of one critical service on one host.

![Shared host to Process supervisor branches to Catalog process and Billing process.](/system-design-patterns/multiple-services-per-host/diagram)

## Examples

On a small host, run three internal services as separate processes, each with its own port, account, and restart policy.

## Resulting context

Packing helps utilization and can simplify a small fleet. A host failure affects all colocated workloads, and one busy service can exhaust shared resources.

## Related patterns

- [Service instance per host](/blog/SystemDesign/2026-11-20-pattern-single-service-per-host)
- [Service instance per container](/blog/SystemDesign/2026-11-20-pattern-service-per-container)

## Verify the behavior

Stop the host that runs a mix of services and check that every critical API retains a routable replica elsewhere. Then saturate memory or CPU in one process and verify the host limits protect its neighbours.
