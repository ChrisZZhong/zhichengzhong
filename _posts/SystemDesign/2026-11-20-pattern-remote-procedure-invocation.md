---
layout: post
title: "Pattern: Remote Procedure Invocation (RPI)"
date: 2026-11-20
description: "Define a request and response contract that lets a caller invoke work across a service boundary. The caller waits for a result or an explicit failure within a deadline."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/communication-style/rpi.html"
---

## Context

The caller needs a remote decision before it can answer its own request. The interface might look like a method call, but the network can time out independently of the remote operation.

## Forces

A request-and-response exchange is easy to follow. Both sides need to be available before the caller's deadline, and a timed-out mutation can have an unknown outcome.

## Problem

How can a caller ask another service to perform an operation and get a result in the same request?

## Solution

Specify request and response types and classify transport errors separately from business results. Allocate a downstream timeout from the caller's deadline, propagate tracing context, and retry only when the operation can safely be repeated. REST, gRPC, and Thrift offer different contract and runtime choices.

![Reservation service to Typed request to Capacity API.](/system-design-patterns/remote-procedure-invocation/diagram)

## Examples

REST over HTTP, gRPC, and Apache Thrift are examples of remote request-response interfaces. The source's registration proxy uses an HTTP client to send a registration command and maps the remote result into the local API's domain response.

The reservation service requests the current capacity of a venue using a typed gRPC operation. It allocates part of the inbound deadline to that call.

The source shows a Scala registration proxy using RestTemplate. The Java example below exercises an equivalent synchronous HTTP boundary and keeps an account conflict separate from transport failure.

### Java HTTP client example

The client sends registration JSON to an explicit endpoint. A `409` answer is a regular business outcome, while a transport exception tells the caller the response was unavailable. The calling workflow must resolve an uncertain write before replaying it.

```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public final class RegistrationHttpClient {
    enum Result { REGISTERED, ALREADY_REGISTERED, REJECTED }

    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofMillis(200))
        .build();

    Result register(URI endpoint, String registrationJson)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(endpoint)
            .timeout(Duration.ofMillis(400))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(registrationJson))
            .build();

        int status = client.send(request, HttpResponse.BodyHandlers.discarding())
            .statusCode();
        if (status == 200 || status == 201) return Result.REGISTERED;
        if (status == 409) return Result.ALREADY_REGISTERED;
        if (status >= 400 && status < 500) return Result.REJECTED;
        throw new IOException("Unexpected account-service response: " + status);
    }
}
```

Configure deadlines from measured latency and the inbound budget. In a real integration, handle transient responses such as `429` according to the API contract. Keep resource limits and a circuit breaker separate from the HTTP request timeout.

## Resulting context

Direct calls are easy to reason about when the caller needs the result immediately. Bound concurrency and retries because the caller inherits the dependency’s latency and availability.

## Related patterns

- [Messaging](/blog/SystemDesign/2026-11-20-pattern-messaging)
- [Circuit breaker](/blog/SystemDesign/2026-11-20-pattern-circuit-breaker)
- [Server-side discovery](/blog/SystemDesign/2026-11-20-pattern-server-side-discovery)

## Verify the behavior

Simulate a rejected request and an upstream timeout after the destination accepted work. The caller should preserve the rejection status and treat the timed-out write as uncertain until it can query by operation ID.
