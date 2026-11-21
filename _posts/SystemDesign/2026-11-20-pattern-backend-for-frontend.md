---
layout: post
title: "Pattern: Backends for Frontends"
date: 2026-11-20
description: "Let a client team own a backend that adapts shared service contracts to its interface and interaction model."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/apigateway.html#variation-backends-for-frontends"
---

## Context

A mobile app and a desktop app consume the same booking system but need different payloads and request timing. Putting every variant into the core services can make release coordination worse.

## Problem

How can each frontend evolve its API without making the shared edge change with every screen?

## Forces

Browser, native, and partner workloads have different request budgets and release cadences. Splitting the gateways adds deployments, plus a need for consistent access policy.

## Solution

Let each client backend tailor the view and coordinate the necessary downstream calls. Place shared domain decisions behind service contracts. Keep common edge security in a shared gateway or library and version each client contract for independently deployed app versions.

![Clients enter through one gateway, which forwards calls to the owning services.](https://microservices.io/i/apigateway.jpg)

## Variation: Backends for frontends

Give the browser, mobile app, and partner API dedicated edge deployments. The browser gateway can assemble a rich view in one request, the mobile gateway can return a smaller feed, and the partner gateway can expose its own versioned contract.

![Separate gateways serve the browser, mobile app, and external clients.](https://microservices.io/i/bffe.png)

## Examples

A mobile BFF returns one compact booking summary to save round trips. The web BFF can fetch more detailed venue and reporting data without changing the mobile response.

The reference extends the gateway example to native, web, and other clients with different interfaces. In the BFF design each client gets its own response contract, while the underlying services can still be shared.

## Resulting context

Client-specific releases can move independently. Common authorization and domain rules need clear shared ownership to avoid divergence across BFFs.

## Related patterns

- [API gateway](/blog/SystemDesign/2026-11-20-pattern-api-gateway)
- [Client-side UI composition](/blog/SystemDesign/2026-11-20-pattern-client-side-ui-composition)
- [API composition](/blog/SystemDesign/2026-11-20-pattern-api-composition)

## Known uses

The reference's edge design examples illustrate another option, a shared gateway with adapters per client. Separate gateways are worth considering when adapters themselves need independent ownership and deployment.

## Example application

The Spring Cloud Gateway reference shows route selection and request filters. In a BFF arrangement, deploy and version equivalent route definitions with each frontend's boundary. [Source example application](https://microservices.io/patterns/apigateway.html#example-application).

## Verify the behavior

Measure how many round trips a mobile screen makes and compare them before and after the BFF. Deploy an additive web-only response change and verify an older mobile app still sees its expected payload and permissions.
