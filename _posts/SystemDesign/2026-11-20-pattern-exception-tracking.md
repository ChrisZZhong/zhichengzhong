---
layout: post
title: "Pattern: Exception tracking"
date: 2026-11-20
description: "Collect errors with runtime context and group similar failures into issues. Route changes in frequency or newly introduced failures to the responsible team."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/exception-tracking.html"
---

## Context

A regression can emit thousands of similar stack traces, hiding the first deployment or operation that introduced it. Operators need an issue view with enough context to identify the change.

## Problem

How can maintainers identify and prioritize recurring failures from many service instances?

## Solution

Send classified exceptions with service, release, operation, and a trace ID. Group by normalized exception type and relevant stack frames, then notify the owning team for new issues or meaningful frequency changes. Exclude secrets from payload and context fields.

![Runtime exception to Group signatures to Issue and owner.](/system-design-patterns/exception-tracking/diagram)

## Example

An event parser regression triggers one issue grouped by exception and stack location. Release attributes show that it began with the latest worker rollout.

## Resulting Context

Grouping turns repeated errors into actionable signals. Filter expected exceptions and scrub context so alerts stay useful and private data does not leak.

## Related patterns

- [Log aggregation](/blog/SystemDesign/2026-11-20-pattern-log-aggregation)
- [Log deployments and changes](/blog/SystemDesign/2026-11-20-pattern-log-deployments-and-changes)

## Verify the behavior

Introduce the same exception on two replicas. It should group into one issue with multiple occurrences. Deploy a new version and verify its release metadata makes the start and disappearance of the issue visible.
