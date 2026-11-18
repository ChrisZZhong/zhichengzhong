---
layout: post
title: "Designing LLM Inference and Token Streaming"
date: 2025-12-19
description: "A ChatGPT-style system design prompt focused on serving inference requests."
tag: System Design
subcategory: Infrastructure
---

## ChatGPT-style inference prompt

Define the request and response contract first. Clarify which callers need streamed tokens and which can use asynchronous jobs. Agree on the target workload, p99 latency, and regional requirements. For interactive streaming, distinguish time to first token from the time it takes to finish generating.

## Request path

1. Route each request to capacity for the required model. Decide when replicas are sufficient and when a model's weights need to be split across devices.
2. Queue compatible requests and batch them to improve GPU utilization. Bound queueing so it stays within the latency budget.
3. Stream generated tokens back as they become available. Define behavior for client cancellation, a slow reader, and a model worker failing mid-response.
4. Identify what can be reused at each layer, such as embeddings for retrieval or a reusable conversation prefix. Include model version and access scope in the cache design.

## Where the design bottlenecks

Watch for GPU saturation, long contexts, and bursty traffic. Discuss how dynamic batching changes throughput and latency, how traffic is routed across clusters, and what clients see during regional failover.

[Source interview notes](https://programhelp.net/?s=uber).
