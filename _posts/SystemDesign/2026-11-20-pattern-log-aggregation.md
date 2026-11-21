---
layout: post
title: "Pattern: Log aggregation"
date: 2026-11-20
description: "Ship structured logs from workloads to a centralized query system. Include stable service identifiers and trace context when available."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/application-logging.html"
---

## Context

Instances are ephemeral and a single request can be handled by multiple services. Local logs disappear with machines and cannot be searched together during an incident.

## Problem

How can engineers search the logs of a service whose instances keep changing?

## Forces

Collection should keep application overhead low and tolerate destination outages. A consistent schema and a request or trace identifier let investigators join events across hosts.

## Solution

Emit structured logs with service, deployment, and correlation fields. Collect them asynchronously into a central index. Apply sampling where appropriate, access controls, retention, and redaction before export. Monitor backlog or dropping at the collector.

![Reservation logs and Payment logs converge at Central log search.](/system-design-patterns/log-aggregation/diagram)

## Examples

CloudWatch Logs is the reference's managed example. A host agent or runtime integration forwards service output to log groups; centralized queries can combine records by service, environment, and the affected request.

A support engineer filters reservation errors by service, deployment, and trace ID instead of signing into individual hosts.

The reference cites AWS CloudWatch as an example of a centralized log destination. The pattern also applies when agents export structured events into a self-managed search index.

## Resulting Context

Search spans machines and deployments. Control ingestion volume, redact sensitive fields before export, and make retention and access visible.

## Related patterns

- [Distributed tracing](/blog/SystemDesign/2026-11-20-pattern-distributed-tracing)
- [Audit logging](/blog/SystemDesign/2026-11-20-pattern-audit-logging)
- [Log deployments and changes](/blog/SystemDesign/2026-11-20-pattern-log-deployments-and-changes)

## Verify the behavior

Send one request through several services and query its trace or correlation ID. Make ingestion unavailable briefly and verify log buffering cannot cause the application to exhaust storage or block its request path.
