---
layout: post
title: "Pattern: Aggregate"
date: 2026-11-20
description: "Model a small cluster of domain objects with one root that enforces its invariants. Change the aggregate in a single local transaction when its rules require it."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/aggregate.html"
---

An aggregate is a Domain-Driven Design consistency boundary. One object, called the root, controls changes to the other objects inside it.

An operation can edit several objects that must satisfy one business invariant together. Choosing transaction scope from the ORM object graph alone can make both correctness and concurrency hard to reason about.

## Solution

Put a root in charge of the invariant and expose business operations through it. Reference other aggregates by identity where possible. Use an expected version or appropriate row locking to resolve concurrent writes rather than silently overwriting each other.

![Confirm command to Reservation root branches to Seat holds and Reservation status.](/system-design-patterns/aggregate/diagram)

## Example

A reservation root owns its seat holds. Callers ask the root to confirm a reservation so it can check that every hold is valid.

## See also

The reference links to Richardson's book for an extended treatment of this pattern. [Book reference in the original](https://microservices.io/patterns/data/aggregate.html#see-also).

## Resulting context

A compact aggregate makes consistency rules explicit. Oversized aggregates increase write contention and encourage unrelated changes to share a transaction.

## Related patterns

- [Domain event](/blog/SystemDesign/2026-11-20-pattern-domain-event)
- [Event sourcing](/blog/SystemDesign/2026-11-20-pattern-event-sourcing)

## Verify the behavior

Try to confirm a seat hold after expiry and update the same reservation with two writers. The root should reject the first action and detect or serialize the competing update.
