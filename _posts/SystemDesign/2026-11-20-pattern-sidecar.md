---
layout: post
title: "Pattern: Sidecar"
date: 2026-11-20
description: "Deploy a companion process alongside each application instance. Share a narrow local interface so the companion can supply a supporting capability."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/sidecar.html"
---

## Context

A capability such as local telemetry collection needs to run alongside every workload without adding the same integration library to each language stack.

## Problem

How can one shared capability run next to a workload without becoming one of its language dependencies?

## Forces

Co-location makes local forwarding and collection easy. The two processes still need an explicit readiness and shutdown contract and separate resource budgets.

## Solution

Deploy a companion with the same instance lifecycle and a narrow connection, such as a local socket or shared data volume. Budget its memory and CPU separately. Decide how the application behaves if the companion is not ready, falls behind, or shuts down first.

![Workload pod to Local interface branches to Application and Sidecar collector.](/system-design-patterns/sidecar/diagram)

## Examples

A collector beside a service receives local telemetry and batches exports. Both are deployed together but may use different runtimes.

## Resulting context

Applications can delegate support work without embedding a library. Every replica now shares resources and startup or shutdown behavior with an extra process.

## Related patterns

- [Service mesh](/blog/SystemDesign/2026-11-20-pattern-service-mesh)
- [Service instance per container](/blog/SystemDesign/2026-11-20-pattern-service-per-container)
- [Microservice chassis](/blog/SystemDesign/2026-11-20-pattern-microservice-chassis)

## Verify the behavior

Restart the sidecar while the app is handling traffic. Check whether export is buffered or temporarily dropped, whether buffers are bounded, and whether the app can still satisfy its core serving contract.
