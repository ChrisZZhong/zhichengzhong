---
layout: post
title: "Pattern: Externalized configuration"
date: 2026-11-20
description: "Provide environment-specific settings at deployment or runtime. Keep artifacts portable, validate values, and retrieve secrets through an appropriate secret store."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/externalized-configuration.html"
---

## Context

An identical application package needs different queue locations and timeouts in staging and production. Rebuilding for every setting change makes provenance and rollback harder.

## Problem

How can one tested build use different service addresses, credentials, and settings in each environment?

## Forces

The artifact should be reusable across deployments. Typed validation and a rule for configuration precedence make behavior diagnosable when files, environment settings, and overrides coexist.

## Solution

Inject settings at deployment or startup, validate them before readiness, and record where each value came from without disclosing secrets. Use a secret manager or a permitted secret mount for credentials. Separate static startup settings from values explicitly designed to reload.

![Environment settings to Validated config to Service runtime.](/system-design-patterns/externalized-configuration/diagram)

## Examples

Spring Boot can bind deployment values from property files, environment variables, and command-line arguments. A team can use one immutable image for all environments and supply only deployment-specific values outside it.

The same booking image runs in staging and production with different queue endpoints and credentials. Startup fails clearly if a required setting is absent.

The source's registration example injects the account service URL from configuration. The same registration binary can therefore point to another backend when it is deployed elsewhere.

### Spring configuration example

With Spring Boot, bind an externally supplied service URL and timeout to validated application settings. The URL is required, while the example permits a default timeout. Inject settings into the process at deployment time.

```yaml
registration:
  accounts-base-url: "${ACCOUNTS_BASE_URL}"
  connect-timeout: "${ACCOUNTS_CONNECT_TIMEOUT:250ms}"
```

```bash
ACCOUNTS_BASE_URL=https://accounts.staging.example.test \
  ACCOUNTS_CONNECT_TIMEOUT=350ms java -jar registration.jar
```

The application's configuration binding should reject missing URLs and invalid or out-of-range timeouts before marking itself ready. Use a secret store for credentials and avoid printing resolved secret values.

## Resulting Context

Promotion does not require rebuilding binaries. Configuration can drift or change outside code review, so track sources, versions, access, and rollout behavior.

## Related patterns

- [Microservice chassis](/blog/SystemDesign/2026-11-20-pattern-microservice-chassis)
- [Service template](/blog/SystemDesign/2026-11-20-pattern-service-template)
- [Log deployments and changes](/blog/SystemDesign/2026-11-20-pattern-log-deployments-and-changes)

## Verify the behavior

Run the same artifact with two configurations. Missing required values should produce a clear startup error. Roll back a valid configuration change without rebuilding the artifact and verify startup logs omit secret values.
