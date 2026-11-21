---
layout: post
title: "Pattern: API Composition"
date: 2026-11-20
description: "Query the services that own the data and merge their responses for a caller. Run independent calls concurrently when possible and bound their cost."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/api-composition.html"
---

## Context

An interface needs a small view across data owners, such as reservation details and payment status. A join across service databases would bypass their contracts.

## Problem

How can a read combine records when each participating service owns its datastore?

## Solution

Choose an API composer for bounded fan-out across known IDs. Run independent reads in parallel, give each call a deadline, and describe optional fields and partial failure in the response contract. For aggregate queries or deep pagination, evaluate a precomputed view instead.

![A query composes results returned by several service APIs.](https://microservices.io/i/data/ApiBasedQueryBigPicture.png)

## Example

A gateway product-details endpoint can look up the catalog record first, then fetch price and inventory in parallel by product ID. Keeping the fan-out bounded preserves the appeal of the pattern.

A booking summary reads venue details and payment status, then joins both results by known identifiers. A slow optional lookup can return a partial response.

The reference puts a composed query in an API gateway or a dedicated composer. The key decision is where to join a small number of records in memory. The authoritative services still own their individual reads.

## Resulting context

The response uses the owners’ current data without maintaining a replica. Fan-out adds latency and failure modes, especially for large joins or cross-service pagination.

## Related patterns

- [CQRS](/blog/SystemDesign/2026-11-20-pattern-cqrs)
- [API gateway](/blog/SystemDesign/2026-11-20-pattern-api-gateway)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/data/api-composition.html#see-also).

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/api-composition.html#learn-more).

## Verify the behavior

Make an optional payment-status read slow and confirm that the summary responds within its budget. Make a required booking lookup fail and verify that the result reports a failure instead of returning a misleading empty view.
