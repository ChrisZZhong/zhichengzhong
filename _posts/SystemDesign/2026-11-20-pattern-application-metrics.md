---
layout: post
title: "Pattern: Application metrics"
date: 2026-11-20
description: "Record counters, gauges, and distributions for meaningful behavior. Aggregate across replicas and alert on symptoms users can experience."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/application-metrics.html"
---

## Context

Instance logs are too detailed to show whether a change raised user-visible latency across the fleet. Operations needs consistent time series for request behavior and capacity.

## Problem

How can the team detect changing behavior across a fleet while it is still happening?

## Forces

Instrumentation is part of the request path. The number of time series and cost per observation both need to stay within a budget.

## Solution

Collect per-route request rate, error ratio, useful latency distributions, and saturation signals. Aggregate by dimensions such as service, region, or release, and use a cardinality budget for labels. Use a histogram for quantiles when merging samples across instances.

![Service signals to Metric aggregation to Dashboard and alerts.](/system-design-patterns/application-metrics/diagram)

## Examples

Applications can record counters and histograms through Prometheus client libraries. A collector turns measurements from many instances into rates and latency distributions so operators can compare a release across the fleet.

For booking traffic, chart request rate, error ratio, latency percentiles, and pending work. Keep labels bounded to useful dimensions such as route and region.

The source discusses client-side instrumentation and collection as two jobs. For example, an application can emit metrics using a Prometheus client library and have Prometheus scrape and aggregate them.

## Resulting context

Metrics expose trends cheaply compared with raw events. Bad aggregation can hide tails, and unbounded labels can make the telemetry system itself expensive.

## Related patterns

- [Distributed tracing](/blog/SystemDesign/2026-11-20-pattern-distributed-tracing)
- [Health check API](/blog/SystemDesign/2026-11-20-pattern-health-check-api)

## Verify the behavior

Generate a small amount of sustained slow traffic and check whether a percentile or error-budget alert responds. Inspect whether the metric still works after restarting replicas and whether labels remain bounded during unusual requests.
