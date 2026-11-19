---
layout: post
title: "ECWS Payment Workflow Before and After Migration"
date: "2026-11-18"
description: "How a payment request reaches Core and how its receipt can be retried independently."
tag: temp
---

I worked on the ECWS payment orchestration service used by banks and credit unions. I refactored the orchestration module into a Java and Spring Boot service and moved receipt email delivery out of the payment request path.

## How ECWS routes a request

ECWS reads `requestType` to choose a workflow. These are five examples. During the migration, we kept the existing logic for the other request types because we hadn't observed a bottleneck in those flows.

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 16, "rankSpacing": 32}} }%%
flowchart TD
    service["1. ECWS orchestration"] --> route{"2. requestType"}
    route --> auth["AUTH<br/>Return user info"]
    route --> pay["PAY<br/>Process payment"]
    route --> rest["REST<br/>Restriction"]
    route --> clnc["CLNC<br/>Update credit line"]
    route --> acmt["ACMT<br/>Maintain account"]
    pay --> core["3. Call Core for payment"]
```

1. The orchestration service receives the business request.
2. The type selects one branch. Several branches can also populate a memo. For example, `CLNC` uses credit-limit details, while `PAY` uses the payment amount. The `REST` label here is a business code for restriction-related data.
3. For `PAY`, ECWS calls Core to execute the payment. The diagrams below follow that branch before and after migration.

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
    subgraph translator["SOAP to REST Translation Service"]
        protocol{"Incoming protocol"}
        protocol -->|2a SOAP| convert["Convert to REST"]
        protocol -->|2b REST| forward["Pass through unchanged"]
    end
    dp -->|2 Forward request| protocol
    convert --> service["fs-internal-service"]
    forward --> service
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
2. **Route both protocols through the translation service.** DataPower forwards every SOAP and REST request to the SOAP to REST Translation Service. It converts SOAP requests to REST (2a) and passes native REST requests through unchanged (2b). Both paths reach `fs-internal-service` as REST.
3. **Call Core.** The orchestration service calls Core and waits for the payment result.
4. **Record the outcome.** After Core responds, the service writes the workflow record to Oracle. When a receipt is due, it writes an outbox event in the same transaction. The client can receive its payment response without waiting for email delivery.
5. **Publish the receipt event.** Change data capture (CDC) picks up the committed outbox record and publishes it to Kafka.
6. **Request email delivery.** The email consumer calls the infrastructure team's email API. Infrastructure handles SMTP delivery after the API accepts the request.
7. **Retry a temporary failure.** If another attempt is safe, the notification goes to a retry topic. A retry consumer picks it up after backoff.
8. **Protect the email API.** Retry consumers share circuit breaker state in Redis. CLOSED permits a call (8a). OPEN pauses new attempts while pending notifications stay in Kafka (8b).
9. **Recover failed notifications.** A retryable failure with attempts remaining goes back through the retry path (9a). An exhausted notification goes to the dead-letter topic (9b). Once the cause is understood, it can be replayed with the same notification ID. Replay retries the receipt without re-executing the payment.
