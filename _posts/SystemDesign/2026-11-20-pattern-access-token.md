---
layout: post
title: "Pattern: Access token"
date: 2026-11-20
description: "Send a scoped credential with requests to a resource server. The receiver verifies or introspects it and enforces audience, expiry, scope, and resource ownership."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/security/access-token.html"
---

## Context

One client request may reach several services through an edge gateway. Each service needs a trusted identity and enough permission information to decide whether that operation is allowed.

## Problem

How can a downstream API establish both who is making a request and what that caller may do?

## Forces

The gateway sees the outside credentials, but the service still owns the permission check against its resources. Tokens must cross trust boundaries with a narrow audience and a manageable lifetime.

## Solution

Pass a token whose audience and scope match the target service. Validate the signature or introspection result and time bounds before applying resource-level authorization. Keep tokens out of URLs and logs, and prefer narrower downstream credentials over forwarding a broad external token by default.

![Authorization server to Scoped token to Resource API.](/system-design-patterns/access-token/diagram)

## Example

The reference uses JWT as a concrete token format. A service can check the signature against trusted keys and validate issuer, audience, expiry, and permissions without receiving the user's password. Opaque reference tokens can support the same boundary through introspection.

A booking client presents a token for the Reservations API. The API checks that it was issued for Reservations and that the caller may modify the stated booking.

## Resulting context

Services can make consistent identity decisions with bounded credentials. Limit lifetime and scope, define revocation behavior, and keep tokens out of telemetry and URLs.

## Related patterns

- [API gateway](/blog/SystemDesign/2026-11-20-pattern-api-gateway)
- [Service mesh](/blog/SystemDesign/2026-11-20-pattern-service-mesh)
- [Audit logging](/blog/SystemDesign/2026-11-20-pattern-audit-logging)

## Verify the behavior

Send a valid token for a different audience and a token missing the scope. Both requests must be denied. Then test an authenticated caller with the right scope who does not own the target booking.
