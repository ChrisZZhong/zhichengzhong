---
layout: post
title: "Pattern: Service Integration Contract Test (Consumer-side)"
date: 2026-11-20
description: "Exercise the consumer’s adapter against a verified contract stub to check how it sends requests and interprets success and failure responses."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/testing/service-integration-contract-test.html#examples"
---

## Context

A client needs to prove that its adapter serializes requests and interprets provider results correctly without talking to a shared server during every build.

## Problem

How can a consumer test the way its adapter speaks to another service without running the whole system?

## Forces

A local stub gives predictable, fast tests. The stub must be derived from expectations verified against the provider or it can drift even while the client build passes.

## Solution

Run the actual client against a stub derived from a provider-verified contract. Test success, a representative business error, and malformed or missing fields that the client is expected to handle. Keep contract versions and stub versions linked.

![Consumer adapter to Verified stub to Client assertions.](/system-design-patterns/consumer-side-contract-test/diagram)

## Examples

Run the real HTTP adapter against a stub generated from a verified Spring Cloud Contract artifact. A malformed request or an incorrectly decoded response then fails at the boundary the consumer actually uses.

The booking client test invokes its actual Pricing adapter against a stub and asserts that an unavailable-item response becomes the right application error.

The reference index sends this topic to the service integration contract test page. The consumer-side example here isolates the client adapter, while the companion article covers verifying that contract against the real provider.

## Resulting context

Tests run quickly without shared environments. The stub must stay aligned with the provider, which is why provider-side verification complements this test.

## Related patterns

- [Consumer-driven contract test](/blog/SystemDesign/2026-11-20-pattern-consumer-driven-contract-test)
- [Service component test](/blog/SystemDesign/2026-11-20-pattern-service-component-test)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/testing/service-integration-contract-test.html#see-also).

## Verify the behavior

Break request serialization and see that the test fails before deployment. Compare the stub's response contract against a provider verification run so success against a stale stub does not hide incompatibility.
