---
layout: post
title: "Pattern: Server-side service discovery"
date: 2026-11-20
description: "Call a stable service address. A proxy or platform load balancer discovers instances and chooses where to send each request."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/server-side-discovery.html"
---

## Context

Clients in multiple languages should be able to use one stable address without implementing their own discovery algorithms. Instance health and placement still change frequently.

![A caller has to reach an instance even as network locations change.](https://microservices.io/i/servicediscovery/discovery-problem.jpg)

## Problem

How can callers reach healthy replicas through an address that stays stable while the replicas change?

## Forces

A routing layer can apply discovery uniformly to clients in multiple languages. It adds a hop and becomes part of the service's availability and latency budget.

## Solution

Put discovery behind a managed service address or load balancer. The proxy resolves current instances, filters on readiness, and routes requests. During rollout, stop sending new traffic to a draining instance before its process exits.

![A router discovers and selects a healthy target for the client.](https://microservices.io/i/servicediscovery/server-side-discovery.jpg)

## Examples

A load balancer such as AWS Elastic Load Balancing maintains an eligible target set. Clients call the balancer's stable name and the infrastructure routes them to a registered, healthy instance.

The booking service calls Capacity by a stable service name. The platform forwards requests only to endpoints that are ready.

The reference uses AWS Elastic Load Balancing to illustrate the stable load balancer address in front of changing backends. The choice of a ready instance is a routing responsibility.

## Resulting context

Discovery logic stays out of application clients. The routing layer adds infrastructure to operate, including endpoint freshness, health, capacity, and draining.

## Related patterns

- [Client-side discovery](/blog/SystemDesign/2026-11-20-pattern-client-side-discovery)
- [Service registry](/blog/SystemDesign/2026-11-20-pattern-service-registry)

## Verify the behavior

Start an instance that fails readiness and confirm it receives no user traffic. Then drain a healthy instance and verify existing requests can finish. Monitor stale endpoints and the routing layer's own capacity.
