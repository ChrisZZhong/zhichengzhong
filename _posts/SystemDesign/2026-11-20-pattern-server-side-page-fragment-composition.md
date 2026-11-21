---
layout: post
title: "Pattern: Server-side page fragment composition"
date: 2026-11-20
description: "Assemble a page on the server from fragments owned by separate capabilities. Define the fragment interface, timeout, and fallback behavior."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/ui/server-side-page-fragment-composition.html"
---

## Context

A page contains components owned by several teams and should arrive as useful HTML. If each fragment blocks the entire response, one optional widget can prevent the reader from seeing otherwise available content.

## Problem

How can the server render one page from independently maintained UI fragments?

## Forces

The page should remain useful under a partial outage. A composition contract needs to cover shared identity and styling alongside fragment deadlines and fallback behavior.

## Solution

Have a server-side page shell assemble independently deployed fragments with a defined interface for identity, caching, and safe markup. Fetch independent fragments concurrently. Set a time budget and decide which slots can be cached, omitted, or deferred.

![Event fragment and Inventory fragment converge at Page renderer.](/system-design-patterns/server-side-page-fragment-composition/diagram)

## Example

A venue page shell assembles event details and an inventory widget before returning HTML. If inventory is slow, the server returns a usable page with that widget deferred.

## Resulting context

Teams can own rendered pieces, and initial HTML can be useful immediately. Fragment latency, CSS consistency, caching, and failure isolation need explicit contracts.

## Related patterns

- [Client-side UI composition](/blog/SystemDesign/2026-11-20-pattern-client-side-ui-composition)
- [API composition](/blog/SystemDesign/2026-11-20-pattern-api-composition)

## Verify the behavior

Make the optional ticket widget fail and render the page with the main event information. Verify that cached content is keyed by the relevant viewer scope and that retrying the widget does not repeat unrelated fragments.
