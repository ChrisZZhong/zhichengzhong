---
layout: post
title: "Pattern: Shared database"
date: 2026-11-20
description: "Let more than one service use the same database schema where a common transaction or direct access is an intentional design constraint."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/shared-database.html"
---

## Context

Some systems need a critical invariant enforced by a single transaction while software is still being split. Several processes may share a database to maintain that invariant and ease incremental migration.

![Customer and order services maintain related business data.](https://microservices.io/i/customersandorders.png)

## Problem

When can an application use one database to enforce a rule across services?

## Forces

Using the same datastore makes joins and local transactions straightforward. Cross-service schema access makes deployment coordination necessary, and one participant's load can block another.

## Solution

Document table ownership, schema migration order, and which transaction owns each invariant. Avoid splitting a single atomic operation into two independent HTTP requests around the same database. Use constraints or conditional updates to handle concurrency at the data boundary.

## Example

The source illustrates the pattern with orders and customer credit. In a relational database, lock the same customer row in every transaction that changes committed credit usage, or use serializable transactions with retry. Two writers that merely read the credit balance can otherwise both approve an order.

During an incremental split, two application processes reserve inventory in the same database. They rely on the same constraint to prevent double-booking.

The source uses an order's credit limit to illustrate a cross-service invariant. If the services intentionally share the same database transaction, a conditional credit reservation can reject the order before any order row is committed.

### Shared transaction example

This runnable SQLite example reserves customer credit and inserts the order in one database transaction. The credit reservation condition runs in the database so a read performed by the caller cannot become the authoritative balance check.

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE credit (customer INTEGER PRIMARY KEY, available INTEGER NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer INTEGER NOT NULL, amount INTEGER NOT NULL);
INSERT INTO credit VALUES (1, 100);
""")


def place_order(order_id, customer, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    with db:
        db.execute("BEGIN IMMEDIATE")
        existing = db.execute(
            "SELECT customer, amount FROM orders WHERE id = ?", (order_id,)
        ).fetchone()
        if existing is not None:
            if existing != (customer, amount):
                raise ValueError("order ID already belongs to another request")
            return True
        updated = db.execute(
            """UPDATE credit SET available = available - ?
               WHERE customer = ? AND available >= ?""",
            (amount, customer, amount),
        )
        if updated.rowcount != 1:
            return False
        db.execute("INSERT INTO orders VALUES (?, ?, ?)", (order_id, customer, amount))
        return True


assert place_order(7, 1, 60)
assert place_order(7, 1, 60)
assert not place_order(8, 1, 60)
assert db.execute("SELECT available FROM credit WHERE customer = 1").fetchone() == (40,)
assert db.execute("SELECT id FROM orders").fetchall() == [(7,)]
```

The design can be a reasonable migration step while Orders and Credit still use the same store. When data ownership separates, a saga or another coordination design must make the intermediate states visible.

## Resulting context

Local SQL joins and transactions simplify coordination. Schema changes, locking, and resource usage can couple deployments, so establish ownership and a migration plan.

## Related patterns

- [Database per service](/blog/SystemDesign/2026-11-20-pattern-database-per-service)
- [Strangler application](/blog/SystemDesign/2026-11-20-pattern-strangler-application)

## Verify the behavior

Race two seat-reservation requests or retry after a failed transaction. Exactly one purchase should consume the last seat. Track lock waits and confirm a schema rollout can be deployed without an accidental dependency on lockstep binaries.
