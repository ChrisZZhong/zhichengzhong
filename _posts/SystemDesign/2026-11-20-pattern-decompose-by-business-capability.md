---
layout: post
title: "Pattern: Decompose by business capability"
date: 2026-11-20
description: "Start with durable business outcomes and assign the behavior, rules, and data that deliver each one to a boundary."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/decomposition/decompose-by-business-capability.html"
---

A service split by technical layer can turn every feature into a coordinated update to separate UI, data, and workflow teams. Capability mapping asks which business result a team should be able to change independently.

![The source's diagram connects the factors that support independent delivery.](https://microservices.io/i/successtriangle.png)

Which enduring business responsibilities provide useful service boundaries?

## Solution

List business outcomes such as maintaining the catalog, reserving inventory, or fulfilling a delivery. Identify the rules and source records required for each outcome. Trace main user journeys across those capabilities and place coordination behind explicit interfaces.

## Examples

In a store, catalog management maintains what can be sold, inventory controls what is in stock, and order management accepts a purchase. Fulfilment owns how an accepted purchase reaches the customer.

A rental platform separates fleet availability from customer billing. Each capability covers its complete workflow, from validation through persistence.

The source uses an online store to illustrate separate catalog, inventory, ordering, and delivery responsibilities. A service boundary here follows an enduring business function even when implementation technology changes.

![Example store services organized around business capabilities.](https://microservices.io/i/decompose-by-business-capability.png)

## Resulting Context

Capability boundaries survive technology changes. Workflows that keep changing the same records across two capabilities can reveal a misplaced boundary.

## Issues

Business capabilities rarely line up perfectly with the current reporting chart. Compare department responsibilities with business workflows and the decisions people repeatedly make. A capability can also contain smaller ones that need to stay together initially.

## Related patterns

- [Decompose by subdomain](/blog/SystemDesign/2026-11-20-pattern-decompose-by-subdomain)
- [Service per team](/blog/SystemDesign/2026-11-20-pattern-service-per-team)

## Verify the behavior

Take three recent feature requests. A warehouse policy change should mostly stay inside inventory. A checkout change requiring a new method in every service is evidence to revisit the split or create a stable feedback contract.
