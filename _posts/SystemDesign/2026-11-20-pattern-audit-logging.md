---
layout: post
title: "Pattern: Audit logging"
date: 2026-11-20
description: "Keep a controlled record of security- or business-sensitive actions. Capture actor, action, target, time, and result with appropriate access rules."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/observability/audit-logging.html"
---

## Context

Operational logs record failures and debugging detail. A team also needs a reliable history of deliberate business or administrative actions that can answer who changed what and why.

## Problem

How can operators reconstruct a particular user's actions after a support or security incident?

## Forces

The record needs a reliable actor identity, timestamp, and target. Permissions and retention should reflect the sensitivity of the action history.

## Solution

Record actor identity, target, operation, timestamp, result, and a correlation ID. Decide whether a mandatory audit record must commit with the business change or be relayed durably afterward. Restrict read and write access and set a retention policy.

![Administrative action to Audit record to Restricted audit store.](/system-design-patterns/audit-logging/diagram)

## Examples

A support team can answer who released a reservation and when from an audit trail. A compliance reviewer may need to retain that same record independently of the service's short-lived debug logs.

An administrative seat release writes a restricted audit record containing the actor and reservation ID. Operators can review it without seeing the user’s private payment data.

## Resulting Context

Audit history supports investigation and accountability. Design for retention, authorized access, and integrity, and avoid capturing extra sensitive payloads.

## Related patterns

- [Log aggregation](/blog/SystemDesign/2026-11-20-pattern-log-aggregation)
- [Access token](/blog/SystemDesign/2026-11-20-pattern-access-token)

## Verify the behavior

Perform a successful sensitive action and a denied attempt. Confirm the audit records show the correct outcomes, can be traced to the request, and exclude private fields that the review does not require.
