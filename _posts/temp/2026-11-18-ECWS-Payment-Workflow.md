---
layout: post
title: "ECWS Payment Workflow Before and After Migration"
date: "2026-11-18"
description: "How a payment request reaches Core and how its receipt can be retried independently."
tag: temp
---

I worked on the ECWS payment orchestration service used by banks and credit unions. I refactored the orchestration module into a Java and Spring Boot service and moved receipt email delivery out of the payment request path.

## Before migration

```mermaid
%%{init: {"sequence": {"width": 64, "actorMargin": 20, "mirrorActors": false}} }%%
sequenceDiagram
    participant C as Client
    participant D as DataPower
    participant E as ECWS
    participant K as Core
    C->>D: 1. Payment request
    D->>E: 2. Route request
    E->>K: 3. Call Core
    K-->>E: 4. Payment result
    E-->>D: 5. Response
    D-->>C: 6. Return
```

1. The client submits a payment request to DataPower.
2. DataPower authenticates the request, applies rate limits, and routes it to ECWS.
3. ECWS calls Core to execute the payment.
4. Core returns the payment result to ECWS.
5. ECWS prepares the client response and sends it back to DataPower.
6. DataPower returns the response to the client.

## After migration

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 24, "rankSpacing": 36}} }%%
flowchart TD
    client["Client"] -->|1 Request| dp["DataPower"]
    dp -->|2a SOAP| translator["SOAP to REST"]
    translator -->|2a REST| service["fs-internal-service"]
    dp -->|2b REST| service
    service -->|3 Call| core["Core / Mainframe"]
    core -.->|3 Result| service
    service -->|4 Commit| db[("Oracle<br/>Workflow and outbox")]
    db -.->|5 Committed event| cdc["CDC"]
    cdc -->|5 Publish| kafka["Kafka"]
    kafka -->|6 Consume| consumer["Email consumer"]
    consumer -->|6 Send| mail["Infra email API"]
    mail -.->|6 Response| consumer
    consumer -->|7 Retryable failure| retry["Retry topic"]
    retry -->|7 After backoff| rc["Retry consumer"]
    rc -->|8 Check| cb{"Circuit breaker"}
    cb <-->|8 Shared state| redis[("Redis")]
    cb -->|8a CLOSED| mail
    mail -.->|8a Response| rc
    cb -.->|8b OPEN| hold["Pending in Kafka"]
    rc -->|9a Retry| retry
    rc -->|9b Exhausted| dlt["Dead-letter topic"]
    dlt -.->|9b Replay| consumer
```

1. **Receive the payment.** DataPower still handles authentication, rate limiting, and routing.
2. **Accept both protocols.** SOAP requests pass through the translator (2a). Native REST requests go straight to `fs-internal-service` (2b). Both arrive at the same orchestration service as REST.
3. **Call Core.** The orchestration service calls Core and waits for the payment result.
4. **Record the outcome.** After Core responds, the service writes the workflow record to Oracle. When a receipt is due, it writes an outbox event in the same transaction. The client can receive its payment response without waiting for email delivery.
5. **Publish the receipt event.** Change data capture (CDC) picks up the committed outbox record and publishes it to Kafka.
6. **Request email delivery.** The email consumer calls the infrastructure team's email API. Infrastructure handles SMTP delivery after the API accepts the request.
7. **Retry a temporary failure.** If another attempt is safe, the notification goes to a retry topic. A retry consumer picks it up after backoff.
8. **Protect the email API.** Retry consumers share circuit breaker state in Redis. CLOSED permits a call (8a). OPEN pauses new attempts while pending notifications stay in Kafka (8b).
9. **Recover failed notifications.** A retryable failure with attempts remaining goes back through the retry path (9a). An exhausted notification goes to the dead-letter topic (9b). Once the cause is understood, it can be replayed with the same notification ID. Replay retries the receipt without re-executing the payment.
