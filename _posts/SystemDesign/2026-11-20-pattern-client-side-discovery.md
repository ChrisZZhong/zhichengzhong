---
layout: post
title: "Pattern: Client-side service discovery"
date: 2026-11-20
description: "The caller obtains healthy endpoints from a service registry and picks a destination locally. Refresh discovery information while applying connection and retry policies."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/client-side-discovery.html"
---

## Context

Direct callers need to reach instances that change during rollouts and scaling. Hard-coded destinations make the client fragile when a backend is replaced.

![A caller has to reach an instance even as network locations change.](https://microservices.io/i/servicediscovery/discovery-problem.jpg)

## Problem

How does a client select a live instance when addresses and replica counts change?

## Forces

Instance addresses can change between deployments and during failures. Callers can choose replicas close to them, but every client runtime needs compatible discovery and health behavior.

## Solution

Have the client resolve a logical service name to discovered endpoints. Filter out unready or expired instances, refresh the list, then choose an endpoint using an appropriate load-balancing rule. The source illustrates this with Spring Cloud clients and an Eureka registry.

![The client reads the registry and picks the target instance.](https://microservices.io/i/servicediscovery/client-side-discovery.jpg)

## Examples

In the source's Spring Cloud/Eureka example, a service name resolves to eligible instances and the client balances the traffic. Application code calls the named service while the client integration refreshes the instance list.

A reservation client watches instances of Capacity, chooses one with a local load-balancing policy, and removes a draining instance from rotation.

### Client selection example

This runnable Node.js example models a client's cached registry snapshot. The registry client is responsible for refreshing the snapshot. The selection step excludes endpoints whose readiness or lease deadline makes them ineligible.

```javascript
import assert from 'node:assert/strict';

function chooseEndpoint(snapshot, now, index) {
  const ready = snapshot.filter(item => item.ready && item.expiresAt > now);
  if (ready.length === 0) {
    throw new Error('No ready account service endpoints');
  }
  return ready[index % ready.length].url;
}

const snapshot = [
  { url: 'http://accounts-a.example.test', ready: false, expiresAt: 200 },
  { url: 'http://accounts-b.example.test', ready: true, expiresAt: 90 },
  { url: 'http://accounts-c.example.test', ready: true, expiresAt: 220 },
];
assert.equal(chooseEndpoint(snapshot, 100, 0), 'http://accounts-c.example.test');
assert.throws(() => chooseEndpoint(snapshot, 220, 0), /No ready/);
```

Start a deadline-bound HTTP call only after choosing an endpoint. Refresh in the background and give stale snapshots a maximum lifetime that agrees with the application's availability and correctness requirements.

## Resulting context

The client controls routing and avoids an extra proxy hop. Every client stack needs compatible discovery behavior and a policy for stale registry results.

## Related patterns

- [Server-side discovery](/blog/SystemDesign/2026-11-20-pattern-server-side-discovery)
- [Service registry](/blog/SystemDesign/2026-11-20-pattern-service-registry)

## Verify the behavior

Replace one instance while calls are in flight. Check that cached endpoints expire or are removed promptly and that the client behaves clearly when no eligible instance exists.
