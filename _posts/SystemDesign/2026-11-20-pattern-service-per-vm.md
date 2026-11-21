---
layout: post
title: "Pattern: Service Instance per VM"
date: 2026-11-20
description: "Package a service with its guest OS and boot one instance per virtual machine. Roll out changes by replacing instances from a versioned image."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/deployment/service-per-vm.html"
---

## Context

A workload needs a separate operating system image or guest-kernel isolation, while the platform needs to run several workloads on physical hardware.

## Problem

When should a service instance run in its own virtual machine?

## Forces

A dedicated guest kernel and OS configuration give stronger runtime separation and consistent images. Startup time, operating-system updates, and memory overhead affect scale and cost.

## Solution

Bake a versioned guest image with the service and its required runtime. Provision instances from the image, expose readiness to the load balancer, and replace rather than mutate existing VMs during deployments.

![Versioned VM image to Guest OS to Billing instance.](/system-design-patterns/service-per-vm/diagram)

## Examples

Create a versioned machine image, such as an Amazon EC2 AMI, and start each instance from it. Replacing the image on rollout keeps the guest OS and application packages reproducible together.

A billing workload that needs a hardened OS image gets its own VM. Blue-green deployment starts a new VM set and shifts traffic after readiness checks.

The source points to Netflix-style deployments using versioned machine images. The VM image is the artifact to roll forward or back, with application data managed separately when replicas are replaceable.

## Resulting context

Separate guest kernels provide a useful isolation boundary. Image maintenance, startup, and memory overhead are typically greater than with containers.

## Related patterns

- [Service instance per host](/blog/SystemDesign/2026-11-20-pattern-single-service-per-host)
- [Service instance per container](/blog/SystemDesign/2026-11-20-pattern-service-per-container)

## Verify the behavior

Launch a new instance from a clean image and verify it can register and receive traffic. Roll back to the previous image while preserving durable data in a store outside the disposable guest.
