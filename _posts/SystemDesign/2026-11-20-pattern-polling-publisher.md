---
layout: post
title: "Pattern: Polling publisher"
date: 2026-11-20
description: "A worker reads batches of unprocessed outbox rows, publishes them, and records progress. Coordinating workers must claim rows without dropping uncompleted work."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/polling-publisher.html"
---

## Context

The producer needs a relay but the database transaction log is unavailable to application operators. Independent publisher workers need to avoid losing pending work when a process exits.

## Problem

How can an outbox relay discover and publish new entries without reading the database log?

## Forces

The relay needs safe claims under concurrent polling and a retry path after a crash. Batch size and the polling interval set a trade-off between database load and publication delay.

## Solution

Select pending rows in bounded batches. Use a short transaction to claim them with an expiry, then publish outside the database transaction. After the broker accepts a message, finalize the claim with a matching lease token. Reclaim expired rows and design for duplicate publication.

![Outbox rows to Lease a batch to Publish events to Mark complete.](/system-design-patterns/polling-publisher/diagram)

## Examples

The Eventuate Tram relay is a reference implementation. A poller finds committed rows and forwards them to the broker. If a send succeeds before the relay records that fact, the next poll may deliver the same message ID again.

A relay leases pending rows, publishes each event, and marks it complete after acknowledgement. A later worker reclaims expired leases.

Eventuate Tram is the reference implementation cited by the source. The polling loop below focuses on how a worker claims, publishes, and finalizes rows when several workers can run at once.

### PostgreSQL batch claim example

Assume an outbox table with `event_id`, `payload`, `created_at`, `lease_token`, `lease_expires_at`, and `published_at`. The worker generates a fresh token, passed as `$1`, before starting the claim. It commits the claim before making any network calls.

```sql
WITH pending AS (
    SELECT event_id
    FROM outbox
    WHERE published_at IS NULL
      AND (lease_expires_at IS NULL OR lease_expires_at <= now())
    ORDER BY created_at, event_id
    LIMIT 40
    FOR UPDATE SKIP LOCKED
)
UPDATE outbox AS event
SET lease_token = $1,
    lease_expires_at = now() + interval '30 seconds'
FROM pending
WHERE event.event_id = pending.event_id
RETURNING event.event_id, event.payload;
```

Only the current lease holder can finalize that row after the broker acknowledges it.

```sql
UPDATE outbox
SET published_at = now(), lease_token = NULL, lease_expires_at = NULL
WHERE event_id = $1 AND lease_token = $2 AND published_at IS NULL;
```

A zero-row update means ownership was lost or the event was already finalized. Multiple workers claiming rows with `SKIP LOCKED` do not establish a global publish order. Apply an additional ordering policy if related events must reach consumers in sequence. [PostgreSQL row locking](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE).

## Resulting context

Polling can work without database log access. Sharing work can change event ordering, tighter polling creates load, and success followed by a failed database update can produce duplicates.

## Related patterns

- [Transactional outbox](/blog/SystemDesign/2026-11-20-pattern-transactional-outbox)
- [Transaction log tailing](/blog/SystemDesign/2026-11-20-pattern-transaction-log-tailing)
- [Idempotent consumer](/blog/SystemDesign/2026-11-20-pattern-idempotent-consumer)

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/polling-publisher.html#learn-more).

## Verify the behavior

Crash a worker after it claims a batch and then again after a successful publish. The first batch must become claimable again. The second may be published twice, with the same event IDs. Check lag and fairness when one key receives heavier traffic.
