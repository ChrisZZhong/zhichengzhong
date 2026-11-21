---
layout: post
title: "Pattern: Domain-specific protocol"
date: 2026-11-20
description: "Use an established protocol that matches the interaction’s domain, with an adapter when the rest of the system speaks a different contract."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/communication-style/domain-specific.html"
---

## Context

An existing ecosystem already understands a protocol such as SMTP for mail delivery or HLS for streaming media. Replacing that contract at the external boundary may add an unnecessary translation burden for users and tooling.

## Forces

Existing clients, tools, and interoperability tests favor the native protocol. Gateways may still need to translate authentication, errors, and delivery behavior.

## Solution

Keep domain protocol handling in a thin integration adapter. Normalize outcomes that the application cares about, preserve correlation identifiers across both sides, and apply protocol-specific backoff and deadlines. Avoid leaking low-level response codes throughout the domain model.

![Notification worker to SMTP adapter to Mail gateway.](/system-design-patterns/domain-specific-protocol/diagram)

## Examples

A notification worker chooses SMTP for the mail gateway because the ecosystem already agrees on routing, delivery response codes, and retry semantics.

The reference names mail and media protocols as examples. Use domain-level error handling in the adapter, such as distinguishing a temporary delivery refusal from an invalid address.

## Resulting context

Interoperability improves where the protocol is already understood. Protocol-specific failure modes and version negotiation still need handling at the boundary.

## Related patterns

- [Remote procedure invocation](/blog/SystemDesign/2026-11-20-pattern-remote-procedure-invocation)
- [Anti-corruption layer](/blog/SystemDesign/2026-11-20-pattern-anti-corruption-layer)

## Verify the behavior

Simulate a transient SMTP rejection and a permanent address rejection. The adapter should schedule another attempt only for the transient case, then surface the final delivery status through the organisation's own event or API contract.
