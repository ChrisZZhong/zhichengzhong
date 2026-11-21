---
layout: post
title: "Pattern: Service Integration Contract Test (Consumer-driven)"
date: 2026-11-20
description: "Encode the interactions a consumer relies on and verify them against the provider implementation in the provider pipeline."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/testing/service-integration-contract-test.html"
---

## Context

A provider wants to change a response, but deployed clients depend on different fields and error behaviours. Running every possible application combination is expensive.

## Problem

How can a provider learn in CI that an API change will break a real consumer?

## Forces

Starting the full service graph raises the cost of each check. A good contract captures externally observable behavior actually relied on in production and stays small as the provider evolves.

## Solution

Have consumers publish interactions they actually rely on. Verify those contracts against the provider build using representative provider states. Gate incompatible releases and retain required contracts for consumer versions still in production.

![Consumer expectations to Versioned contract to Provider verification.](/system-design-patterns/consumer-driven-contract-test/diagram)

## Examples

Spring Cloud Contract is the example in the source. A contract can generate provider-side verification and the matching stub so consumer and provider CI exercise the same expectations.

A checkout consumer publishes its contract for the Pricing API, including the currency field and an unavailable-item response. The pricing build fails if it no longer meets those expectations.

The source cites Spring Cloud Contract as one implementation. A contract is useful only if the provider pipeline verifies the cases deployed consumers depend on.

## Resulting context

Contract verification catches incompatible changes earlier than a full deployment. Contracts must reflect actual usage, and they do not prove the complete business journey.

## Related patterns

- [Consumer-side contract test](/blog/SystemDesign/2026-11-20-pattern-consumer-side-contract-test)
- [Service component test](/blog/SystemDesign/2026-11-20-pattern-service-component-test)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/testing/service-integration-contract-test.html#see-also).

## Verify the behavior

Delete a field used by a deployed consumer, then add a new optional field. Verification should fail the first change and accept the second, assuming the consumer contract allows additive fields.
