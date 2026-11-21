---
layout: post
title: "Service per team"
date: 2026-11-20
description: "Choose boundaries that a team can build, release, and support end to end. Keep changes that routinely need coordination within a service the team can own."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/decomposition/service-per-team.html"
---

## Context

Teams spend time coordinating releases because nobody owns the full route from a requirement to an incident. Look for service boundaries that support one coherent set of decisions and on-call duties.

## Problem

How can team ownership influence the number and shape of service boundaries?

## Forces

A team needs enough ownership to develop, deploy, and operate independently within its cognitive capacity. Several fine-grained services may impose more overhead than a cohesive larger service.

## Solution

Give a team the API contract, data migrations, deployment, and operational dashboards for a capability. Use shared platform tools for infrastructure while keeping business decisions in the owning team. Review code and change coupling before splitting a service to distribute work.

![A team owns the service and the subdomains packaged with it.](https://microservices.io/i/ServicePerTeam.png)

## Example

The capacity team owns both the rules that reserve seats and the reservation API. Other teams use that contract instead of editing the reservation tables.

## Resulting context

One team can act on production feedback quickly. If the workload or code grows beyond that team’s capacity, revisit the boundary and the on-call responsibilities together.

## Related patterns

- [Decompose by business capability](/blog/SystemDesign/2026-11-20-pattern-decompose-by-business-capability)
- [Microservice architecture](/blog/SystemDesign/2026-11-20-pattern-microservice-architecture)

## Verify the behavior

Follow one production change and one incident backwards to their owners. If both require several teams to locate the person with authority to decide, revisit ownership or the service contract.
