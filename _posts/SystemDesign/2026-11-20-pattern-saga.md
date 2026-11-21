---
layout: post
title: "Pattern: Saga"
date: 2026-11-20
description: "Coordinate several durable local transactions. Record progress and define compensating actions for earlier steps that remain reversible when a later step fails."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/saga.html"
---

## Context

Checkout changes inventory, billing, and order state owned by different services. A local commit by one participant may be durable even while a later step is running or failing.

## Problem

How can several services complete an order when each commits independently and a later step can fail?

## Forces

A distributed two-phase commit is unavailable or a poor fit for autonomous services. Business-level compensation, duplicate handling, and reconciled timeouts have to be designed before intermediate states are exposed.

## Solution

Choose choreography when a few participants can react to events with clear ownership. Use a durable orchestrator when the workflow needs an explicit owner, ordering, and deadlines. Each step records its outcome locally and emits a result that can be replayed. Model what can be undone, what can be retried, and what has become irreversible.

![A saga replaces one cross-service transaction with a sequence of local commits.](https://microservices.io/i/sagas/From_2PC_To_Saga.png)

## Example: Choreography-based saga

Orders commits a pending order and publishes the creation event. The customer service consumes it and tries to reserve credit. Orders changes its status in response to the credit event it receives. Each participant directs its own reaction to a known event.

A booking saga holds a seat and authorizes payment. If authorization is denied, it releases the hold and records a failed booking. A timeout starts reconciliation if the payment result is unknown.

![Order and credit services react to each other's events during order approval.](https://microservices.io/i/sagas/Create_Order_Saga.png)

## Example: Orchestration-based saga

Orders starts a durable workflow and stores the expected reply. The workflow sends a credit-reservation command to the customer service, then uses the correlated reply to approve or reject the order. It records the decision and next message together.

![A workflow coordinates credit reservation with commands and correlated replies.](https://microservices.io/i/sagas/Create_Order_Saga_Orchestration.png)

## Resulting context

Each participant keeps its own transaction boundary. Intermediate states are visible, so a second operation may see a pending order or a temporary hold. Reserve scarce resources explicitly, make allowed state transitions clear, and define compensations for each reversible side effect. A failed compensation can require further retries or manual resolution.

## Related patterns

- [Transactional outbox](/blog/SystemDesign/2026-11-20-pattern-transactional-outbox)
- [Idempotent consumer](/blog/SystemDesign/2026-11-20-pattern-idempotent-consumer)
- [Database per service](/blog/SystemDesign/2026-11-20-pattern-database-per-service)

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/saga.html#learn-more).

## Example code

The reference compares event-based and orchestrated customers-and-orders implementations. Use the example below to trace how an orchestrator handles stale and duplicate replies. [Source implementations](https://microservices.io/patterns/data/saga.html#example-code).

### Reply handling example

This runnable Node.js example isolates the state decision. A production orchestrator persists the new state and outgoing message together. The account service still owns the actual credit reservation.

```javascript
import assert from 'node:assert/strict';

function handleCreditReply(order, reply) {
  if (order.reservationId !== reply.reservationId || order.state !== 'pending') {
    return { order, action: null };
  }
  if (reply.status === 'reserved') {
    return { order: { ...order, state: 'approved' }, action: 'confirm-booking' };
  }
  if (reply.status === 'declined') {
    return { order: { ...order, state: 'rejected' }, action: 'release-seat' };
  }
  return { order, action: 'reconcile-credit' };
}

const order = { state: 'pending', reservationId: 'credit-7' };
assert.equal(handleCreditReply(order, { reservationId: 'credit-7', status: 'timeout' }).order.state, 'pending');
const decision = handleCreditReply(order, { reservationId: 'credit-7', status: 'reserved' });
assert.equal(decision.order.state, 'approved');
assert.equal(handleCreditReply(decision.order, { reservationId: 'credit-7', status: 'reserved' }).action, null);
assert.equal(handleCreditReply(order, { reservationId: 'credit-8', status: 'declined' }).action, null);
```

When a prior participant commits successfully and a later step fails, send a correlated compensating command only where the business can reverse that effect. Record compensation failures and schedule follow-up instead of marking the saga finished prematurely.

## Verify the behavior

Run the flow with a payment rejection, a duplicate success reply, and a timeout followed by a late approval. Compensation should free an eligible hold once. A timeout with an unknown payment result should lead to reconciliation before treating it as a decline.
