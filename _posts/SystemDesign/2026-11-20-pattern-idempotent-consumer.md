---
layout: post
title: "Pattern: Idempotent Consumer"
date: 2026-11-20
description: "Make a replay of the same message leave the intended result unchanged. For local database effects, record the message or operation ID and update business state in one transaction."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/communication-style/idempotent-consumer.html"
---

## Context

A broker can redeliver after a dropped acknowledgement, consumer crash, or replay. Applying an accounting update or increment twice is incorrect even when the payload is otherwise valid.

## Problem

How can a subscriber make repeated deliveries have the same business effect as one delivery?

## Solution

Use a deduplication key scoped to the consumer and logical message or operation. Attempt to claim it with a unique constraint in the same transaction that applies local effects. Acknowledge only after commit. For a separate external effect, use the provider's idempotency support or retain enough information to reconcile ambiguous results.

Two common places to keep a processed message ID are a table keyed by subscriber and message, or the business record the event updates. A unique constraint or conditional write settles simultaneous repeat deliveries safely.

![The consumer checks processed message IDs when handling a delivery.](https://microservices.io/i/IdempotentConsumer/IdempotentConsumer.png)

## Example

A confirmed-booking event arrives twice. The second insert of its ID hits a unique constraint and the handler skips the duplicate update.

### Atomic deduplication example

The database tracks event IDs per subscriber. The insert and local credit update share a transaction, so a failure rolls back both and lets a later delivery retry safely.

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE processed (subscriber TEXT, event_id TEXT, PRIMARY KEY (subscriber, event_id));
CREATE TABLE wallet (id INTEGER PRIMARY KEY, balance INTEGER NOT NULL);
INSERT INTO wallet VALUES (1, 0);
""")


def apply_credit(event_id, wallet_id, amount):
    with db:
        claimed = db.execute(
            "INSERT INTO processed VALUES (?, ?) ON CONFLICT (subscriber, event_id) DO NOTHING",
            ("wallet-credit", event_id),
        )
        if claimed.rowcount == 0:
            return "duplicate"
        change = db.execute(
            "UPDATE wallet SET balance = balance + ? WHERE id = ?", (amount, wallet_id)
        )
        if change.rowcount != 1:
            raise LookupError(wallet_id)
        return "applied"


assert apply_credit("event-5", 1, 25) == "applied"
assert apply_credit("event-5", 1, 25) == "duplicate"
assert db.execute("SELECT balance FROM wallet WHERE id = 1").fetchone() == (25,)
try:
    apply_credit("event-6", 999, 5)
except LookupError:
    pass
else:
    raise AssertionError("the missing target should roll back")
assert db.execute("SELECT 1 FROM processed WHERE event_id = 'event-6'").fetchone() is None
```

Acknowledge after the application function returns successfully. This transaction cannot undo or deduplicate an external effect such as a payment or email delivery unless that destination participates in the idempotency contract.

## See also

[Related references on Microservices.io](https://microservices.io/patterns/communication-style/idempotent-consumer.html#see-also).

## Resulting context

Choose a deduplication key and retention horizon that match real retry paths. External outcomes such as sending an email need provider idempotency or a separate reconciliation plan.

## Related patterns

- [Messaging](/blog/SystemDesign/2026-11-20-pattern-messaging)
- [Transactional outbox](/blog/SystemDesign/2026-11-20-pattern-transactional-outbox)
- [Saga](/blog/SystemDesign/2026-11-20-pattern-saga)

## Verify the behavior

Deliver the same event concurrently and crash after the local commit but before acknowledging it. The stored state should change once in both cases. Verify that retention of the deduplication key covers both normal retries and the longest replay period you support.
