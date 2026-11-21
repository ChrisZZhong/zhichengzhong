---
layout: post
title: "Pattern: Command Query Responsibility Segregation (CQRS)"
date: 2026-11-20
description: "Use different models for commands and reads when their constraints differ. A projector can update read-optimized views from committed changes."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/cqrs.html"
---

## Context

The model that enforces seat-allocation rules is inconvenient for history queries by customer and time range. Reusing the write schema for every query can couple indexing and write workloads.

## Problem

How can a query efficiently join data owned by several services or stored as an event stream?

## Solution

Route commands to the write model and queries to a view with indexes designed for the access pattern. Apply committed changes through an idempotent projector. A view can be a separate table or service and may be rebuilt from a checkpoint or a snapshot plus events.

![Events from write services feed a query-side view.](https://microservices.io/i/patterns/data/QuerySideService.png)

## Examples

In the FTGO reference, an order-history service derives a queryable view by consuming the events of services that own order data. That lets the read side index history by customer and time without requiring writes to know its query schema.

The write model validates seat reservations. A projection organizes confirmed reservations by venue and date for the operations dashboard.

The source points to FTGO's Order History Service. It illustrates why a read service can organize order records for queries independently of the models that accept or change orders.

## Resulting context

Read-heavy queries get their own schema and capacity. Separate storage introduces projection lag, replay procedures, and a choice about how to provide read-your-writes behavior.

## Related patterns

- [API composition](/blog/SystemDesign/2026-11-20-pattern-api-composition)
- [Event sourcing](/blog/SystemDesign/2026-11-20-pattern-event-sourcing)
- [Domain event](/blog/SystemDesign/2026-11-20-pattern-domain-event)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/data/cqrs.html#see-also).

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/cqrs.html#learn-more).

## Verify the behavior

Hold back events after a successful write and check how the UI communicates eventual consistency. Replay one duplicate and then rebuild the view. Both paths should produce the expected records and version.
