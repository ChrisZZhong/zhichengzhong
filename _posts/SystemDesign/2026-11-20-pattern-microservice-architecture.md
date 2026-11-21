---
layout: post
title: "Microservice Architecture pattern"
date: 2026-11-20
description: "Make business services independently deployable and let each service own its contracts and state. Callers communicate through explicit APIs or events."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/microservices.html"
---

## Context

A business-critical application needs frequent, reliable releases. Small cross-functional teams can own business subdomains and operate what they build. The architecture determines how often those teams can turn a change into a release on their own.

![Teams take responsibility for different areas of the business domain.](https://microservices.io/i/posts/teams-own-subdomains.png)

## Problem

How should business subdomains be packaged so teams can deliver at different speeds?

## Forces

Small components make it easier to understand changes, test them quickly, and keep one team in charge of a release. Separate workloads may also call for different technology, throughput, or uptime. Closely related operations are easier to trace when they stay local, can avoid network round trips, and can share an ACID transaction. Evaluate a boundary against both sets of constraints.

## Solution

Package the subdomains as independently deployable services. Give each subdomain a clear owner and group closely related ones into a service where that fits the workload and the team's responsibilities. Each service exposes an explicit API or event contract and manages its own data. A gateway can route public requests without exposing the application's internal layout.

![Teams own services comprising one or more business subdomains.](https://microservices.io/i/posts/microservices-teams-subdomains.png)

## Examples

A booking platform can release its seat-reservation service without redeploying billing. The services communicate using a stable reservation identifier and versioned events.

### Fictitious e-commerce application

A storefront supports checkout while separate services own inventory, available credit, and shipping. When an order comes in, the order service coordinates stock and payment decisions with their owners. The shipping service picks up confirmed orders, using its own delivery rules and release cycle.

![An example store separates its storefront and backend capabilities into services.](https://microservices.io/i/Microservice_Architecture.png)

### Show me the code

Trace one order or reservation through the service boundaries in the [FTGO example application](https://github.com/microservices-patterns/ftgo-application). Start at the gateway and identify which service owns each write.

## Resulting context

### Benefits

Each team can change and test a smaller component. Common operations can scale with their own traffic, and one component can adopt a new runtime on its own schedule.

### Drawbacks

Remote interactions add latency and failure modes. Workflows can require retries, compensations, and eventually consistent state around service-owned databases.

### Issues

Measure how many releases actually require synchronized changes. A service boundary that forces most user-facing changes through several teams may need to move.

#### Designing a good (monolithic or microservice) architecture with Assemblage

Richardson's Assemblage method starts with business subdomains and their team owners, then evaluates candidate deployable groupings against operational and delivery constraints. Compare the grouping that makes most changes local with the grouping that gives teams the most release independence.

![The architecture groups business subdomains into deployable components owned by teams.](https://microservices.io/i/posts/assemblage-overview/Defining_Microservice_Architecture_V2.png)

![Design pressures that encourage splitting components and other pressures that favor keeping operations local.](https://microservices.io/i/posts/dark-energy-dark-matter/Dark_Energy_Dark_Matter_overview.png)

#### Designing distributed operations

Choose a collaboration pattern for each cross-service operation. A write can use a saga across local transactions. A read can compose API results at request time or use a CQRS projection when joins are expensive.

![Patterns for commands and queries that involve multiple data owners.](https://microservices.io/i/patterns/data/service-collaboration-patterns.png)

## Related patterns

- [Database per service](/blog/SystemDesign/2026-11-20-pattern-database-per-service)
- [Saga](/blog/SystemDesign/2026-11-20-pattern-saga)
- [API gateway](/blog/SystemDesign/2026-11-20-pattern-api-gateway)

![Patterns that address operational and design problems introduced by microservices.](https://microservices.io/i/PatternsRelatedToMicroservices.jpg)

## Known uses

The reference points to Netflix, Amazon, and eBay as examples of teams moving from a monolith toward distributed services as their product and operational needs changed.

## Verify the behavior

Roll one service back while its neighbours remain at the new version. Simulate a downstream outage and check whether the user sees a partial result, a retryable error, or an accepted asynchronous operation. Measure how often changes still cross deployment boundaries.
