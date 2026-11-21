---
layout: post
title: "Pattern: Service mesh"
date: 2026-11-20
description: "Use a data plane to mediate service-to-service traffic and a control plane to manage policy. The data plane can apply identity, routing, and traffic telemetry consistently."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/service-mesh.html"
---

## Context

Many services need consistent workload identity, connection policy, routing, and transport telemetry. Implementing these behaviours separately in each service leads to drift.

## Problem

How can services get consistent transport security, routing, and telemetry across language stacks?

## Forces

A common data plane applies policies without rebuilding applications. The platform inherits the cost of another configuration and forwarding layer, including safe upgrades and failure diagnosis.

## Solution

Use the mesh data plane for service-to-service transport and a control plane for shared policy. Make timeouts, retries, and circuit-breaking responsibility clear so a library and a mesh do not both retry the same call. Keep domain authorization and business outcomes in application services.

![Checkout service to Local data plane to Remote data plane to Billing service.](/system-design-patterns/service-mesh/diagram)

## Examples

Checkout calls Billing through the mesh. Policy uses workload identities to authorize the connection and splits a small proportion of traffic to a new billing release.

## Resulting context

Transport policy becomes more uniform across runtimes. The mesh adds infrastructure, resource overhead, and another place to investigate timeouts and retries.

## Related patterns

- [Sidecar](/blog/SystemDesign/2026-11-20-pattern-sidecar)
- [Distributed tracing](/blog/SystemDesign/2026-11-20-pattern-distributed-tracing)
- [Access token](/blog/SystemDesign/2026-11-20-pattern-access-token)

## Verify the behavior

Release a policy to a small set of workloads and verify a valid identity continues working while unauthorized routes are denied. Simulate a proxy or policy rollout failure and use both app and mesh telemetry to identify the boundary where it occurred.
