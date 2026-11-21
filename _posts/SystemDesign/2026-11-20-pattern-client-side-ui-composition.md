---
layout: post
title: "Pattern: Client-side UI composition"
date: 2026-11-20
description: "A browser shell loads and assembles independently owned interface modules. Agree on navigation, shared state, and isolation between modules."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/ui/client-side-ui-composition.html"
---

## Context

Teams need to ship pieces of the same interface independently. The browser shell must still give users consistent navigation, identity, focus, and error recovery.

## Problem

How can separately owned UI fragments form one screen in the browser?

## Forces

Independent releases need a small contract for layout, navigation, and UI events. The client still has to pay for each fragment's network requests and JavaScript.

## Solution

Define how the shell loads modules, shares styles and platform libraries, and passes stable identifiers. Give each module an error boundary or equivalent isolation. Treat shared shell events and route contracts as documented interfaces.

![Catalog module and Ticket module converge at Browser shell.](/system-design-patterns/client-side-ui-composition/diagram)

## Example

The event page shows a catalog panel and a ticket widget from different teams. The shell passes an event ID and can show a fallback if one module fails.

## Resulting context

Teams can update their interfaces independently. Additional downloads, dependency compatibility, and inconsistent styles or focus behavior can hurt the experience.

## Related patterns

- [Server-side page fragment composition](/blog/SystemDesign/2026-11-20-pattern-server-side-page-fragment-composition)
- [Backend for frontend](/blog/SystemDesign/2026-11-20-pattern-backend-for-frontend)

## Verify the behavior

Serve a broken new module while leaving the others healthy. Check that the shell remains navigable, preserves the current selection, and offers a useful recovery route. Watch bundle size and version conflicts with a real network budget.
