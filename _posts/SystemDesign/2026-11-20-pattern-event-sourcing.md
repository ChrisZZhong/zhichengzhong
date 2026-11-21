---
layout: post
title: "Pattern: Event sourcing"
date: 2026-11-20
description: "Store each accepted state change as an append-only event. Reconstruct current state by replaying an entity stream, with snapshots when replay gets expensive."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/event-sourcing.html"
---

## Context

A current-state row shows what an order looks like now, but it cannot explain how it got there or support replaying a new read model. An authoritative history needs deliberate rules for write validation and replay.

## Problem

How can a command leave a durable history from which the system can reconstruct state and publish changes?

## Forces

Commands on an aggregate may arrive concurrently. Accepted changes need a stable order and replayable interpretation. If a broker also receives those changes, publication must follow the commit of the event stream.

## Solution

Evaluate a command against reconstructed state, then append its accepted events using an expected version. Keep event application deterministic. Take snapshots to bound reconstruction work, and project events into queryable views where needed.

## Example

A seat reservation is reconstructed from SeatHeld, HoldExtended, and BookingConfirmed. The append checks the expected stream version to avoid conflicting changes.

The reference's Customers and Orders application uses Eventuate and CQRS. The relevant distinction is how order state is derived from persisted events rather than overwritten on every change.

### Event-stream example

A stream's length stands in for its durable revision in this runnable Python example. On real storage the expected-version check and the append must be atomic, for example through a compare-and-append operation or a unique stream-and-version key.

```python
def apply_events(events):
    state = "new"
    for event in events:
        state = {
            ("new", "OrderPlaced"): "pending",
            ("pending", "CreditReserved"): "approved",
            ("pending", "CreditRejected"): "rejected",
        }[(state, event)]
    return state


def append(stream, expected_revision, event):
    if len(stream) != expected_revision:
        raise ValueError("stream revision changed")
    apply_events([*stream, event])
    stream.append(event)


orders = []
append(orders, 0, "OrderPlaced")
append(orders, 1, "CreditReserved")
assert apply_events(orders) == "approved"
try:
    append(orders, 1, "CreditRejected")
except ValueError:
    pass
else:
    raise AssertionError("stale writer should fail")
assert apply_events(orders) == "approved"
```

Persist the event's original identity and schema version alongside its type. Apply formulas and other historical interpretation rules version by version so older events remain replayable.

![Order state is persisted as an ordered series of events.](https://microservices.io/i/storingevents.png)

## Resulting context

The event stream preserves how state evolved. Long-lived schemas, replay correctness, concurrency, and data-retention obligations require careful design.

## Related patterns

- [Aggregate](/blog/SystemDesign/2026-11-20-pattern-aggregate)
- [Domain event](/blog/SystemDesign/2026-11-20-pattern-domain-event)
- [CQRS](/blog/SystemDesign/2026-11-20-pattern-cqrs)

## See also

The Customers and Orders case study illustrates stream replay and read models together. [Eventuate examples and documentation](https://eventuate.io/).

## Verify the behavior

Replay a stream twice and compare results, then attempt two writes with the same expected version. Only one should append. Verify that a snapshot plus remaining events agrees with a full replay and consider how old payload formats and retention will be handled.
