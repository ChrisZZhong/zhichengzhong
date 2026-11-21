---
layout: post
title: "Pattern: Service Template"
date: 2026-11-20
description: "Start a new service from a maintained project scaffold. Include the build, deployment, configuration, health, and basic test setup."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/service-template.html"
---

## Context

Teams spend time repeating repository scaffolding before writing any service-specific logic. A template can give a consistent first build without committing every service to a permanent framework.

![Services reuse shared build logic and supporting libraries through a chassis.](https://microservices.io/i/patterns/microservice-template-and-chassis/Microservice_chassis.png)

## Problem

How can developers start writing business logic within a working, deployable service repository?

## Forces

The scaffold must expose useful defaults for tests, packaging, configuration, and telemetry. Once copied, service-specific changes and fixes to the template can diverge.

## Solution

Include a health endpoint, a small integration test, a build and release workflow, and configuration placeholders. Make service name and ownership explicit inputs. Keep things that need fleet-wide upgrades in managed dependencies or platform configuration.

![A starter codebase supplies defaults for new services.](https://microservices.io/i/patterns/microservice-template-and-chassis/Service_template.png)

## Example

A team scaffolds its new Catalog API with a CI pipeline, a container image, and a working example endpoint with tracing.

## Resulting context

Teams start with a useful baseline. Copied files do not update by themselves, so keep reusable behavior in versioned libraries where feasible.

## Related patterns

- [Microservice chassis](/blog/SystemDesign/2026-11-20-pattern-microservice-chassis)
- [Service deployment platform](/blog/SystemDesign/2026-11-20-pattern-service-deployment-platform)

## See also

[Related references on Microservices.io](https://microservices.io/patterns/service-template.html#see-also).

## Learn more

[Long-form resources and implementations on Microservices.io](https://microservices.io/patterns/service-template.html#learn-more).

## Verify the behavior

Create a new service with the template on a clean checkout and run its tests and first deployment. Then upgrade a shared capability separately and check that existing services don't require manual comparison with copied template files.
