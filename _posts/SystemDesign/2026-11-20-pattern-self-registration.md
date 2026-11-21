---
layout: post
title: "Pattern: Self Registration"
date: 2026-11-20
description: "Have each instance announce its address and renew a lease while it is ready. On a planned shutdown it drains and withdraws its entry."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/self-registration.html"
---

## Context

An application process can often tell when it is initialized or when it is about to stop. The discovery layer needs that information before sending it traffic.

## Problem

How can an instance advertise itself when ready and stop receiving traffic when it shuts down?

## Forces

Normal shutdown can deregister explicitly. Crashes cannot, so registry leases or health checks need to expire entries without creating instability during short pauses.

## Solution

Register only after readiness conditions succeed, then renew the lease at a cadence shorter than its lifetime. On shutdown, stop accepting new requests, remove or mark the endpoint, and allow in-flight requests to drain. Rely on expiry when shutdown callbacks cannot run.

![Ready instance to Register and renew to Service registry.](/system-design-patterns/self-registration/diagram)

## Examples

A Eureka client can publish its registration as its service starts and renew its membership periodically. Load-balancing clients then obtain the updated set of eligible addresses from the registry.

A new background API registers after its startup checks succeed. If the process dies without deregistering, its short lease eventually expires.

The reference uses an Eureka client that registers its own service instance. Renewal and deregistration belong to the instance lifecycle, with lease expiry covering an unclean shutdown.

### Heartbeat example

An instance gets a fresh generation when it registers. The registry compares generations so a process that shut down late cannot renew a newer instance's lease.

```javascript
import assert from 'node:assert/strict';

function renew(lease, generation, now, ttl) {
  if (lease.generation !== generation || now >= lease.expiresAt) {
    return null;
  }
  return { ...lease, expiresAt: now + ttl };
}

const ready = { endpoint: 'accounts-a', generation: 'boot-17', expiresAt: 15_000 };
assert.equal(renew(ready, 'boot-17', 5_000, 15_000).expiresAt, 20_000);
assert.equal(renew(ready, 'boot-16', 5_000, 15_000), null);
assert.equal(renew(ready, 'boot-17', 15_000, 15_000), null);
```

The generation comparison belongs on the registry side. If renewal fails because the lease has expired, the process should only register again after confirming it is ready. During an orderly shutdown it stops renewing and withdraws its active generation.

## Resulting context

The instance can communicate its state directly. Application code must handle lease expiry, termination races, and differences in how different runtimes report health.

## Related patterns

- [Third-party registration](/blog/SystemDesign/2026-11-20-pattern-third-party-registration)
- [Service registry](/blog/SystemDesign/2026-11-20-pattern-service-registry)
- [Health check API](/blog/SystemDesign/2026-11-20-pattern-health-check-api)

## Verify the behavior

Kill the process before it deregisters and verify the entry expires. Interrupt heartbeat traffic briefly and measure whether clients flap between endpoints or continue with known healthy alternatives.
