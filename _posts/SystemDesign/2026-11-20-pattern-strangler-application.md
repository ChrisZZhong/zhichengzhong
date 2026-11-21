---
layout: post
title: "Pattern: Strangler application"
date: 2026-11-20
description: "Put a routing seam in front of a legacy capability. Reimplement a bounded slice, direct that slice to the new service, and retire the legacy branch after validation."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/refactoring/strangler-application.html"
---

## Context

A legacy application needs to keep serving traffic while its capabilities change. Replacing everything at once makes behaviour differences difficult to isolate and rollback expensive.

## Problem

How can a team replace parts of a legacy application while the existing users keep working?

## Forces

New and old implementations will operate together for a time. The migration needs control over traffic, authority over writes, and a way to roll back before those interfaces are removed.

## Solution

Introduce a façade or routing seam. Migrate one endpoint or customer cohort, shadow reads where appropriate, and make the owner of each write explicit. Keep the previous route available until compatibility and data migration are demonstrated.

![New services take over selected traffic while the rest stays with the monolith.](https://microservices.io/i/decompose-your-monolith-devnexus-feb-2020.001.jpeg)

## Examples

Move postcode lookup first. The entry router sends lookup requests to the new backend and keeps account changes on the old application.

## Resulting context

Small traffic shifts give you observable rollback points. Parallel implementations, data ownership, and synchronization can become expensive if the migration stalls.

## Related patterns

- [Anti-corruption layer](/blog/SystemDesign/2026-11-20-pattern-anti-corruption-layer)
- [API gateway](/blog/SystemDesign/2026-11-20-pattern-api-gateway)

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/refactoring/strangler-application.html#learn-more).

## Verify the behavior

Compare old and new responses for representative requests. Try a rollback after the new handler has written data and check how the legacy path will see that state. Retire the old route once remaining traffic and dependencies are accounted for.
