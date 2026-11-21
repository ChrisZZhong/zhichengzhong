---
layout: post
title: "Pattern: Transaction log tailing"
date: 2026-11-20
description: "Read committed changes from a database change stream or replication log. Store an offset or position so the relay can resume after a restart."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/data/transaction-log-tailing.html"
---

## Context

The outbox is reliable only if a relay can reliably observe new inserts and resume after failure. Reading the database change stream can give low-delay delivery without querying the outbox repeatedly.

## Problem

How can a publisher obtain committed outbox records without repeatedly scanning for new rows?

## Forces

The log preserves database commit order at its own scope. The connector needs access to retained history and a durable cursor from which it can resume.

## Solution

Subscribe to committed outbox inserts and transform the declared payload into broker records. Persist the connector position, retain the log long enough to recover, and define how a snapshot interacts with live reads. Use the aggregate key when ordering between updates to the same entity matters.

![A relay reads committed outbox changes from the database transaction log.](https://microservices.io/i/patterns/data/TransactionLogMining.png)

## Example

Eventuate Tram demonstrates a log-based relay. A connector reads insert events for the outbox, saves its position, and resumes after a restart. It publishes the event ID unchanged so recipients can recognize a resend.

A CDC connector observes committed inserts to the outbox table and publishes the declared event payload to a topic. Initial snapshots and restarts are tested for replay.

The source cites Eventuate Tram as a relay that can observe database changes. The operational test is whether it can recover from an offset and continue reading committed changes.

## Resulting context

Log-based delivery can avoid repeated table scans and cut delay. It needs database permissions, enough log retention, compatible schema changes, and operational visibility into lag.

## Related patterns

- [Transactional outbox](/blog/SystemDesign/2026-11-20-pattern-transactional-outbox)
- [Polling publisher](/blog/SystemDesign/2026-11-20-pattern-polling-publisher)

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/data/transaction-log-tailing.html#learn-more).

## Verify the behavior

Stop the connector, commit several known events, then resume. Compare the published event IDs with the outbox. Test the behavior when a connector offset is lost or the required database log position has expired.
