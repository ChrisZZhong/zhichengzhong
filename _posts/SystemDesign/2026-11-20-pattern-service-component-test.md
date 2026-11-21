---
layout: post
title: "Pattern: Service Component Test"
date: 2026-11-20
description: "Start a service as a unit and drive it through its public API or event boundary. Substitute controllable implementations for remote dependencies."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/testing/service-component-test.html"
---

## Context

Unit tests miss errors at the API, persistence, and message boundaries. End-to-end checks for every scenario are slow and difficult to isolate.

## Problem

How can tests exercise a service as a deployable component without provisioning every neighbor?

## Forces

Unit tests miss wiring and persistence behavior. Full end-to-end tests cost more to set up and fail for more reasons, so doubles should represent the dependencies at their external boundaries.

## Solution

Start the service using production wiring where practical, including its schema migrations and serializers. Provide controlled doubles for network dependencies and use a disposable database when persistence behaviour matters. Exercise the public interface and inspect durable results.

![Test request to Service under test branches to Test database and Payment double.](/system-design-patterns/service-component-test/diagram)

## Examples

A dependency stub can reproduce a payment timeout while running the service and its persistence layer normally. A contract library such as Spring Cloud Contract supplies verified HTTP responses for the dependency boundary.

Start Reservations with a real test database and a simulated payment adapter. Send a request and verify its saved state and outbox entry.

The source cites Spring Cloud Contract as a tool that can provide controlled service doubles. The component test still exercises the service's own handler, persistence, and outgoing contract.

## Resulting context

These tests exercise behavior across internal layers and can simulate rare failures. Doubles can miss production behavior, so pair them with contracts and selected integration tests.

## Related patterns

- [Consumer-driven contract test](/blog/SystemDesign/2026-11-20-pattern-consumer-driven-contract-test)
- [Consumer-side contract test](/blog/SystemDesign/2026-11-20-pattern-consumer-side-contract-test)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/testing/service-component-test.html#see-also).

## Verify the behavior

Cause a dependency timeout and confirm the service records the expected business state and publishes no uncommitted event. Run a narrower integration check with the real dependency to cover gaps in the double.
