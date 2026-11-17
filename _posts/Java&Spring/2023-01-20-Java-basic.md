---
layout: post
title: "Java Fundamentals: Objects, Collections, Concurrency, and I/O"
date: 2025-06-30
description: "Interview notes on OOP and SOLID, collections, JVM memory, threads and futures, and buffered input."
tag: Java & Spring
---

Use this guide when you need to explain how Java code is designed and how it behaves at runtime. For signatures and short coding interview examples, see [Java API](/blog/Java%26Spring/2022-03-07-Java-API). For lambdas and collection pipelines, see [Java 8 Streams](/blog/Java%26Spring/2023-03-30-Java8-Stream).

## Object-oriented programming

| Concept | What it means in Java |
| --- | --- |
| Encapsulation | Keep internal state behind an API that protects invariants. A private balance and a checked `withdraw` method are more useful than a public setter. |
| Abstraction | Expose behavior through an interface or abstract class while hiding implementation details. An abstract class can hold instance state and define constructors. Interfaces can supply default and static methods as well as abstract methods. |
| Inheritance | A class extends one superclass and can implement multiple interfaces. Prefer composition when the relationship is “has a” instead of “is a.” With conflicting inherited interface defaults, an implementation may need to override the method explicitly. |
| Polymorphism | A call through an interface or base class can dispatch to a subclass override at runtime. Overloading selects a signature at compile time based on the declared argument types. Java does not support user-defined operator overloading. |

Reflection can inspect and in some circumstances access members outside their normal visibility. It is a separate mechanism from encapsulation.

## SOLID principles

| Principle | Example |
| --- | --- |
| Single responsibility | Separate a shape's geometry from formatting an area report. The two classes change for different reasons. |
| Open–closed | Add another payment method by implementing `PaymentProcessor` and registering it. Existing payment processing logic stays focused on the shared contract. |
| Liskov substitution | A method promising a mutable `List` must return a list that supports the operations callers rely on. Matching a type alone does not guarantee matching behavior. |
| Interface segregation | Split charging and refunding into separate interfaces when some payment methods only support charging. |
| Dependency inversion | Let the checkout service depend on `PaymentProcessor` and supply the concrete implementation from outside. Spring's [dependency injection](/blog/Java%26Spring/2023-04-07-Spring-Boot#dependency-injection-and-the-ioc-container) is one way to wire this up. |

## Collections and lookup

| Structure | Reach for it when |
| --- | --- |
| Array | Size is fixed or you want to store primitives without boxing. Indexed access is constant time. |
| `ArrayList` | You need a growable list with constant-time indexed access and amortized constant-time append. Inserting or deleting in the middle shifts later elements. |
| `LinkedList` | You already have a position or need operations at the ends. Finding an arbitrary index still takes linear time. For a basic queue or stack, also consider `ArrayDeque`. |
| `HashMap` | You need fast lookup by key and can live without iteration order. It allows a null key and null values and requires external coordination if multiple threads modify it. |
| `Collections.synchronizedMap` | You need a synchronized wrapper around an existing map. Null behavior follows the backing map. Coordinate iteration and compound operations using the wrapper's lock. |
| `Hashtable` | You are working with a legacy synchronized map API. It rejects null keys and values. |
| `ConcurrentHashMap` | Multiple threads need to access and update a shared map. It rejects null keys and values. Use atomic operations such as `computeIfAbsent` for compound updates. |

`HashMap` uses a hash to select a bucket in its backing table and `equals` to distinguish keys. A collision means different keys land in the same bucket. With enough collisions and capacity, Java 8's implementation can turn a bucket's linked list into a tree. Keep the fields used by a key's `equals` and `hashCode` stable while that key is in the map.

## Immutability and strings

An immutable object's state cannot change after construction. One common implementation is a final class with private final fields and no setters. Copy mutable inputs before storing them and avoid exposing mutable internals through accessors. A final reference can still point to an object whose contents change.

`String` immutability makes references safe to share, keeps hash codes stable for map lookups, and makes pooling literals practical. A string's contents also cannot be altered after being passed to another component. Literal strings are interned, while a string created at runtime is not automatically guaranteed to be the same object as an equal literal. Compare contents with `equals`.

Use `StringBuilder` for repeated changes within one thread. `StringBuffer` synchronizes its individual methods, so a sequence of calls may still need coordination.

## Exceptions and resource cleanup

- **Checked exceptions** such as `IOException` must be caught or declared. **Unchecked exceptions** such as `NullPointerException` do not have that requirement.
- Define a custom exception when callers need to distinguish a domain failure. Extend `Exception` for a checked exception or `RuntimeException` for an unchecked one.
- A final variable cannot be reassigned, a final method cannot be overridden, and a final class cannot be extended. A `finally` block handles cleanup on normal and exceptional exits. The legacy `finalize()` method is deprecated for removal and is unsuitable for timely cleanup. Use try-with-resources for resources implementing `AutoCloseable`.

```java
class InvalidReportException extends Exception {
    InvalidReportException(String message) {
        super(message);
    }
}
```

## Serialization and marker interfaces

A marker interface conveys information through its type without declaring methods. `Serializable` opts an object into Java's built-in object serialization, and `Cloneable` is another example.

Declare a `serialVersionUID` explicitly if serialized data must survive compatible changes. An incompatible version can cause deserialization to fail. Mark fields `transient` to exclude them from default serialization. For example, `transient int age` will not be written by the default mechanism. Avoid native Java deserialization of untrusted input.

## JVM memory and execution

The class loader brings classes into the JVM. The execution engine interprets bytecode and can compile hot code with the JIT. JNI connects Java code to native libraries.

Threads have their own stacks for method frames. Objects ordinarily live on the shared heap, where garbage collection reclaims unreachable objects. Generational collectors distinguish newer and older objects. HotSpot stores class metadata in native Metaspace, separate from the Java heap.

## Threads and synchronization

A Java thread moves through `NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, and `TERMINATED`. Java's `RUNNABLE` includes a thread running or eligible to run. `BLOCKED` specifically means the thread is waiting to enter a monitor.

- `start()` schedules work on a new thread. Calling `run()` directly is an ordinary call on the current thread.
- `synchronized` lets one thread at a time hold a monitor and provides visibility between releases and subsequent acquisitions of the same monitor. An instance method uses the instance monitor, while a static synchronized method uses the class monitor.
- `wait()` releases the monitor on the object it waits on. Check the condition in a loop after waking. `join()` waits for another thread to finish. `Thread.sleep()` keeps any monitors the thread holds.

See the [Java thread API](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html) for method contracts.

## Executors and futures

Prefer submitting a task to an executor when you need to separate work from thread management. A `Runnable` returns no result. A `Callable<T>` can return a result and throw a checked exception. `ExecutorService.submit` returns a `Future`, and `get()` blocks until the result is ready or the task fails. With `CompletableFuture`, use `runAsync` for a `Runnable` or `supplyAsync` for a value-producing `Supplier`. Compose stages before waiting for a final result.

```java
ExecutorService executor = Executors.newFixedThreadPool(2);
try {
    Callable<String> task = () -> "monthly report";
    Future<String> report = executor.submit(task);
    System.out.println(report.get());

    CompletableFuture<Integer> length = CompletableFuture
        .supplyAsync(() -> "monthly report", executor)
        .thenApply(String::length);
    System.out.println(length.join());
} finally {
    executor.shutdown();
}
```

`thenApply` transforms a result, `thenCompose` flattens a stage that itself returns a future, and `exceptionally` can supply a fallback. Size the pool and bound queued work for your workload rather than creating a thread for every request. An executor supplied to `CompletableFuture` determines where the async stage runs. An executor does not take the future itself as a task. [More examples of Callable and CompletableFuture](https://ducmanhphan.github.io/2020-02-10-How-to-use-CompletableFuture-Callable-in-Java/).

## Buffered input for coding exercises

`Scanner` is convenient, but token matching and conversion can add overhead on large inputs. Use `BufferedReader` for line-oriented input or wrap it in a tokenizer when whitespace, including newlines, is only a separator. This is file or console I/O. Java's collection [Stream API](/blog/Java%26Spring/2023-03-30-Java8-Stream) solves a different problem.

```java
BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
PrintWriter output = new PrintWriter(System.out);

String line;
while ((line = reader.readLine()) != null) {
    String trimmed = line.trim();
    if (!trimmed.isEmpty()) {
        String[] fields = trimmed.split("\\s+");
        output.println(fields.length);
    }
}
output.flush();
```

For matrix problems that do not depend on line breaks, `StreamTokenizer` can consume numeric tokens across lines. The example expects valid integer input containing one row count, one column count, and exactly that many matrix entries.

```java
StreamTokenizer tokens = new StreamTokenizer(
    new BufferedReader(new InputStreamReader(System.in))
);
if (tokens.nextToken() == StreamTokenizer.TT_NUMBER) {
    int rows = (int) tokens.nval;
    tokens.nextToken();
    int columns = (int) tokens.nval;
    int[][] matrix = new int[rows][columns];
    for (int row = 0; row < rows; row++) {
        for (int column = 0; column < columns; column++) {
            if (tokens.nextToken() != StreamTokenizer.TT_NUMBER) {
                throw new IOException("Expected a matrix entry");
            }
            matrix[row][column] = (int) tokens.nval;
        }
    }
}
```
