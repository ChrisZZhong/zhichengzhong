---
layout: post
title: "Pattern: Database per service"
date: 2026-11-20
description: "Give one service authority over each data set. Enforce ownership with separate permissions or stores and expose changes through the service contract."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/database-per-service.html"
---

## Context

Teams want to deploy schema changes independently. Direct access to another service's tables creates hidden consumers of those migrations and makes it hard to enforce the owner's business rules.

![Customer and order services maintain related business data.](https://microservices.io/i/customersandorders.png)

## Problem

How should a microservice application's databases be arranged so each service can evolve its data independently?

## Forces

Separate ownership makes schema changes safer and lets services choose storage independently. Credit checks, order placement, and customer reports still need access to information across boundaries.

## Solution

Keep each service's writes within a database boundary it controls. Separate schemas or databases with independent credentials can provide that boundary without requiring one physical database server per service. Use published interfaces, events, and read models for cross-owner access.

![Services use separate data stores and collaborate across an interface.](https://microservices.io/i/databaseperservice.png)

## Example

In FTGO, services use separate logical databases on one MySQL server. Separate credentials enforce ownership. Physical separation is useful when it provides additional isolation or separate capacity planning.

Billing may read an order total from the Orders API, but only Orders can change the order rows. Each team can evolve its schema under that boundary.

The reference's FTGO example uses service-specific credentials and logical databases on a shared MySQL server. The enforceable ownership boundary is the important property, even when the database hardware is shared.

## Resulting context

Independent schema changes become easier. Cross-owner queries and writes need composition, replicas, or workflows with explicit consistency limits.

## Related patterns

- [Shared database](/blog/SystemDesign/2026-11-20-pattern-shared-database)
- [API composition](/blog/SystemDesign/2026-11-20-pattern-api-composition)
- [Saga](/blog/SystemDesign/2026-11-20-pattern-saga)

## Verify the behavior

Run Billing with its actual credentials and attempt a direct write to Orders. It should be denied. Exercise a compatible Orders schema migration and show that Billing still works through the API or event contract.
