---
layout: post
title: "Troubleshooting Distributed Services with Logs, Metrics, and Traces"
date: 2024-05-21
description: "Narrow an incident by time and service, follow a trace, and investigate with Elastic or reusable Splunk searches."
tag: Distributed System
subcategory: Operations and Delivery
---

Suppose checkout errors rise after a deployment. First identify the affected time window, region, service, and version. Then follow one failing request through the gateway and downstream services. Use request rate, error rate, and latency to see whether that request represents a wider problem.

## Incident triage with logs and metrics

1. Start with the symptom. Compare error rates and p95 latency with the preceding baseline. Counts alone can be misleading after a change in traffic volume.
2. Split by endpoint, deployment version, or region to locate the difference. Check dependency timeouts and resource saturation alongside the application graphs.
3. Find one representative failure. Look for a structured error event and its request or trace ID. Inspect the earliest relevant failure in the flow, including the downstream response.
4. Confirm the hypothesis against a healthy request or another region. After mitigation, check that error and latency metrics recover.

During development, local logs are often sufficient. Across instances, centralize structured logs with time, service, environment, version, trace ID, and a stable error category. Use health endpoints and metrics, such as Spring Boot Actuator, to track conditions that individual logs cannot summarize. [Spring Boot service monitoring](/blog/Java%26Spring/2023-06-19-monitoring#monitoring-with-actuator-metrics-and-logs).

## Distributed tracing

A trace groups spans for one operation. Every span has a trace ID and its own span ID. A parent span ID connects related work, and spans record duration and attributes such as service name or operation. Propagate the trace context across HTTP calls and messaging boundaries. For asynchronous work that does not form a simple parent-child chain, a span link can represent the relationship.

In the checkout example, a gateway span might show a slow inventory call. Follow the inventory span to distinguish time spent in its own code from time spent waiting on its database. Add the trace ID to structured logs to pivot from the timeline to the error detail. Keep high-cardinality fields such as trace IDs in logs or traces rather than metric labels. [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/).

## Centralized logs with the Elastic Stack

A collector such as Beats can ship logs. Logstash parses, enriches, and routes events. Elasticsearch indexes them for search and aggregation. Kibana provides filtered inspection, charts, and dashboards. Validate field types, time zones, and retention so the dashboards reflect comparable inputs across services.

## Splunk

The examples use a sample index and field names. Adapt them to your environment. Each search assumes the time picker is set to the interval under investigation and that duration is recorded in milliseconds.

**Request rate.** Count a `START` event once per request. If collecting duplicate events, deduplicate by a stable request ID before calculating a rate.

```spl
index=app_logs service=checkout eventType=START
| eval request=1
| timechart span=1m per_second(request) AS requests_per_second
```

**Error distribution and latency.** Use a consistent set of outcomes. Include both successful and failed completions where measuring client-visible latency.

```spl
index=app_logs service=checkout eventType=ERROR
| stats count AS errors by endpoint error_category
| sort - errors
```

```spl
index=app_logs service=checkout eventType IN (END, ERROR)
| timechart span=1m avg(duration_ms) AS mean_ms p95(duration_ms) AS p95_ms by region
```

**Locate a specific request or compare versions.**

```spl
index=app_logs trace_id="sample-trace-id"
| sort 0 _time
| table _time service eventType duration_ms error_category
```

```spl
index=app_logs service=checkout eventType IN (END, ERROR)
| eval failed=if(eventType="ERROR", 1, 0)
| stats count AS total sum(failed) AS errors by version region
| eval error_pct=round(100 * errors / total, 2)
```

Use the same filters when comparing regions or releases. The older examples use host patterns, request paths, client names, and raw messages as fallbacks. Prefer explicit fields such as `region`, `version`, `endpoint`, and `client_id` so comparisons do not depend on naming conventions or fragile text extraction. Use exact filters when tracing a specific client and keep raw payloads out of shared reports.
