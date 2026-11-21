---
layout: post
title: "Pattern: Log deployments and changes"
date: 2026-11-20
description: "Record deployments, configuration updates, and feature-flag changes as time-stamped operational events. Include the affected service, version, and scope."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/log-deployments-and-changes.html"
---

## Context

An error spike might follow a code release, a configuration rollout, or an operational toggle. Without a separate change timeline, operators waste time guessing which happened first.

## Problem

How can an incident timeline show which releases and configuration changes preceded a regression?

## Forces

Code, flags, and configuration may all change within minutes. A durable change record needs an environment, timestamp, affected component, and version or change ID.

## Solution

Have deployment and configuration systems emit structured change events with service, environment, old and new versions, time, and scope. Show these alongside reliability metrics and trace data. Record a rollback as a new event so the timeline reflects what actually happened.

![Deploy or config change to Change event to Incident timeline.](/system-design-patterns/log-deployments-and-changes/diagram)

## Examples

A deployment pipeline can emit a versioned event when it shifts traffic. Plot that event on the same timeline as the service's error and latency metrics so an on-call engineer can quickly investigate a correlation.

An error-rate chart is annotated with a 10% canary and a later configuration change. The team compares both events with the start of the regression.

The reference's deployment tool emits a change signal that can be shown alongside time series. A typed deployment event gives the on-call engineer the release, region, and affected rollout cohort.

## Resulting Context

Change history narrows an incident investigation. Temporal correlation is a clue, so verify it with traces, metrics, or a controlled rollback.

## Related patterns

- [Application metrics](/blog/SystemDesign/2026-11-20-pattern-application-metrics)
- [Externalized configuration](/blog/SystemDesign/2026-11-20-pattern-externalized-configuration)
- [Exception tracking](/blog/SystemDesign/2026-11-20-pattern-exception-tracking)

## Verify the behavior

Trigger a canary and a configuration rollback and compare timestamps with a test metric. A dashboard should distinguish the affected cohort and version rather than treating a cluster-wide metric as proof of causality.
