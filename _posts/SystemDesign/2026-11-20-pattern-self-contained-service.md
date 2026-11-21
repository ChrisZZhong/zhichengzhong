---
layout: post
title: "Self-contained service"
date: 2026-11-20
description: "Arrange the synchronous request path so the service can make its decision with local information. Prepare a replica or accept work for asynchronous completion when needed."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/decomposition/self-contained-service.html"
---

## Context

A user-facing command needs information owned by another service. A synchronous call introduces another deadline, another failure mode, and an availability dependency on each request.

![The synchronous order path waits for several downstream services.](https://microservices.io/i/Order-Service-synchronous.png)

![Services continue the order workflow through asynchronous messages.](https://microservices.io/i/Order-Service-asynchronous.png)

## Problem

How can a service answer a synchronous request without waiting on another service?

## Forces

The request may require information owned by different subdomains, yet its user-facing latency and availability targets are shared. Let freshness and ownership rules determine which data can be local.

## Solution

Define the minimum decision data required at request time. Import it as a versioned view, move the decision to the owner, or accept an asynchronous workflow. For stale replicas, define a maximum age and the conservative response when that age is exceeded.

![The service uses local data to complete the synchronous response.](https://microservices.io/i/SelfContainedService.png)

## Example

FTGO's order service can perform synchronous menu validation with a local replica of data from the restaurant service. The order workflow can then coordinate later steps through asynchronous messages.

An appointment service evaluates eligibility against its local policy view. A background subscription updates the policy view when the source publishes changes.

FTGO's order flow in the reference validates and prices an order using a local replica of restaurant information. The service can answer the command without requiring the restaurant service to handle a synchronous read.

## Resulting Context

The request can finish through a remote outage, within the bounds of the local data. Decide how old data may be and what behavior is safe when the view is behind.

## Related patterns

- [Command-side replica](/blog/SystemDesign/2026-11-20-pattern-command-side-replica)
- [Messaging](/blog/SystemDesign/2026-11-20-pattern-messaging)

## Verify the behavior

Disable the upstream provider after the local view catches up. Check which commands remain safe to accept and whether commands that require current data become pending or fail clearly when the freshness limit is exceeded.
