---
layout: post
title: "Pattern: Transactional outbox"
date: 2026-11-20
description: "Commit the business change and an event record in the same database transaction. A relay reads committed records and publishes them after the commit."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/transactional-outbox.html"
---

## Also known as

The reference also uses the term application events. An outbox is the durable publication mechanism, while the event describes the application change.

## Context

Updating an order and publishing its event are separate operations if the database and broker commit independently. A crash between them can produce a committed order with no event or an event for a rolled-back change.

## Problem

How can a database update and an eventual broker publication agree across both commits and crashes?

## Forces

Sending before commit can announce work that was rolled back. Sending after commit can lose an event if the process crashes. Preserve the sequence for the same aggregate even when different replicas handle its updates.

## Solution

Write the order and an outbox record using the same local transaction. Give the event a stable ID, aggregate key, and schema version. After commit, relay it with log tailing or polling, and plan the retention and recovery of the relay position.

![One transaction commits both business state and a message for the relay to publish.](https://microservices.io/i/patterns/data/ReliablePublication.png)

## Example

A reservation update inserts BookingConfirmed into an outbox table. If the publisher crashes after the broker accepts it, the relay retries using the same event ID and the consumer ignores the duplicate.

### Atomic write example

This runnable SQLite example shows the database part of the pattern. The relay publishes from committed outbox rows separately. The event ID is stable for this state change.

```python
import json
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE bookings (id INTEGER PRIMARY KEY, status TEXT NOT NULL);
CREATE TABLE outbox (event_id TEXT PRIMARY KEY, booking_id INTEGER NOT NULL, payload TEXT NOT NULL);
INSERT INTO bookings VALUES (7, 'pending'), (8, 'pending');
""")


def confirm(booking_id, event_id):
    with db:
        updated = db.execute(
            "UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending'",
            (booking_id,),
        )
        if updated.rowcount == 0:
            return False
        event = {"type": "BookingConfirmed", "bookingId": booking_id}
        db.execute("INSERT INTO outbox VALUES (?, ?, ?)", (event_id, booking_id, json.dumps(event)))
        return True


assert confirm(7, "booking-7-confirmed")
assert not confirm(7, "booking-7-confirmed")
try:
    confirm(8, "booking-7-confirmed")
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("duplicate event ID should roll back the booking update")
assert db.execute("SELECT status FROM bookings WHERE id = 8").fetchone() == ("pending",)
assert db.execute("SELECT event_id FROM outbox").fetchall() == [("booking-7-confirmed",)]
```

A committed outbox row proves the intent to publish exists. It does not prove the broker or consumer has observed the event. Track relay lag and recover old unpublished rows.

## Result context

The database rollback also rolls back the event. Publishing remains asynchronous and typically at least once. Plan cleanup, lag monitoring, ordering per entity, and idempotency at the destination.

## Related patterns

- [Transaction log tailing](/blog/SystemDesign/2026-11-20-pattern-transaction-log-tailing)
- [Polling publisher](/blog/SystemDesign/2026-11-20-pattern-polling-publisher)
- [Idempotent consumer](/blog/SystemDesign/2026-11-20-pattern-idempotent-consumer)

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/transactional-outbox.html#learn-more).

## Verify the behavior

Crash before commit, after commit but before publishing, and after broker acknowledgement but before saving progress. The first should publish nothing, the second should eventually publish, and the last can replay the same ID. Track backlog age and account for ordering in consumers.
