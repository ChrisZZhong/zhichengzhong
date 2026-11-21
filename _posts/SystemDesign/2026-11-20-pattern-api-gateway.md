---
layout: post
title: "Pattern: API Gateway / Backends for Frontends"
date: 2026-11-20
description: "Provide a stable public entry point that routes to internal services and applies shared edge policies. Compose responses where the public contract needs several services."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/apigateway.html"
---

## Context

A public client would otherwise need to know the addresses and contracts of several internal services. Common edge controls such as access checks, routing, and abuse limits should be applied consistently.

## Problem

What should clients call for a screen whose data and actions span multiple services?

## Forces

The web product page, native app, and partner integration may all need different fields. Service endpoints may move or be split, while frequent client round trips add visible latency over mobile networks.

## Solution

Expose stable public routes. Forward simple requests directly, and compose data for an endpoint when a bounded cross-service query is part of its contract. Gate public access at the edge while retaining resource-level decisions inside the service that owns the data.

![Clients enter through one gateway, which forwards calls to the owning services.](https://microservices.io/i/apigateway.jpg)

## Variation: Backends for frontends

Give web, mobile, and public partners separate gateways when their contracts diverge enough to create release contention. Keep service discovery and access policy consistent while each gateway shapes its own API. [Backends for Frontends](/blog/SystemDesign/2026-11-20-pattern-backend-for-frontend).

![Separate gateways serve the browser, mobile app, and external clients.](https://microservices.io/i/bffe.png)

## Examples

A ticketing gateway verifies tokens and routes searches to Catalog and purchases to Reservations. Private service names stay behind the edge.

The reference points to a Money Transfer gateway and to an implementation using Spring Cloud Gateway. An edge router is useful even if only a few routes need aggregate responses.

## Resulting context

Clients use a simpler entry point. Keep business decisions in their owning services, and treat gateway overload, latency, and rollout as shared risks.

## Related patterns

- [Backend for frontend](/blog/SystemDesign/2026-11-20-pattern-backend-for-frontend)
- [API composition](/blog/SystemDesign/2026-11-20-pattern-api-composition)
- [Access token](/blog/SystemDesign/2026-11-20-pattern-access-token)

## Known uses

The reference points to Netflix's edge API as an example of adapting common backend services for different consumers.

## Example application

The FTGO case study uses Spring Cloud Gateway. Follow a request from its external route through the gateway to the service that owns the operation. [Source example application](https://microservices.io/patterns/apigateway.html#example-application).

## Verify the behavior

Test a token that is valid for one route and unauthorized for another. Change an internal service address or rollout and verify the public API contract still works. Exercise rate limits and ensure one slow backend cannot starve unrelated routes.
