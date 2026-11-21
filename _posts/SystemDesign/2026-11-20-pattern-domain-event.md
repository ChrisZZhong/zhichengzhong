---
layout: post
title: "Pattern: Domain event"
date: 2026-11-20
description: "Represent a significant business change as an immutable fact. Include enough identity and version information for consumers to interpret it later."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/domain-event.html"
---

## Context

Several downstream consumers care that an order became confirmed, but the owning service should not need to know every action that follows that change.

## Problem

How can a service announce a meaningful change to consumers it need not know about?

## Solution

Publish facts as past-tense events, with a stable event ID and enough context to interpret the change. Use an outbox when persistence and publication must stay coordinated. Evolve schemas with consumers in mind and choose an ordering key aligned with the entity they track.

![Reservation model to Confirmation event branches to Notifications and Reporting.](/system-design-patterns/domain-event/diagram)

## Example

A confirmed reservation emits ReservationConfirmed with a reservation ID and version. Notifications and reporting can subscribe without asking the reservation service to call both.

## Resulting context

Consumers can react independently. The event becomes a shared contract, so protect private fields, plan schema changes, and define what ordering consumers can rely on.

## Related patterns

- [Aggregate](/blog/SystemDesign/2026-11-20-pattern-aggregate)
- [Transactional outbox](/blog/SystemDesign/2026-11-20-pattern-transactional-outbox)
- [Event sourcing](/blog/SystemDesign/2026-11-20-pattern-event-sourcing)

## See also

The reference links to Richardson's book for an extended treatment of this pattern. [Book reference in the original](https://microservices.io/patterns/data/domain-event.html#see-also).

## Verify the behavior

Publish a duplicate and a version that includes a new optional field. Existing consumers should still understand it. Check that sensitive payload data stays at the owner and that subscribers can identify which entity version they applied.
