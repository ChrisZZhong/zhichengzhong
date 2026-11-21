---
layout: post
title: "Pattern: Service registry"
date: 2026-11-20
description: "Keep a directory of instances and their addressing metadata. Retire entries when a lease expires or an authoritative health signal changes."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/service-registry.html"
---

## Context

Discovery needs a current map from service names to endpoints. A registry that never expires entries can route traffic to long-dead processes.

## Problem

Where can callers or routers discover the current network endpoints for a service?

## Forces

Replica membership changes during scaling, rollouts, and crashes. Discovery needs a freshness guarantee and a plan for clients that temporarily lose access to the registry.

## Solution

Store instance ID, endpoint, readiness, zone, and a lease or platform lifecycle revision. Publish or expose a filtered snapshot to callers or routers. Define how clients behave if the registry is unreachable and their cached view gets older.

![Service instances to Endpoint registry to Router or client.](/system-design-patterns/service-registry/diagram)

## Examples

Eureka is one reference implementation. Kubernetes offers an infrastructure-managed alternative in which Services and EndpointSlices give the routing layer the addresses it needs.

A scheduler records new Capacity endpoints with zone and lease information. Consumers watch changes and stop choosing dead endpoints after expiry.

The reference uses Eureka as a dedicated registry for the example services. Test registry expiry separately from selection at the client or proxy.

### Registry revision example

A registration update and a removal can arrive out of order. Keep a revision for each instance, including a removal until earlier messages are no longer possible.

```javascript
import assert from 'node:assert/strict';

const instances = new Map();
function apply(change) {
  const current = instances.get(change.id);
  if (!current || change.revision > current.revision) {
    instances.set(change.id, change);
  }
}

function endpoints(now) {
  return [...instances.values()]
    .filter(e => !e.removed && e.ready && e.expiresAt > now)
    .map(e => e.address);
}

apply({ id: 'a', revision: 1, address: 'accounts-a', ready: true, expiresAt: 500 });
assert.deepEqual(endpoints(20), ['accounts-a']);
apply({ id: 'a', revision: 3, removed: true });
apply({ id: 'a', revision: 2, address: 'accounts-a', ready: true, expiresAt: 600 });
assert.deepEqual(endpoints(30), []);
apply({ id: 'b', revision: 1, address: 'accounts-b', ready: true, expiresAt: 40 });
assert.deepEqual(endpoints(40), []);
```

In a distributed registry, revisions and removal records must survive failover. A client watching changes also needs a way to rebuild its snapshot if its resume position is no longer available.

## Resulting context

Services can move and scale while retaining stable logical names. A registry outage or stale feed can misroute traffic, so decide how clients behave with the last known endpoints.

## Related patterns

- [Self-registration](/blog/SystemDesign/2026-11-20-pattern-self-registration)
- [Third-party registration](/blog/SystemDesign/2026-11-20-pattern-third-party-registration)
- [Server-side discovery](/blog/SystemDesign/2026-11-20-pattern-server-side-discovery)

## Verify the behavior

Register a short-lived instance and let it stop without deregistering. It should disappear at lease expiry. Test a registry outage and confirm whether callers use a bounded stale view or fail safely.
