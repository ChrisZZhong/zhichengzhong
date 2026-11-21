---
layout: post
title: "Pattern: Serverless deployment"
date: 2026-11-20
description: "Delegate instance provisioning and scaling to a provider. Bind execution to requests or events and keep durable state in managed stores."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/serverless-deployment.html"
---

## Context

Work arrives irregularly and managing idle workers would cost more than the workload warrants. The runtime should scale on demand, with state that survives short-lived invocations.

## Problem

How can the application deploy handlers that start on demand without managing worker hosts?

## Forces

Short, bursty work is a good candidate. Invocation limits, cold starts, concurrency caps, and external state shape how the handler can process work.

## Solution

Bind a function to a message, object change, or request. Give it a bounded timeout, a narrow runtime identity, and access to durable external state. Configure reserved concurrency or a queue when the downstream system cannot absorb every burst.

![Object upload to Managed trigger to Resize function to Output store.](/system-design-patterns/serverless-deployment/diagram)

## Examples

AWS Lambda, Azure Functions, and Google Cloud's functions are examples of managed execution platforms. An upload event can invoke a handler that reads from object storage and writes its result back there, so its execution environment need not preserve local state.

An image upload invokes a resize function. The result is written under a deterministic key so repeated events can be processed safely.

The source gives AWS Lambda and other managed function runtimes as examples. A function can be triggered by a platform event and scale independently of the resources used to store its inputs or outputs.

## Resulting context

It reduces fleet management and scales with work. Check cold-start latency, execution limits, concurrency caps, downstream capacity, and platform coupling.

## Related patterns

- [Service deployment platform](/blog/SystemDesign/2026-11-20-pattern-service-deployment-platform)
- [Idempotent consumer](/blog/SystemDesign/2026-11-20-pattern-idempotent-consumer)

## Verify the behavior

Replay the same trigger and confirm its output is independent of duplicate delivery. Compare first-invocation latency with warm performance and test what happens when the platform reaches a concurrency limit.
