---
layout: post
title: "Pattern: Anti-corruption layer"
date: 2026-11-20
description: "Translate across models in an adapter that sits at the boundary. Map identifiers, states, and failures into meanings the receiving domain can use."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/refactoring/anti-corruption-layer.html"
---

## Context

A new service consumes an existing system whose identifiers, lifecycle states, and failures encode different rules. Translating in every caller spreads legacy details and creates inconsistent behaviours.

## Problem

How can new code use a legacy capability without adopting its data model?

## Forces

A legacy field can appear to match the new model while encoding different lifecycle rules. The boundary must handle missing values, incompatible states, and failures even as the old system evolves.

## Solution

Put translation beside the boundary. Map wire values into typed domain concepts, preserve the upstream identifier where reconciliation needs it, and surface unknown states as explicit errors. Add unit fixtures for both systems' representations.

![Fulfilment model to Translation adapter to Legacy shipping API.](/system-design-patterns/anti-corruption-layer/diagram)

## Examples

A migration may need bidirectional translation. When the new fulfilment service sends a cancellation back to the legacy application, the adapter translates the new command into the legacy operation and maps the reply into the new domain's error vocabulary.

A fulfilment adapter converts a legacy single-letter status into a shipment state and rejects unmapped values instead of passing them into the new model.

## Resulting context

The adapter confines legacy assumptions and can be tested independently. It adds a maintained contract, especially when either side changes the meaning of an existing field.

## Related patterns

- [Strangler application](/blog/SystemDesign/2026-11-20-pattern-strangler-application)
- [Decompose by subdomain](/blog/SystemDesign/2026-11-20-pattern-decompose-by-subdomain)

## Verify the behavior

Feed the adapter an unknown status, an old payload missing a field, and a timeout. Verify that each outcome is classified consistently and that trace logs contain enough correlation data to investigate without exposing the whole payload.
