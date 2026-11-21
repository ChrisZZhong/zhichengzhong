---
layout: post
title: "Pattern: Circuit Breaker"
date: 2026-11-20
description: "Stop calling a failing dependency, then admit a limited number of calls to verify recovery."
tag: SystemDesign
subcategory: Design Patterns
toc: false
originalSource: "https://microservices.io/patterns/reliability/circuit-breaker.html"
---

## Context

A user-registration API calls an account service before returning to the browser. When the account service stalls, each outstanding request keeps a connection, a thread, or some other slot busy. Soon the registration API can run out of capacity even for requests that do not need the account service. A timeout limits the cost of one call. The breaker prevents repeated calls from paying that cost once the dependency shows a pattern of failure.

## Problem

How can a caller keep a slow or unavailable service from taking down the rest of the system?

## Forces

- Track failures at the dependency boundary. Connection failures and timeouts say something different from a valid response such as `409 Conflict` for an existing account.
- Give each call its own deadline. Opening the breaker affects new calls. Calls already in progress still depend on their timeout and cancellation behavior.
- Use a recovery window and a limited number of probes. Otherwise a returning dependency can be flooded before it has recovered.
- Choose a fallback based on the request. A failed write should report an unavailable or unknown result as appropriate. A read may be able to use a cached value.

## Solution

![Closed calls switch to open after failures, then half-open probes determine recovery.](/system-design-patterns/circuit-breaker/diagram)

| State | What happens | Next transition |
| --- | --- | --- |
| Closed | Allow calls and record eligible outcomes. | Open when the failure rule is met. |
| Open | Reject new calls immediately. | After the wait window, allow a recovery probe. |
| Half-open | Admit a limited number of calls and judge their results. | Close on confirmed recovery, or reopen and start a fresh wait window. |

For busy dependencies, a rolling error rate with a minimum sample count is often easier to tune than a streak of failures. Choose the scope of a breaker carefully. Two independent backends or operations can fail differently, and sharing one breaker may make a partial outage look like a full outage. [Resilience4j state machine and configuration](https://resilience4j.readme.io/docs/circuitbreaker).

## Example

The reference uses a Scala `RegistrationServiceProxy` with Netflix Hystrix to wrap a remote registration request. Its proxy treats an account conflict as a normal domain result. The example below demonstrates the same distinction with Java and a simulated backend. It uses a synthetic clock and handles one invocation at a time, so it shows the failure and recovery sequence without a remote server or third-party library. [Reference registration example](https://microservices.io/patterns/reliability/circuit-breaker.html#example).

### Java example

Save as `RegistrationBreakerDemo.java` and run `java RegistrationBreakerDemo.java` with Java 17. Here `503` represents a failed account-service call or an open circuit. A real proxy also classifies transport timeouts and connection errors.

```java
import java.util.function.IntSupplier;

public class RegistrationBreakerDemo {
    enum State { CLOSED, OPEN, HALF_OPEN }

    static final class Breaker {
        private final int failureLimit;
        private final long pauseMillis;
        private int consecutiveFailures;
        private long retryAt;
        private State state = State.CLOSED;

        Breaker(int failureLimit, long pauseMillis) {
            this.failureLimit = failureLimit;
            this.pauseMillis = pauseMillis;
        }

        int call(long now, IntSupplier backend) {
            if (state == State.OPEN) {
                if (now < retryAt) {
                    return 503;
                }
                state = State.HALF_OPEN;
            }

            int status = backend.getAsInt();
            if (status >= 500 && status <= 599) {
                if (state == State.HALF_OPEN || ++consecutiveFailures >= failureLimit) {
                    state = State.OPEN;
                    retryAt = now + pauseMillis;
                }
            } else {
                consecutiveFailures = 0;
                state = State.CLOSED;
            }
            return status;
        }
    }

    static void expect(boolean condition) {
        if (!condition) {
            throw new AssertionError("Unexpected breaker behavior");
        }
    }

    public static void main(String[] args) {
        Breaker breaker = new Breaker(2, 1_000);
        expect(breaker.call(0, () -> 503) == 503);
        expect(breaker.call(10, () -> 409) == 409);
        expect(breaker.state == State.CLOSED);
        expect(breaker.call(20, () -> 503) == 503);
        expect(breaker.call(30, () -> 503) == 503);
        expect(breaker.state == State.OPEN);
        expect(breaker.call(100, () -> { throw new AssertionError("Circuit was open"); }) == 503);
        expect(breaker.call(1_030, () -> 503) == 503);
        expect(breaker.state == State.OPEN);
        expect(breaker.call(2_030, () -> 201) == 201);
        expect(breaker.state == State.CLOSED);
        System.out.println("Conflict, open circuit, failed probe, and recovery passed.");
    }
}
```

## Resulting Context

A breaker keeps one failing dependency from consuming all caller capacity. In production, use a concurrency-safe breaker and combine it with a separate concurrency limit when a dependency can exhaust a caller's resources before enough failures have been recorded. Keep an eye on probe outcomes, time spent open, denied calls, and client-visible fallback rates. A threshold that opens too early can reject useful traffic. An overly lenient one can leave callers waiting during an outage.

For a write that timed out after being sent, the outcome can still be unknown. Use a stable operation ID and a lookup or reconciliation path before allowing an automatic retry of the same registration.

## Related patterns

- [Remote procedure invocation](/blog/SystemDesign/2026-11-20-pattern-remote-procedure-invocation) is the synchronous call boundary that needs protection.
- [Microservice chassis](/blog/SystemDesign/2026-11-20-pattern-microservice-chassis) can provide a shared breaker integration.
- [API gateway](/blog/SystemDesign/2026-11-20-pattern-api-gateway) and [server-side discovery](/blog/SystemDesign/2026-11-20-pattern-server-side-discovery) can fail fast at an edge or routing boundary.
- [Application metrics](/blog/SystemDesign/2026-11-20-pattern-application-metrics) expose open-state time, call outcomes, and rejected requests.

## See also

The reference illustrates a Hystrix command around a Scala HTTP client. The Java example above exercises the same state changes. [Resilience4j CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker) documents rolling windows and limited recovery probes.

## Verify the behavior

Test four separate conditions. A conflict should come back as a conflict. Repeated dependency failures should open the circuit. Requests blocked by the open circuit should never reach the downstream client. A failed probe should extend the wait, while a successful probe should restore normal traffic. Measure latency and rejection rates under load as well as state transitions.
