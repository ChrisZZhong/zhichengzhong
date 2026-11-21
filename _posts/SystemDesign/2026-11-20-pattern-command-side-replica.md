---
layout: post
title: "Pattern: Command-side replica"
date: 2026-11-20
description: "Replicate only the facts a command needs into the service that executes it. Update the local copy from an authoritative stream or snapshots."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/command-side-replica.html"
---

## Context

A command such as accepting an order needs read-only information from another service. Looking it up on every request creates latency and runtime dependence on the owner.

## Problem

How can a command use another service's data within its own latency and availability budget?

## Solution

Copy only the fields and versions needed for the decision. Seed the local database from a snapshot, apply updates by key and version, and publish a readiness or freshness signal during an initial load or rebuild. Keep the owner authoritative and reject or defer risky decisions when the copy is stale.

In the source's order-validation scenario, the restaurant service publishes menu changes. The order service projects them into a local menu view that its command handler uses to validate items and compute prices.

![The command service keeps a local copy from the provider's events.](https://microservices.io/i/patterns/data/command-side-replica-pattern.png)

## Example

Bookings hold a local view of venue capacity rules keyed by venue and version, so that accepting a booking need not call the policy service.

## Resulting context

### Benefits

Validating against a local view removes a dependency from the synchronous path. The replica can be indexed for the command while the provider keeps its own schema.

### Drawbacks

A newly updated menu may not be visible when a command begins. Define which revision is acceptable, how staleness is detected, and when to refuse or reconcile a command.

## Related patterns

- [Self-contained service](/blog/SystemDesign/2026-11-20-pattern-self-contained-service)
- [CQRS](/blog/SystemDesign/2026-11-20-pattern-cqrs)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/data/command-side-replica.html#see-also).

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/command-side-replica.html#learn-more).

## Verify the behavior

Pause replication, change a capacity rule, and send a command before and after the freshness threshold. Verify that a replayed older event cannot replace a newer value and that rebuilding from retained changes yields the same view.
