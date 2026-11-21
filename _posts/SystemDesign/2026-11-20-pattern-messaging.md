---
layout: post
title: "Pattern: Messaging"
date: 2026-11-20
description: "Send commands or publish facts through an intermediary. Producers finish after the required acknowledgement, while consumers process the message on their own schedule."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/communication-style/messaging.html"
---

## Context

A producer needs to trigger work owned by other services, but those consumers may be slow, temporarily offline, or deployed on a different schedule.

## Forces

The broker absorbs periods when consumers lag or restart. Teams still have to decide when a producer can report success, how retries work, and who owns the message schema.

## Problem

How can services exchange work and business events when they are available at different times?

## Solution

Use a destination whose semantics match the message. Send a command to the owner that should perform it, or publish a fact to let independent consumers decide what to do. Define the envelope, key, schema, acknowledgement timing, and retry or dead-letter path. Protect the gap between a business commit and publication with an outbox when needed.

![Booking service to Event broker branches to Email worker and Analytics worker.](/system-design-patterns/messaging/diagram)

## Examples

Kafka and RabbitMQ are examples of messaging infrastructure. The FTGO order example publishes an order-created event so other services can react to a committed order independently.

A booking service publishes a confirmation to a durable topic. Email and analytics consume it independently and recover from their own checkpoints.

The source points to an FTGO OrderService event emitted when it creates an order and mentions Kafka and RabbitMQ as broker options. The example below uses an original booking event and one stable event identity.

### Event envelope example

A booking publisher sends the following logical event. The ID is created once and reused on retry. A Kafka producer can use the booking ID as the message key to keep a booking's updates in the same partition.

```json
{
  "id": "event-booking-742-v3",
  "type": "BookingConfirmed",
  "schemaVersion": 1,
  "aggregateId": "booking-742",
  "aggregateVersion": 3,
  "occurredAt": "2026-11-20T14:20:00Z",
  "data": {
    "bookingId": "booking-742",
    "venueId": "venue-38"
  }
}
```

Email and analytics can subscribe independently. Each consumer owns its acknowledgement and retry policy. Commit local effects before acknowledging and preserve the original event ID across retries and replay.

## Resulting context

Queues and topics absorb different processing rates. Delivery, backlog, retries, schema evolution, and ordering become observable operational concerns.

## Related patterns

- [Idempotent consumer](/blog/SystemDesign/2026-11-20-pattern-idempotent-consumer)
- [Transactional outbox](/blog/SystemDesign/2026-11-20-pattern-transactional-outbox)
- [Domain event](/blog/SystemDesign/2026-11-20-pattern-domain-event)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/communication-style/messaging.html#see-also).

## Verify the behavior

Pause the email consumer while booking continues, then restore it. It should catch up without duplicate side effects or a burst that overloads the email provider. Compare event retention with the outage or replay interval the system needs to support.
