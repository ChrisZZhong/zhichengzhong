---
layout: post
title: "Pattern: Decompose by subdomain"
date: 2026-11-20
description: "Use domain language, rules, and invariants to decide where models should be independent. Translate data explicitly where the meaning changes between contexts."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/decomposition/decompose-by-subdomain.html"
---

The same term can have incompatible rules in different parts of a product. A shared schema makes one team's terminology or invariants leak into the other team's model.

![The source's diagram connects the factors that support independent delivery.](https://microservices.io/i/successtriangle.png)

Which parts of the problem space need separate models and owners?

## Solution

Ask domain experts what decisions they make, what terms they use, and where those terms change meaning. Record bounded contexts and translate at their edges. Prioritize the core subdomain for bespoke modelling and evaluate existing solutions for supporting or generic ones.

## Examples

A store can model a product independently for merchandising and fulfilment. Merchandising cares about listings and availability dates. Fulfilment cares about handling, location, and the package that can actually ship.

A parcel means a promise and delivery window to scheduling, but means weight and dimensions to routing. Each subdomain models the parcel for its own decisions.

The source classifies the responsibilities of a store using DDD subdomains. The catalogue model can focus on product descriptions, while inventory tracks physical quantities and fulfilment tracks a shipment.

![Example store services organized around subdomains.](https://microservices.io/i/decompose-by-subdomain.png)

## Resulting Context

Separate models prevent one vocabulary from dominating everything. Translation becomes part of the contract, and a subdomain may still share a deployment if independence buys little.

## Issues

Test candidate boundaries with domain experts and real change requests. Boundaries that repeatedly disagree about vocabulary or ownership deserve another modeling pass. A subdomain can begin as a module and earn a service only when separate delivery helps.

## Related patterns

- [Aggregate](/blog/SystemDesign/2026-11-20-pattern-aggregate)
- [Anti-corruption layer](/blog/SystemDesign/2026-11-20-pattern-anti-corruption-layer)

## Verify the behavior

Walk one lifecycle through both contexts. Confirm that scheduling can change a promise without editing routing's geometric model and that a translation failure leads to an observable error rather than an incorrect silent default.
