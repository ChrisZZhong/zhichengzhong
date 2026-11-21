---
layout: post
title: "Pattern: Distributed tracing"
date: 2026-11-20
description: "Propagate trace context across process boundaries and record spans for individual operations. Group spans to see timing, causality, and errors across services."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/distributed-tracing.html"
---

## Context

A checkout request spreads across a gateway, reservations, payments, and queues. A single aggregate duration cannot show which hop caused a regression or whether calls ran in parallel.

## Problem

How can someone follow one request across synchronous calls and asynchronous work?

## Forces

Edge timers can spot the regression but cannot attribute its cost. Propagation, collection, and sampling should keep enough evidence to diagnose slow paths without saturating the telemetry pipeline.

## Solution

Create spans around service calls and carry trace context across HTTP or inside message metadata. Each span records timing, outcome, and its parent or related span. At trust boundaries, decide how incoming trace context and sampling flags are handled.

![Gateway span to Reservation span to Payment span to Trace viewer.](/system-design-patterns/distributed-tracing/diagram)

## Examples

Record the trace ID at the public boundary and propagate it to downstream work. A trace viewer such as Zipkin can then show what took time within the request.

An elevated booking latency traces to one slow payment call. A queue-based notification continues with its own span linked to the original request.

The source demonstrates the older Spring Cloud Sleuth and Zipkin stack. The HTTP example below uses W3C Trace Context to show the transport mechanism independently of any particular exporter.

### HTTP propagation example

In this version-00 W3C `traceparent` example, a gateway and an account service share a trace ID. For the next outbound request, the account service uses the span ID of its new client span as the propagated parent ID. The flags here are illustration data. In an application, use your tracer's propagator and context API.

```javascript
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

function childHeader(incoming) {
  const version00 = /^00-([a-f0-9]{32})-([a-f0-9]{16})-([a-f0-9]{2})$/;
  const match = version00.exec(incoming);
  if (!match || /^0+$/.test(match[1]) || /^0+$/.test(match[2])) {
    throw new Error('A valid trusted traceparent is required for this example');
  }
  let child;
  do {
    child = randomBytes(8).toString('hex');
  } while (child === match[2] || /^0+$/.test(child));
  return ['00', match[1], child, match[3]].join('-');
}

const parent = '00-90a7864870664830a032f09c6a64beee-21a5ba0d2ad74c2f-01';
const next = childHeader(parent);
assert.equal(next.split('-')[1], parent.split('-')[1]);
assert.notEqual(next.split('-')[2], parent.split('-')[2]);
```

Generating a header alone does not record a span. Instrument the server and client operations, export their timing and status, and view the related spans together. [W3C Trace Context](https://www.w3.org/TR/trace-context/#traceparent-header).

## Resulting Context

Traces pinpoint where time is spent, especially with fan-out. Sampling may miss rare incidents, and inconsistent context propagation produces incomplete traces.

## Related patterns

- [Application metrics](/blog/SystemDesign/2026-11-20-pattern-application-metrics)
- [Log aggregation](/blog/SystemDesign/2026-11-20-pattern-log-aggregation)
- [Service mesh](/blog/SystemDesign/2026-11-20-pattern-service-mesh)

### See also

[Related references on Microservices.io](https://microservices.io/patterns/observability/distributed-tracing.html#see-also).

## Verify the behavior

Trace a request with a slow downstream call and a later asynchronous event. Verify the trace shows the slow hop and an appropriate parent relationship or span link across the queue. Check that errors can be joined to structured logs.
