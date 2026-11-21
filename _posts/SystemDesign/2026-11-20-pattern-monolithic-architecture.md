---
layout: post
title: "Pattern: Monolithic Architecture"
date: 2026-11-20
description: "Keep business modules in one deployable application. Give each module a clear interface so it can own decisions and data without a network call."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/monolithic.html"
---

## Context

A young product needs checkout, catalog, fulfilment, and support to evolve together. Decide whether separate releases would solve an existing problem before paying for distributed calls and separate deployments.

![Teams take responsibility for different areas of the business domain.](https://microservices.io/i/posts/teams-own-subdomains.png)

## Problem

When should the application's subdomains ship as one executable or deployable unit?

## Forces

One deployment keeps interactions local and allows shared transactions. As more teams modify the component, build time and the coordination needed for every release can grow.

## Solution

Use module boundaries inside the process. Give each module ownership of tables or clearly documented data contracts. Keep an API between inventory and checkout even when it is a method call. A simple dependency test can reject imports into a neighbour's persistence layer.

![One deployable contains the subdomains whose code is maintained by multiple teams.](https://microservices.io/i/posts/monolith-teams-subdomains.png)

## Example

A small booking platform releases search, reservations, and billing in a single executable. Reservation and billing can update their records in one local transaction.

The reference models a store's ordering, account, and shipping functions in one application. Those functions can still be expressed as modules behind interfaces and use one transaction where the business rule requires it.

![Example online store packaged as one application with logical internal components.](https://microservices.io/i/DecomposingApplications.011.jpg)

## Resulting context

### Benefits

A call between two modules can run in-process and share a local transaction. Packaging the system once also simplifies end-to-end verification and deployment early in the product's life.

### Drawbacks

The whole application shares the deployment pipeline and much of the runtime. A busy or faulty module can consume resources needed by others, and unrelated releases may wait for the same build.

### Issues

Enforce module interfaces and ownership before deciding that a release bottleneck calls for services. Build and test modules selectively where tooling permits, then measure whether a deployment boundary would pay for itself.

## Related patterns

- [Microservice architecture](/blog/SystemDesign/2026-11-20-pattern-microservice-architecture)
- [Strangler application](/blog/SystemDesign/2026-11-20-pattern-strangler-application)

## Known uses

The reference cites early versions of Netflix, Amazon, and eBay. Their later architectures illustrate how an initial deployment decision can change as traffic and team coordination grow.

## Verify the behavior

Time a small change from commit to production and exercise a complete rollback. Compare how often modules change together and how load is distributed. Consider extracting a module only when independent scaling, failure isolation, or release cadence has a concrete benefit.
