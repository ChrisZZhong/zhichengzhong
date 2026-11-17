---
layout: post
title: "Java 8 Streams: From Lambdas to Collectors"
date: 2023-03-30
description: "One employee dataset for practicing filter, map, reduce, grouping, sorting, and the Java 8 APIs behind them."
tag: Java & Spring
---

A stream pipeline reads from a source, applies zero or more lazy intermediate operations, and ends with a terminal operation. A pipeline can be consumed once. Call `stream()` again when you need a second result from the same collection. The examples use Java 8 APIs.

## Lambdas and functional interfaces

A lambda such as `person -> person.getSalary() > 8000` provides the implementation of a functional interface's single abstract method. `@FunctionalInterface` asks the compiler to verify that contract.

| Interface | What it does | Where it appears |
| --- | --- | --- |
| `Predicate<T>` | Takes a value and returns a boolean | `filter`, `anyMatch` |
| `Function<T, R>` | Transforms a value | `map`, `groupingBy` classifier |
| `Consumer<T>` | Takes a value and returns nothing | `forEach` |
| `Supplier<T>` | Produces a value without an argument | `Stream.generate`, `orElseGet` |

Java 8 also lets interfaces add default methods that implementations inherit and static methods called on the interface itself. `Comparable.compareTo` defines a type's natural ordering. A `Comparator` defines an external sort order and can be constructed from a lambda, method reference, or existing comparators.

## Create a stream and its sample data

Start with `collection.stream()`, `Arrays.stream(array)`, `Stream.of(...)`, or a generator such as `Stream.iterate`. Parallel streams also exist. Keep operations free of shared mutable state, and measure before switching to parallel execution.

The following examples share this dataset. They use types from `java.util` and `java.util.stream`.

```java
class Person {
    private final String name;
    private final int salary;
    private final int age;
    private final String sex;
    private final String area;

    Person(String name, int salary, int age, String sex, String area) {
        this.name = name;
        this.salary = salary;
        this.age = age;
        this.sex = sex;
        this.area = area;
    }

    String getName() { return name; }
    int getSalary() { return salary; }
    int getAge() { return age; }
    String getSex() { return sex; }
    String getArea() { return area; }
}

List<Person> people = Arrays.asList(
    new Person("Tom", 8900, 23, "male", "New York"),
    new Person("Jack", 7000, 25, "male", "Washington"),
    new Person("Lily", 7800, 21, "female", "Washington"),
    new Person("Anni", 8200, 24, "female", "New York"),
    new Person("Owen", 9500, 25, "male", "New York"),
    new Person("Alisa", 7900, 26, "female", "New York")
);
```

## Filter, transform, and flatten

```java
List<String> names = people.stream()
    .filter(person -> person.getSalary() > 8000)
    .map(Person::getName)
    .collect(Collectors.toList()); // [Tom, Anni, Owen]

List<String> tokens = Stream.of("m,k,l,a", "1,3,5,7")
    .flatMap(line -> Arrays.stream(line.split(",")))
    .collect(Collectors.toList()); // [m, k, l, a, 1, 3, 5, 7]

List<Person> afterRaise = people.stream()
    .map(p -> new Person(p.getName(), p.getSalary() + 1000,
                         p.getAge(), p.getSex(), p.getArea()))
    .collect(Collectors.toList());
```

`map` produces one result per element. `flatMap` lets one element contribute zero, one, or many results to the flattened stream. In the raise example, new `Person` instances leave the source list's objects alone. Treat `peek` as a diagnostic aid and keep updates out of the pipeline.

## Find, match, and traverse

```java
Optional<Person> first = people.stream()
    .filter(person -> person.getSalary() > 8000)
    .findFirst();

boolean anyAboveNineThousand = people.stream()
    .anyMatch(person -> person.getSalary() > 9000);

people.stream().map(Person::getName).forEachOrdered(System.out::println);
```

`findFirst` respects encounter order when one exists. `findAny` can return any match, which gives a parallel pipeline more flexibility. `anyMatch`, `allMatch`, and `noneMatch` return booleans and can short-circuit. `forEach` does not guarantee encounter order in parallel.

`Optional` models a result that may be missing. Use `empty()`, `of(nonNullValue)`, or `ofNullable(value)` to construct one. Prefer handling absence explicitly with `ifPresent`, `orElse`, `orElseGet`, or `orElseThrow`. `get()` throws on an empty value.

## Aggregate and reduce

```java
long count = people.stream().filter(p -> p.getSalary() > 8000).count();
Optional<Person> highestPaid = people.stream().max(Comparator.comparingInt(Person::getSalary));
Optional<Person> lowestPaid = people.stream().min(Comparator.comparingInt(Person::getSalary));

int total = people.stream().mapToInt(Person::getSalary).sum();
OptionalDouble average = people.stream().mapToInt(Person::getSalary).average();
int reducedTotal = people.stream().map(Person::getSalary).reduce(0, Integer::sum);
int directTotal = people.stream().reduce(0, (sum, p) -> sum + p.getSalary(), Integer::sum);
int product = Stream.of(1, 3, 2, 8).reduce(1, (a, b) -> a * b);
```

Use the identity value for the operation, such as zero for addition or one for multiplication. An identity-free reduction returns an `Optional`. Reductions need associative operations, and the combiner must agree with the accumulator when combining partial results. Use primitive streams for simple numerical statistics and `collect` for building mutable result containers.

## Collect into lists, maps, groups, and summaries

```java
List<String> names = people.stream().map(Person::getName).collect(Collectors.toList());
Set<String> cities = people.stream().map(Person::getArea).collect(Collectors.toSet());

Map<String, Person> byName = people.stream()
    .collect(Collectors.toMap(Person::getName, Function.identity()));

Map<Boolean, List<Person>> byThreshold = people.stream()
    .collect(Collectors.partitioningBy(p -> p.getSalary() > 8000));

Map<String, List<String>> namesByCity = people.stream()
    .collect(Collectors.groupingBy(Person::getArea,
        Collectors.mapping(Person::getName, Collectors.toList())));

Map<String, Map<String, List<Person>>> bySexAndCity = people.stream()
    .collect(Collectors.groupingBy(Person::getSex, Collectors.groupingBy(Person::getArea)));

IntSummaryStatistics pay = people.stream().collect(Collectors.summarizingInt(Person::getSalary));
String joined = people.stream().map(Person::getName).collect(Collectors.joining(", "));
int aboveAllowance = people.stream()
    .collect(Collectors.reducing(0, p -> Math.max(0, p.getSalary() - 5000), Integer::sum));
```

`toMap` needs a merge function when keys can repeat. `groupingBy` uses a classifier to create keys, while `partitioningBy` creates two boolean buckets. Downstream collectors let each group contain names, a count, or summary statistics instead of always returning a list of full objects. For standalone statistics, use `counting`, `summingInt`, `averagingInt`, `minBy`, `maxBy`, or one summary collector that gives all of them.

## Sort, deduplicate, and take a slice

```java
List<String> orderedNames = people.stream()
    .sorted(Comparator.comparingInt(Person::getSalary).reversed()
        .thenComparingInt(Person::getAge))
    .map(Person::getName)
    .collect(Collectors.toList());

List<String> letters = Stream.concat(Stream.of("a", "b", "c", "d"), Stream.of("d", "e", "f", "g"))
    .distinct().collect(Collectors.toList()); // [a, b, c, d, e, f, g]

List<Integer> oddSlice = Stream.iterate(1, value -> value + 2)
    .skip(1).limit(5).collect(Collectors.toList()); // [3, 5, 7, 9, 11]
```

This comparator sorts by descending salary, then ascending age. If both should be descending, reverse the completed comparator. `distinct` uses equality to remove duplicates. `skip` discards elements and `limit` bounds the output. Place a limit or another suitable short-circuiting operation before trying to fully collect an unbounded source.

References: [Java 8 Stream](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html) · [Java 8 Collectors](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html).
