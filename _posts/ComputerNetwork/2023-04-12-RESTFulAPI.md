---
layout: post
title: "API and Service Communication: REST, SOAP, RPC, and gRPC"
date: 2023-04-12
description: "Compare resource-oriented APIs, SOAP messages, and typed service calls."
tag: Computer Network
---

Applications expose an API so callers can interact with their data or operations through an agreed contract. HTTP is one protocol that can carry those interactions. [From a Browser URL to an HTTP Response](/blog/ComputerNetwork/2023-09-21-TCPIP#http).

## RESTful API

<span id="what-is-restful-api-application-programming-interface"></span>
<span id="what-is-rest"></span>

REST is a resource-oriented architectural style. In a typical REST API over HTTP, URIs identify resources, methods express operations, and responses return representations.

### RESTful API six principles

<span id="restful-api-6-principles"></span>

1. **Uniform interface** uses consistent ways to identify resources, exchange representations, and describe interactions.
2. **Client-server** separates the responsibilities of the consumer and provider.
3. **Statelessness** requires each request to provide the context needed to handle it.
4. **Cacheability** lets clients and intermediaries reuse responses when allowed.
5. **Layered system** accommodates intermediaries such as gateways and caches.
6. **Code on demand** optionally lets the server supply executable code.

See [Fielding's REST constraints](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) and [Spring MVC request flow](/blog/Java%26Spring/2023-04-12-REST-in-Spring#spring-mvc-request-flow).

## REST vs SOAP

### SOAP

SOAP defines an XML messaging format. A SOAP envelope contains a body and can contain an optional header for metadata. SOAP services often use HTTP to carry those messages. REST APIs over HTTP usually express more of the contract through resource URIs, HTTP methods, headers, and status codes. [SOAP 1.2 Messaging Framework](https://www.w3.org/TR/soap12-part1/).

## RPC (Remote Procedure Call)

### What is RPC?

RPC represents an interaction as a call to a remote operation such as `ReserveInventory(orderId)`. The caller still needs to handle network timeouts, errors, and retries.

### Transport protocol and serialization protocol

<span id="transport-protocol-and-serialize-protocol"></span>

The transport carries requests and responses. Serialization describes how application values are encoded. RPC implementations make these choices independently. Examples of encodings include JSON, XML, and Protocol Buffers.

### gRPC

gRPC typically defines the service and messages in a `.proto` file and generates client and server code. It uses HTTP/2 and supports unary calls as well as client, server, and bidirectional streaming. [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/).

### RPC vs HTTP

RPC describes the shape of an API. HTTP is a communication protocol that can carry RPC calls. When choosing between a REST API over HTTP and gRPC, compare the consumers, schema and tooling needs, streaming requirements, and the overhead on your actual workload.

<span id="rest-controller-in-spring-see-here"></span>

For the Java implementation, see [Spring Web APIs](/blog/Java%26Spring/2023-04-12-REST-in-Spring).
