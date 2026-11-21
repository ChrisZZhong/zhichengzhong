---
layout: post
title: "Pattern: Service instance per container"
date: 2026-11-20
description: "Bundle the application and userspace dependencies into an image. Start each replica in a container and have the platform apply runtime limits and health checks."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/service-per-container.html"
---

## Context

Teams need a repeatable package for application code and user-space libraries. The deployment environment still needs to control networking, limits, and process lifecycles.

## Problem

How can teams package and isolate each service replica while sharing the underlying machines?

## Forces

Images make the code and userspace dependencies reproducible. Containers still share a kernel, and platform limits determine whether neighboring replicas can interfere under load.

## Solution

Build a versioned container image, keep environment-specific settings external, and run each replica in a container. Define readiness, resource budgets, and graceful termination through the runtime or orchestrator. Decide what state belongs in volumes or external storage.

![Container image to Container runtime to Venue API replica.](/system-design-patterns/service-per-container/diagram)

## Examples

Build a container image for a service and run one container per replica. An orchestrator such as Kubernetes places the replicas on different hosts, watches health, and can roll out a new image gradually.

The venue API ships as a container image. A rolling deployment replaces old containers in batches while healthy ones continue serving.

The source uses Docker images and a clustering platform to illustrate packaging through rollout. The image supplies the runtime files, while the deployment platform decides placement, lifecycle, and routing.

## Resulting context

Containers launch quickly and can share hosts efficiently. Isolation depends on runtime policy and the shared kernel. Durable state needs an explicit lifecycle.

## Related patterns

- [Service instance per VM](/blog/SystemDesign/2026-11-20-pattern-service-per-vm)
- [Service deployment platform](/blog/SystemDesign/2026-11-20-pattern-service-deployment-platform)
- [Sidecar](/blog/SystemDesign/2026-11-20-pattern-sidecar)

## Verify the behavior

Deploy the same image digest in two environments with different configuration. Kill a container during a rolling release and confirm traffic shifts to healthy replicas while persistent state remains available.
