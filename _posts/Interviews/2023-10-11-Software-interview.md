---
password: interviews
layout: post
title: "Java Backend and Full-Stack Interview Notes"
date: 2023-10-11
description: "Interview notes on core Java, concurrency, Spring, persistence, testing, and service operations."
tag: Interviews
---

## Study links

- [Core Java and concurrency](#core-java)
- [Java 8](#java-8)
- [Design patterns](#design-pattern)
- [Database and persistence](#database)
- [Spring](#spring)
- [Testing](#testing)
- [Microservices and cloud](#microservices-and-cloud)

<span id="java-api"></span>
<span id="java-basic-java-8"></span>
<span id="project-story"></span>
<span id="angular"></span>
<span id="react"></span>
<span id="javascript"></span>

For quick syntax lookup, see [Java API](/blog/Java%26Spring/2022-03-07-Java-API). For focused review, see [Java fundamentals](/blog/Java%26Spring/2023-01-20-Java-basic), [Java Streams](/blog/Java%26Spring/2023-03-30-Java8-Stream), [Angular](/blog/Frontend/2023-01-18-Angular), [React](/blog/Frontend/2023-02-13-React), and [JavaScript](/blog/Frontend/2023-11-13-JavaScript). For the project walkthrough, see [ECWS project interview notes](/blog/Interviews/2026-11-17-MadisonDavisProjectInterview).

# Core Java

## Solid Principles

### Single Responsibility Principle

- **A class should have one and only one reason to change, meaning that a class should have only one job.**

  **Example:**  
  Suppose you have a shape class, like triangle, you want to have a method to give you the area of the shape, instead of writing a method called calculateArea, you should create a new class called areaCalculator which is responsible for calculating area of all types, and call areaCalculator when you need to calculate the area.

  ```Java
  // violate SRP
   public class ReportGenerator {
      public void generateReport(String data) {
         System.out.println("Generating report: " + data);
      }

      public void saveToFile(String data) {
         System.out.println("Saving report to file: " + data);
      }

      public void sendEmail(String data) {
         System.out.println("Sending report by email: " + data);
      }
   }
   // should decouple to three class
   public class ReportContentGenerator {
      public String generateReport(String data) {
         return "Report: " + data;
      }
   }

   public class FileSaver {
      public void saveToFile(String data) {
         System.out.println("Saving report to file: " + data);
      }
   }

   public class EmailSender {
      public void sendEmail(String data) {
         System.out.println("Sending report by email: " + data);
      }
   }
  ```

### Open-Closed Principle

- **Objects or entities should be open for extension but closed for modification.**

  **Example:**  
   In Spring, use registration based factory design pattern to satisfy open closed principle:
   ```Java
   public interface DiscountStrategy {
      double getDiscount();
   }
   @Component("Regular")
   public class RegularDiscount implements DiscountStrategy {
      public double getDiscount() { return 0.05; }
   }

   @Component("Premium")
   public class PremiumDiscount implements DiscountStrategy {
      public double getDiscount() { return 0.10; }
   }

   @Component("VIP")
   public class VIPDiscount implements DiscountStrategy {
      public double getDiscount() { return 0.20; }
   }
   ```

   ```Java
   // Use component map so we only need to regist new strategy without modifying the business codes
   @Component
   public class DiscountStrategyFactory {

      private final Map<String, DiscountStrategy> strategyMap;

      public DiscountStrategyFactory(Map<String, DiscountStrategy> strategyMap) {
         this.strategyMap = strategyMap;
      }

      public DiscountStrategy getStrategy(String customerType) {
         return strategyMap.getOrDefault(customerType, () -> 0.0);
      }
   }
   ```

   ```Java
   @Service
   public class DiscountCalculator {

      private final DiscountStrategyFactory strategyFactory;

      public DiscountCalculator(DiscountStrategyFactory strategyFactory) {
         this.strategyFactory = strategyFactory;
      }

      public double calculateDiscount(String customerType) {
         DiscountStrategy strategy = strategyFactory.getStrategy(customerType);
         return strategy.getDiscount();
      }
   }
   ```

### Liskov Substitution Principle

- **Every subclass/derived class should be substitutable for their base/parent class.**

  **Example:**  
   List and arrayList are both list, so you can use arrayList anywhere you use list.

   ```Java
   // Ostrich can not replace Bird
   public class Bird {
      public void fly() {
         System.out.println("Bird is flying");
      }
   }

   public class Ostrich extends Bird {
      @Override
      public void fly() {
         throw new UnsupportedOperationException("Ostriches can't fly");
      }
   }
   ```

   ```Java
   // should be
   public interface Flyable {
    void fly();
   }

   public abstract class Bird {
      public abstract void move();
   }

   public class Eagle extends Bird implements Flyable {
      @Override
      public void move() {
         fly();
      }

      @Override
      public void fly() {
         System.out.println("Eagle is flying");
      }
   }

   public class Ostrich extends Bird {
      @Override
      public void move() {
         System.out.println("Ostrich is running");
      }
   }

   ```

### Interface Segregation Principle

- **A client should never be forced to implement an interface that it doesn’t use**

  **Example:**  
   Take payment as mentioned above as an example, A and B both implement payProcessor, A have charge and refund function, suppose B do not support refund, but B have to implement an empty method, this is a violation. Instead, we should separate the parProcessor to chargeProcessor, refundProcessor.

   ```Java
   // use two interface instead one
   public interface Workable {
    void work();
   }

   public interface Eatable {
      void eat();
   }

   public class HumanWorker implements Workable, Eatable {
      public void work() { System.out.println("Human working"); }
      public void eat() { System.out.println("Human eating"); }
   }

   public class RobotWorker implements Workable {
      public void work() { System.out.println("Robot working"); }
   }
   ```

### Dependency Inversion Principle

- **The high-level module must not depend on the low-level module, but they should depend on abstractions.**

  **Example:**  
   Still use payment as an example, if you want to use a new payment method, you should not modify the payProcessor, instead, you should create a new class and extend the payProcessor, and use the new class to handle the new payment method.

## OOP

### Encapsulation

**Definition** : Encapsulation is used to hide the internal details of a class. Only provide essential information to the users and hide implementation details.

Java implements it by making the fields in a class private and providing access to the fields via public methods like reflection. This helps to maintain data integrity and prevent unauthorized access to or modification of an object's internal state. Improve security, easier maintenance, improve code reuse.

E.g. `private` fields and `public` getters and setters.

### Inheritance

**Definition** : Derive something specific from something generic, a class can inherit all properties and methods of another class and add its own modification.

Use `Extend` keywords to declare inheritance, inheritance in Java implies that there is an IS-A relationship between the classes.

Type: single, multiple, multilevel, hierarchical, hybrid. Java doesn’t support Multiple inheritance

#### Diamond Problem

Multiple inheritance will cause diamond problem
The diamond problem in Java is about multiple inheritance. `When two superclasses of class A have a common parent class`, they all override the method of the parent class. When class A calls that method, it is ambiguous, so here arises a problem.

1. Interface: We can use the default methods and interfaces to achieve multiple inheritance, since Java supports more than one class implementing the interface.

2. aggregation: We can also use aggregation to include objects of multiple classes within its own implementation. This allows the class to access the methods and properties of the aggregated objects without directly inheriting from them, thus avoiding the conflicts and ambiguities of multiple inheritance.

### Polymorphism

**Definition** : we can perform a single action in different ways
Java implements it by `overriding` and `overloading`.

#### method overriding & method overloading Provide your own example

1. Overriding is to redefine a method that has been defined in a parent class, with the same signature.

2. Overloading is to define two methods with the same name, in the same class, but with different signatures.

### Abstraction

**Definition** : Abstraction is used to hide the internal details and show only the functionality to the users.

#### interface and abstract class

1. Interface is a blueprint of a class that have static constants and abstract methods. It can only have abstract methods, and all methods are public and abstract by default. It is used to achieve abstraction and multiple inheritance.

2. Abstract class is a class that is declared abstract, it can have abstract and non-abstract methods. It is used to achieve abstraction and code reusability.

## Final, Finally, Finalize

- `final` is a keyword to declare a constant variable, a method or a class.

  1. final variable: value (reference) cannot be changed once assigned.
  2. final method: cannot be overridden.
  3. final class: cannot be extended by other class.

- `finally` is used at the end of the try-catch block to execute the code within it regardless of the result of the try-catch block.

- `finalize` is a method of Object class that is called by the garbage collector when the object is no longer referenced. Use try with resource instead, because finalize() calling is unpredictable, sometimes will cause GC pause.

## Immutable Class

**Definition**: Immutable Class is a class whose instances (objects) **cannot be modified after they are created.**

**Example**: Wrapper classes, String (Security reason, hashcode)

### How to create Immutable Class

1. Declare the class as final so it can’t be extended.

2. Make all fields private and final.

3. No setter methods. All variables are set in the constructor with the deep copy of the input.

4. Return copies of feild data in getter methods.

### Why String is immutable in Java?

1. `Security concern`: sensitive information such as password, network connection, etc. Being immutable prevents malicious code from modifuing sensitive information.

2. `Thread safe`: Immutable objects are by default thread safe, can be shared among multiple threads.

3. `Hashcode`: String is widely used as key in Map and other collection classes. Being immutable guarantees that hashcode will always be same so that it can be cached without worrying about the changes.

4. `String Pool`: Save the runtime memory by reusing strings.
   > Java uses a string pool to store and reuse string literals. When you create a string, Java checks if it already exists in the string pool. If it does, the existing instance is returned, if not, a new instance is created.

## String, StringBuffer, StringBuilder

> They both used to store string values

- `String` is immutable, used to store values with fixed size. (Security reason, Thread safe, Hashcode, String Pool)

- `StringBuffer` ：used in multi-threaded environment, when we need to frequently modify the content of the string.

- `StringBuilder` used when we do not need to consider the thread safety, and when we need to frequently modify the content of the string

## HashMap

HashMap is a bucket array to store `key-value pairs`. It stores key-value pairs based on their hash value. It uses the `hashcode()` method to calculate the hash value of the key, and then uses the hash value to calculate the index of the bucket array

When hash collision occurs, it stores the key-value pairs in the same bucket array in the form of linked list. When the number of linked lists in the same bucket array exceeds 8 or 16, it will be converted to a red-black tree to improve the search efficiency.

### SynchronizedMap & ConcurrentHashMap & HashMap

<img src = "/images/Full-Stack/JavaCore/HashMap.png">

`HashMap`: not Thread-safe, can have one null key and multiple null values.  
`SynchronizedMap`: Thread-safe, Slow Performance, can have one null key and multiple null values. Can only have one thread reading.  
`ConcurrentHashMap`: Thread-safe, Fast Performance, null key and values are not allowed. Can have multiple threads reading at the same time, because it has multiple segments.

## Exception

### Checked Exception & Unchecked Exception

There are two types of exceptions in Java, checked exceptions and unchecked exceptions.

- `Checked exceptions` are checked at compile-time. It means if a method is throwing a checked exception then it should handle the exception using try-catch block or it should declare the exception using throws keyword, otherwise the program will give a compilation error.  
  Example: `IOException`, `SQLException` etc.

- `Unchecked exceptions` are not checked at compile-time, it means if your program is throwing an unchecked exception and even if you didn’t handle/declare that exception, the program won’t give a compilation error. It is up to the programmer to judge the conditions in advance, that can cause such exceptions and handle them appropriately.  
  Example: `NullPointerException` etc.

### Handle Exception

- For handle exception, we can use `try-catch` block to handle the exception, or use `throws` keyword to propagate the exception to the caller.
- In Spring Boot, we can use `@ExceptionHandler` to handle the exception.

### Exception Propagation

When an exception happens (like throw exceptions or runtime error), first it will check in current functions, is there any handler like try catch block to handle the exception, if not handled, it will be thrown to the caller function in the call stack, again and again until it is handled.

### Custom Exception

Create a class extending `Exception` or `RunTimeException` class, to use it, throw an exception in somewhere and use a try catch block to catch it.

```Java
public class CustomException extends Exception {
   public CustomException(String message) {
      super(message);
   }
}
```

## Thread

### LifeCycle of Thread and common knowledge

<img src="/images/Full-Stack/JavaCore/ThreadState.png">

1. `New`: When we create a new thread, it is in the `new` state.

2. `Runnable`: When we call the `start()` method, the thread will be in the `runnable` state. In this state, the thread is ready to run, but it is not running yet.

3. `Running`: When the thread is running, it is in the `running` state.

4. `Blocked`: The thread will be in blocked state when it is trying to acquire a lock but currently the lock is acquired by the other thread. The thread will move from the blocked state to runnable state when it acquires the lock.

5. `Waiting`: When we call the `wait()`, `join()` method, the thread will be in the waiting state and `release the lock` until another thread calls the `notify()` or `notifyAll()` method.

6. `Timed Waiting`: When we call the `sleep()` method, the thread will be in the timed waiting state and `release the lock` for the specified time. When the time is up, the thread will move to the runnable state.

7. `Terminated`: When the thread finishes its execution, it will be in the terminated state.

#### why wait() and notify() are in Object class but not in Thread Class?

Because they are used to manage synchronization and communication between threads that are interacting with the same object.

The purpose of wait() is to make a thread temporarily release the lock on the object it is associated with, allowing other threads to enter synchronized blocks or methods associated with the same object. notify() is used to wake up one waiting thread that is waiting on the same object, giving it a chance to acquire the lock and proceed.

If wait() and notify() were part of the Thread class, it might lead to confusion and difficulties when trying to coordinate threads on specific objects.

#### Join() and Sleep()

1. join() is used to let the current thread wait for others to finish.

   When a thread invokes join(), it will block itself until the target thread completes execution. This helps you make sure all other threads finish their work and then proceed to execute the current thread.

2. sleep() is used to let the current thread sleep for a specified time.

   When a thread invokes sleep(), it will block itself for the specified time. This helps you pause the execution of the current thread for a specified time.

#### Deadlock

Deadlock is a situation where two or more threads are blocked forever, waiting for each other to release the lock. Use a join() method between two start() to resolve this situation, so that the main will wait for the first thread to finish and then start the second thread. Use synchronize.

Strictly deadlock has 4 necessary conditions

1. Mutual Exclusion: A resource can be held by only one process at a time.
2. Hold and Wait: A process can hold a number of resources at a time and at the same time, it can request for other resources that are being held by some other process.
3. No preemption: A resource can't be preempted from the process by another process, forcefully.
4. Circular Wait: Circular wait is a condition when the first process is waiting for the resource held by the second process, the second process is waiting for the resource held by the third process, and so on.

### Create a thread

Generally, we can create a thread in two ways: Implement `Runnable` interface or extend `Thread` class.

But we use Runnable interface instead of Thread class, because:

1.  Thread `implements` runnable, when extending Thread, we only override run() method. this is a violation of `IS-A` principle.

2.  `After extending` Thread class, we can't extend other classes.

Example:

```Java
Runnable task = () -> someReallyLongProcess();
Executor executor = Executors.newSingleThreadExecutor();
executor.execute(task);
```

We need to access the result and when bug happens, we need to know the message of the exception. But `Runnable` can not `return the result` and `throw exception`, so we can use `Callable` and `Future` to solve this problem.

### Callable and Future

#### Callable

`Callable` is a functional interface, which has only one method call(). Callable is similar to Runnable, but Callable can return the result and throw exception.

```Java
@FunctionalInterface
public interface Callable<V> {

   V call() throws Exception;

}
```

`Executor` only accepts `Runnable`, so we need to use `ExecutorService` to run the `Callable` thread.

```Java
public interface ExecutorService extends Executor {

   // Submits a value-returning task for execution and returns a Future representing the pending results of the task.
   <T> Future<T> submit(Callable<T> task);

   // Submits a Runnable task for execution and returns a Future representing that task.
   Future<?> submit(Runnable task);

   // Submits a Runnable task for execution and returns a Future representing that task.
   <T> Future<T> submit(Runnable task, T result);
}
```

#### Future

The `Future` represents the result of Thread. When thread executed, the result or the exception message will be stored in the Future for main thread to access.

```Java
// In the main thread
Callable<String> task = () -> buildPatientReport();
Future<String> future = executor.submit(task);

String result = future.get();   // blocking here until finished to get the result
```

**`DownSide`**: Threads should be independent, also we need multi-threads to improve the performance, but `Future` will `block` the main thread, so we need to use CompletableFuture to solve this problem.

### CompletableFuture

`CompletableFuture` is almost the same as a Future object with more methods and more capabilities. (`runnable`, `supplier`)

```java
Runnable task = () -> System.out.println("Hello world");
ExecutorService service = Executors.newSingleThreadExecutor();
Future<?> future = service.submit(task);    // use future object
CompletableFuture<Void> completableFuture = CompletableFuture.runAsync(task);
```

`CompletableFuture` do not support `Callable`, only support `Runnable` and `Supplier`.

```java
Supplier<String> task = () -> readPage("https://google.com");
ExecutorService service = Executors.newSingleThreadExecutor();
CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(task);
```

Future chain to handle the results:

```java
CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(task);
CompletableFuture<Integer> lengthFuture = completableFuture.thenApply(String::length).thenApply(len -> len * 2).exceptionally(ex -> 0);
```

### ExecutorService

`ExecutorService` is a thread pool used to manage threads, and can submit tasks to the thread pool for execution. Generally, we can use `ExecutorService` to run Runnable, Callable, CompletableFuture threads.

Advantage:

- Easy to manage threads and reuse threads, which can reduce the overhead of thread creation and improve performance.

- Can limit the number of threads, avoid too many threads to cause system crash.

Disadvantage:

- A careless threads pool size can halt the system and bring performance down

- Always shut down the executor service after tasks are completed and service is no lon..ger needed. Otherwise, JVM will never terminate.

## synchronization

Control the access of multiple threads to any shared resource to achieve consistency and avoid race problem.

### Method synchronization & Block synchronization

Use `synchronized` `keyword` to achieve synchronization. Add `synchronized` to the method declaration, or add `synchronized` to the block. They will both bock other threads to access the method or block until the current thread finished and release the lock.

## Marker Interface

`Marker interface` is an `empty` interface used to provide run-time information about objects. Common examples of marker interfaces are `Serializable`.

## Serialization & Serializable

`Serialization` is convert the object to a byte stream, which can be stored in a file or sent over the network, and then be deserialized later to get the object back. The advantage of serialization is that it is easy to store and transmit data over network.

To serialize an object, the object must implement the `Serializable` interface.

`Serializable` is a marker interface (an `empty` interface used to provide run-time information about objects), which is used to mark the class as serializable, so that the object of the class can be serialized and deserialized.

When object is serialized, the `serialVersionUID` will be generated automatically. The serialVersionUID is used to ensure that the serialized and deserialized objects are compatible. If the serialVersionUID is not the same, the deserialization will fail.

If we do not want to serialize some fields, we can use `transient` keyword to declare the field. Like `public transient int age`;

# Java 8

Name some new features in Java 8:

- Lambda expression

- Functional interface

- Stream API

- Optional

- Default and static methods in interface

## Lambda expression

lambda expression is used to create an anonymous function.  
(para) -> {action}

The usage is in Java 8, we can use `lambda expression` to initialize a `functional interface`.

## Functional Interface

An interface that has only one abstract method and provides a single functionality. `@FunctionalInterface` annotation is not mandatory but it will add constraints to check if there is only one method in it.

- `Consumer` takes a single input and performs action without returning the result.

- `Supplier` used to generate a value.

- `Function` takes a single input and produces a result.

- `Predicate` takes a single input and returns a boolean value.

## Comparable & Comparator

They both are used for comparing two objects. They serve for different purposes.

- `Comparable` is used to sort objects in a natural order.

  1. Need to `implement` the `Comparable` interface and override the `compareTo()` method.

- `Comparator` is a functional interface used to sort objects in a custom order.
  1. We don't need to implement the `Comparator` interface, but we need to create a new class to implement the `Comparator` interface and override the `compare()` method.
  2. We can also use lambda expression to create a `Comparator` object.

## Optional

Optional object is used to handle NPE problems, handling values as ‘availableʼ or ‘not availableʼ instead of checking null values.

```
empty(): Returns an empty Optional object
of(): Returns an Optional with the specified present non-null value
ofNullable(): Returns an Optional with the specified value, if non-null, otherwise returns an empty Optional
isPresent(): Returns true if there is a value present, otherwise false
```

```Java
Optional result = xxxService.findById(id);
if (result.isPresent()) {
    return result.get();
} else {
    throw new Exception();
}
// for service
public Optional<xxx> findById(Long id) {
    return Optional.ofNullable(xxxRepository.findById(id));
}
```

## Stream API

Stream API is used to process collections of objects, it is a pipeline that performs a series of operations to the object to get the desired result.

### Terminal Operations & Intermediate Operations (API)

Intermediate operation is lazily executed and returns a stream as a result, thus can be pipelined. `filter()` , `map()` , `flatMap()` , `distinct()` , and `sorted()`.

flatMap() : It can transform data or flatten data, like flatten a 2d array to an array.

<img src= "/images/Full-Stack/JavaCore/StreamAPIIntermediate.png">

Terminal operation is eagerly executed and returns a non-stream result, thus ending the stream. `forEach()` , `count()` , `collect()` , `reduce()` , `allMatch()` , `anyMatch()` , `noneMatch()` , `findFirst()` , `findAny()`.

<img src= "/images/Full-Stack/JavaCore/StreamAPITerminal.png">

### Parallel Stream

By default, stream api is sequential, but we can set it to parallel.

Instead of using .stream(), use parallelStream() to create a parallel stream. Other operations are similar to the sequential stream. operations may be executed concurrently by multiple threads, which can lead to faster processing for certain tasks

# Design Pattern

## Singleton

There at most `one` instance exists during the application runtime. When there is a request, if the instance already exists, return the existing instance, else generate a new instance. Common example is the `bean scope` in Spring.

### How to create a Singleton

Use `static method` to create a singleton.

1. Eager initialization
   Advantage : `Simple` and `thread safe`
   Disadvantage: `Eager loaded` will cause memory waste, because the instance is created even if it is not used.

   ```Java
   public class Singleton {
       private static final Singleton instance = new Singleton();
       private Singleton() {}
       public static Singleton getInstance() {
           return instance;
       }
   }
   ```

2. Lazy initialization
   Advantage : `Lazy loaded`, only create instance when it is needed, saves memory.
   ```Java
    public class Singleton {
         private static Singleton instance;
         private Singleton() {}
         public static Singleton getInstance() {
              if (instance == null) {
                instance = new Singleton();
              }
              return instance;
         }
    }
   ```

### Singleton with thread safe

Singleton is not thread safe, we need to use `synchronized` keyword to make it thread safe.

```Java
public class ThreadSafeSingleton {
    private static ThreadSafeSingleton instance;
    private ThreadSafeSingleton() {}
    public static ThreadSafeSingleton getInstance() {
        // Double-Checked Locking used to avoid obtaining the lock every time the code is executed
        if (instance == null) {
            synchronized (ThreadSafeSingleton.class) {
                if (instance == null) {
                    instance = new ThreadSafeSingleton();
                }
            }
        }
        return instance;
    }
```

# Database

## JDBC & statement

JDBC is a Java API used to connect and execute query to the database.
It uses JDBC statements to execute queries.

There are three types of JDBC statements:

- `Statement`: Used to execute static SQL statements with no parameters. Actually we can pass parameters by concatenating strings, but this is not recommended because it is vulnerable to SQL injection attacks. Such as `SELECT * FROM users WHERE username = 'admin' OR 1=1;` will return all the users. So we should use `PreparedStatement` instead.

- `PreparedStatement`: Used to execute static SQL statements with parameters. we can use `?` to represent the parameters, and then use `setXXX()` method to set the parameters. It can prevent SQL injection attacks.

- `CallableStatement`: Used to execute stored procedures in database.

```Java
public static List<Trainee> getTraineesByPhoneNumber(String phone){
   List<Trainee> trainees = new ArrayList<>();

   // set up the connection
   Connection conn = null;
   PreparedStatement preparedStatement = null;

   try {
      // Register JDBC driver, open a connection
      Class.forName(JDBC_DRIVER);
      conn = DriverManager.getConnection(DB_URL, USER, PASSWORD);

      // Execute a query
      String query = "select * from trainee where phoneNumber = ? ";
      preparedStatement = conn.prepareStatement(query);
      preparedStatement.setString(1, phone);

      ResultSet resultSet = preparedStatement.executeQuery();

      // retrieve data from result set row by row
      while (resultSet.next()) {
            int id = resultSet.getInt("id");
            String firstName = resultSet.getString("firstName");
            String lastName = resultSet.getString("lastName");
            String phoneNumber = resultSet.getString("phoneNumber");
            String ssn = resultSet.getString("ssn");

            Trainee trainee = new Trainee(id, firstName, lastName, phoneNumber, ssn);
            trainees.add(trainee);
      }
      resultSet.close();
      // Clean-up environment, handle exceptions
   } catch (ClassNotFoundException | SQLException e) {
      e.printStackTrace();
   } finally {
      try {
            if (conn != null) {
               conn.close();
            }
            if (preparedStatement != null) {
               preparedStatement.close();
            }
      } catch (SQLException e) {
            e.printStackTrace();
      }
   }

   return trainees;
}
```

### Transaction Management

For transactions that cross service boundaries, see [Two-Phase Commit, Sagas, and Outbox](/blog/SystemDesign/2023-06-24-transaction-in-microservices).

`Transaction` is a set of operations that are executed as a single unit of work. If one operation fails, the whole transaction fails. In JDBC, the Connection interface provides methods to manage transactions. There are three methods in the Connection interface: `setAutoCommit()`, `commit()` and `rollback()`.

```Java
public static void main(String[] args) {

   Connection conn = null;
   Statement statement = null;

   try {
      Class.forName(JDBC_DRIVER);
      conn = DriverManager.getConnection(DB_URL, USER, PASSWORD);
      statement = conn.createStatement();

      // 1. setAutoCommit(false) to disable auto-commit mode
      conn.setAutoCommit(false);

      String query = "update Bank set balance = 100 where accountName = 'April'";
      statement.executeUpdate(query);
      // ... several other executions

      // 2. setAutoCommit false all the operations are grouped together and committed at once
      conn.commit();
      System.out.println("Transaction successfully committed");
      System.out.println(getCurrentBalances(statement));

   }
   catch (ClassNotFoundException | SQLException e) {
      e.printStackTrace();
   }
   catch (RuntimeException e) {
      try {
            System.out.println("rolling back ...");
            if (conn != null) {
               // 3. rollback if any exception occurs
               conn.rollback();
            }
      } catch (SQLException e1) {
            e1.printStackTrace();
      }
   }
   finally {
      try {
            if (conn != null) {
               conn.close();
            }
            if (statement != null) {
               statement.close();
            }
      } catch (SQLException e) {
            e.printStackTrace();
      }
   }
}
```

## JDBCTemplate

`JDBCTemplate` is a class in Spring JDBC, which is used to simplify the use of JDBC and avoid repetitive code.

All we need to do is pass the `SQL statment`, `RowMapper` and `parameters` to the `JDBCTemplate` object, and then it will fetch the data from database and convert it to the object according to the rowmapper.

main methods:

- `queryForObject`: return a single object
- `query`: return a list of objects
- `update`: update the database

## Hibernate

Hibernate is an ORM (Object Relational Mapping) framework, which is used to map the object-oriented domain model to the relational database.

### ORM

To configure Hibernate:

- Add the dependency in pom.xml

- Configure hibernate, we need a Hibernate `Configuration class`, inside it, we need to create a `sessionFactory` with the `dataSource`.

- Create entity class using `@Entity` and `@Table`, `@Id`, `@Column` `@GeneratedValue` to map objects to the database.

- To use it, we call sessionFactory.getCurrentSession to perform operations.

- To handle transactions, we can use @Transactional provided by Spring to handle transactions.

### Migration between different databases

Change database URL, driver, username, password, dialect

Dialect is used to generate the SQL statement according to the typr of database.

Driver is used to set up the connection between the application and the database.

### Entity State

- `transient` state, the entity instance is not attached to a session and has no corresponding rows in the database. It's usually just a new object that has been created to save to the database.

- `persistent` state, the entity instance is associated with a unique Session object (object already mapped to the database). Upon flushing the Session to the database, the entity is guaranteed to have a corresponding consistent record in the database.

- `detached` states, the entity instance was once attached to a Session, but now it’s not. An instance enters this state if it is evicted from the context, clear or close the Session, or put the instance through serialization/deserialization process.

### Fetching Strategies

- `Eager`: will fetch all attributes of an entity at once, including Aggregation / Composition.

- `Lazy`: **`Default`** will load the Aggregation / Composition fields only when requested. This can improve performance by reducing the amount of data retrieved from the database

`LazyInitializationException` occurs when accessing a lazily-loaded proxy outside the session. Hibernate is unable to fetch the data because the session has been closed. We can use eager fetching to prevent this from happening, or manually initialize the collection before the session closes.

### Hibernate Caching

There are two level Caching in Hibernate:

- `First level` cache provides caching at the session level. It is enabled by default. When you load an entity using a Session, Hibernate checks the first-level cache first to see if the entity is already loaded. If it's found in the cache, Hibernate returns the cached object, avoiding a database query. We can use session contains() to check if an obj is cached or not. get(). load() methods.

- `Second Level` cache is disabled by default, it is a higher level, cross-multi session. When query something, Hibernate will execute a query like select all fields from table where …, and cache all objects in second level cache, when hibernate need to query object by id, it will first check the first level cache, if not contains, then check the second level cache, if not contains too, it will fetch from database and put it into the second level cache. Second level cache is only used for querying by ID of Hibernate objects.

## JPA (Java Persistence API)

JPA is a `specification` of Java. It is used to persist data between Java object and relational database. It doesn't provide any implementation, so it need a `provider` to implement it like `Hibernate`, `EclipseLink`, `TopLink`, etc.

1.  ORM mapping between Java object and relational database

    - `@Entity` annotation is used to map Java object to relational database
    - `@Table` annotation is used to map Java object to relational database table
    - `@Column` annotation is used to map Java object to relational database column
    - `@Id` annotation is used to map Java object to relational database primary key
    - `@Transient` annotation is used to ignore the field when mapping Java object to relational database

2.  JPQL (Java Persistence Query Language)

    - JPQL is a query language which is used to query data from relational database
    - JPQL is similar to SQL, but it is object-oriented
    - JPQL is database independent

3.  EntityManager
    - EntityManager is used to manage the lifecycle of entity, and perform CRUD operations.

For the mapping and a working repository example, see [Spring Data JDBC and JPA](/blog/Java%26Spring/2023-04-13-SpringDataJPA#jpa-and-spring-data-repositories).

## Spring Data JPA

Spring Data JPA is a `framework` which is built on top of JPA. It is used to simplify the development of JPA application.

## Spring Data Repository

Spring Data Repository has different interfaces, and each interface is used to perform different operations.

1. `Repository` is the central interface in Spring Data repository abstraction. It is a `marker interface` to capture the types to work with and to help you to discover interfaces that extend this one. It is not used directly.

2. `CrudRepository` provides CRUD operations, it extends `Repository` interface.

   ```Java
   public interface CrudRepository<T, ID> extends Repository<T, ID> {
       // Note that the ID here is a serializable which represent the id of the Entity

       <S extends T> S save(S entity);
       Optional<T> findById(ID primaryKey);
       Iterable<T> findAll();
       long count();
       void delete(T entity);
       boolean existsById(ID primaryKey);
       // … more functionality omitted.
   }
   ```

3. `PagingAndSortingRepository` provides `pagination` and `sorting` operations, it extends `CrudRepository` interface.

   ```Java
   public interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {
       Iterable<T> findAll(Sort sort);
       Page<T> findAll(Pageable pageable);
   }
   ```

4. Query Feature

   Using Spring Data Repository, we can define the query method by using the naming convention. In this way, we don't need to write the query statement and the implementation of the query method.

   The machanism strips the prefixes `find…By`, `read…By`, `query…By`, `count…By`, and `get…By` from the method and starts parsing the rest of it.

   ```Java
   interface PersonRepository extends Repository<User, Long> {

   List<Person> findByEmailAddressAndLastname(EmailAddress emailAddress, String lastname);

   // Enables the distinct flag for the query
   List<Person> findDistinctPeopleByLastnameOrFirstname(String lastname, String firstname);
   List<Person> findPeopleDistinctByLastnameOrFirstname(String lastname, String firstname);

   // Enabling ignoring case for an individual property
   List<Person> findByLastnameIgnoreCase(String lastname);
   // Enabling ignoring case for all suitable properties
   List<Person> findByLastnameAndFirstnameAllIgnoreCase(String lastname, String firstname);

   // Enabling static ORDER BY for a query
   List<Person> findByLastnameOrderByFirstnameAsc(String lastname);
   List<Person> findByLastnameOrderByFirstnameDesc(String lastname);
   }
   ```

   We can also use `@Query` annotation to define the query method.

   ```Java
   interface PersonRepository extends Repository<User, Long> {
       @Query("select u from User u where u.emailAddress = ?1")
       User findByEmailAddress(String emailAddress);
   }
   ```

## NoSQL & MongoDB

SQL databases based on relational data models. well-defined structure with clear relationships and constraints

NoSQL (not only sql) databases use various data models, such as key-value, document, columnar, or graph. They provide flexible schemas that allow for dynamic and unstructured data. Like mongoDB, redis, Bigtable

Use Relational database:

- needs strong transactional support
- data has a well-defined structure with clear relationships
- requires complex queries involving multiple tables, joins, and aggregations

Use Non-Relational DB:

- Data is unstructured, like LinkedIn, user profile, each user may have different sections, if you put it in RDB, there will be many empty fields, so using Nosql will decrease the space and increase the speed for reading.
- Need high-speed read and write operations
- Distributed and Cloud Environments: NoSQL databases are well-suited for distributed and cloud-based architectures, allowing you to distribute data across multiple nodes or data centers.

# Spring

## Spring Framework & Spring Boot

### Spring Framework

<span id="spring-framework-ioc"></span>

Spring's IoC container creates and wires application components. Spring Framework also provides facilities for data access, MVC, AOP, and transaction management.

#### IoC container types

<span id="two-types-of-ioc-containers"></span>

`BeanFactory` provides the basic container services. `ApplicationContext` adds features such as resource loading, event publication, and commonly eager initialization of non-lazy singleton beans.

#### IoC container life cycle

The container reads bean definitions, instantiates beans, injects dependencies, and invokes initialization callbacks. Bean post-processors can act before or after initialization and may wrap beans with proxies. Container shutdown invokes destruction callbacks for beans whose lifecycle the container manages.

#### Bean & Bean scopes

<span id="bean-scopes"></span>

Singleton is the default and means one managed instance per bean definition per container. Prototype creates a new instance when requested from the container. In a web application, request and session scopes tie the instance to an HTTP request or session.

#### Dependency Injection (Ambiguous)

<span id="three-types-of-dependency-injection"></span>

Constructor injection makes required dependencies explicit. Setter injection can express optional dependencies. Field injection makes dependencies less visible. When several beans implement the same interface, use `@Qualifier` to select one or `@Primary` for a default candidate.

### Spring Boot

<span id="spring-boot-auto-configuration"></span>

Boot auto-configuration uses the classpath, application properties, and existing beans to configure common components. Starters group dependency sets for use cases such as web, security, and JDBC. `@SpringBootApplication` combines configuration, auto-configuration, and component scanning.

See [Spring Core and Boot](/blog/Java%26Spring/2023-04-07-Spring-Boot).

## Spring MVC

1. When requst coming, DispatcherServlet map the request to the corresponding controller method.

2. In controller, service, dao, the data is processed recording to the business logic.

3. After that, the controller will create a model object contains the data in a key-value pair way. Controller will return a string of the view name to the view resolver.

4. View resolver has two responsibilities, first is to add the prefix and suffix to the view name to find the jsp page, second is to reach the template to replace the variables with the data in the model object. After that, the view resolver will return the view to the front end.

## Spring AOP

**AOP is used to separate functionalities that are not related to the core business logic.** In another word, it is used to **decouple cross-cutting concerns** from the core business logic. (e.g. logging, exception handling)

Spring AOP works by **using `proxy` to wrap the object being called.** The proxy is created by the Spring container and is used to intercept the calls to the object being proxied.

### 2.1. Join Point

`Join point` is a point in the execution of the application where an aspect can be plugged in. In another word, **it is the `unit of point` can be monitored.**

This point could be a `method being called`, an `exception being thrown`, or even a `field being modified`. In Spring AOP, a join point always represents a method execution.

### 2.2. Pointcut (Designator)

`Pointcut` is a predicate or expression that matches join points. It is a set of join points where `advice` should be executed.

### 2.3. Advice

`Advice` is the action taken by an aspect at a particular join point. Different types of advice include `before`, `after`, `after-returning`, `after-throwing`, and `around` advice.

### 2.4. Aspect

`Aspect` is a module that encapsulates join points, pointcuts, and advice. It is a class that implements cross-cutting concerns.

## Spring Security

`Spring Security` is a framework to protect our endpoints.

1. user want to login in with username and password: first it will be filtered by the filter chain.

- UserDetailsService loadUserByUsername() to load user information from database, and then compare the credentials.

- AuthenticationManager authenticate() to authenticate the user and generate UserDetails object with GrantedAuthority.

- JwtTokenUtil generateToken() to generate token with UserDetails.

2. user want to access the endpoint with token: first it will be filtered by the filter chain.

- JwtTokenUtil resolve() the token from request and generate the userDetails object.

- generate authentication object and set the authentication object to SecurityContext.

For authroization, we can use `@PreAuthorize("hasRole('ROLE_ADMIN')")` or `@PreAuthorize("hasAuthority('unverified')")` to check the role of the user. Also, we can use `@AuthenticationPrincipal UserDetails userDetails` to get the user details in the controller.

### JWT (JSON Web Token)

JWT is a standard that allows you to encode data in a JSON format. It is often used to encode authentication information, like the username, the permissions, etc. It is often used in combination with OAuth2.

JWT mainly contains three parts:

- Header: contains information about the type of token and the hashing algorithm used to sign the token.

- Payload: contains the claims, which are statements about an entity (typically, the user) and additional data. Claims can be things like the username, the permissions, etc.

- Signature: is used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn’t changed along the way. (Created by hashing the header and the payload with a secret key)

## Spring Scheduler (cron expression)

execute tasks for each period of time. `@Scheduled` annotation is used to specify the cron expression.

- `@Scheduled(fixedRate = 1000)`: execute the task every 1000ms.
- `@EnableScheduling`: enable the scheduling in the application.

What if two servers are running the same task? How to `avoid duplicate execution`?

Distributed Lock: use `Redis` to implement distributed lock. Acquire a distributed lock before executing the scheduled task.

## Cache - (stale data)

Problem: When we update the data in the database, the cache is not updated. So the data in the cache is stale.

- Set expiration times for cached items.
- Use `@CacheEvict` to remove the cache when updating the data.
- Use `@CachePut` to update the cache when updating the data.

## Spring Profile (switch between different environments)

Spring profile is used to `configure` the application for different environments.

We can use `@Profile` to specify the profile for the class or method. We can use `spring.profiles.active` to specify the active profile in the application.properties file.

- Add `@Profile` annotation to the configuration class.

  ```java
    @Configuration
    @Profile("dev")
    public class DevConfig {
        // ...
        @Value("${spring.datasource.url}")
        private String url;
    }
  ```

- Add `spring.profiles.active` in `application.properties` file.

  ```properties
    spring.profiles.active=dev
  ```

## Rest Controller & Input Validation (BindingResult) & RestTemplat

### @RestController VS @Controller

`@RestController` is a convenience annotation that combines `@Controller` and `@ResponseBody`. It is used for building RESTful web services that return data in response to HTTP requests in JSON/XML. We don't need to add `@ResponseBody` to our request mapping methods one by one.

`@Controller` is a common annotation that is used to mark a class as Spring MVC Controller while `@ResponseBody` is used to indicate that the return value of a method should be used as the response body of the request.

### @RequestBody VS @ResponseBody

`@RequestBody` is used to map the content of an HTTP request body to a Java object, so you can access the data sent by the request in Java.

`@ResponseBody` is used to map the return value of a method to an HTTP response body, so you can return Java objects as data in the response.

### How to validate the values of the request body? How does BindingResult work?

1. For the DTO classes, we can use `@NotNull`, `@NotEmpty`, `@Size`, etc. to validate the values of the fields.

2. In the controller method, we can use `@Valid` to validate the values of the request body.

`BindingResult` is used to validate the values of the request body. It is used to store the result of the validation and has to be placed right after the request body parameter. We can use `hasErrors()` to check if there is any error and handle the error in the way we want.

### RestTemplate

`RestTemplate` is a tool provided by Spring to simplify the HTTP request to external Restful API.

The advantage is that it is easy to use, but the disadvantage is that the request URL is hardcoded, not good for decoupling. Also, it is synchronous, which means that the thread will be blocked until the request is finished.

## RESTFul API 6 principles

Review the resource contract and statelessness constraints in [API and Service Communication](/blog/ComputerNetwork/2023-04-12-RESTFulAPI#restful-api-6-principles).

## SOAP

Review the envelope and the HTTP transport in [REST vs SOAP](/blog/ComputerNetwork/2023-04-12-RESTFulAPI#soap).

# Testing

## Mockito

`Mockito` is a `mocking framework` used for `unit testing` of Java applications. When we write unit tests, we need to mock the `external dependencies`. Mockito provide an easy way to mock the dependencies.

### Difference between `@Mock`, `@Spy`, `@InjectMocks`

`@Mock` is used to create and inject mocked instances. Often used to mock the dao layer. It will not call the real method inside.

`@InjectMocks` will inject the mocked instances into the tested object automatically. Often used to mock the service layer. It will call the real method inside. (suppose we are testing service layer, the service should be marked as `@InjectMocks`. becasue we need to run the logic inside each method)

`@Spy` is used to create and inject partially mocked instances. It will call the real method inside. It is used when we want to call the real method and perform some logic inside the method. like sending an email and then test if the email is sent successfully.

### What is the difference between `@Mock` and `@MockBean`? (same with `@Spy` and `@SpyBean`)

They both are used to create a fake object. `@Mock` create object not related to the spring framework.

When testing controller, it need us to start the Spring Boot application. We use `@MockBean` to create a fake object that is part of the Spring context. such as beans declared in the application's configuration or beans created by Spring Boot auto-configuration.

### ArgumentCaptor receive the parameter of the mocked method

We can use `ArgumentCaptor` to capture the parameter of the mocked method.

```Java
@Captor
private ArgumentCaptor<User> userCaptor;

@Test
public void testCreateUser() {
   User user = new User();
   user.setName("Chris");
   user.setEmail("xx@gmail.com");
   userService.createUser(user);
   verify(userDao).save(userCaptor.capture());
   assertEquals("Chris", userCaptor.getValue().getName());
}
```

# Microservices and cloud

## AWS Lambda & Step Functions

AWS Lambda is a computer service that allows us to run code without deploying and managing server. It is event-driven. Events, such as `changes in an S3 bucket` or an `API Gateway request`, trigger the execution of this function. It is used to run small tasks like `get real time data flow`, with 15 minutes maximum execution time.

AWS Step function is a serveless workflow service which allows us to coordinate multiple tasks such as lambda functions. With the help of step functions we can easily visualize our lambda function workflow and make adjustments based on our needs.

Limitation : limited memory and tempary storage. max execution time is 15 minutes. should optimize the usage of lambda or it will be expensive.

## Monolithic vs Microservices

Which one to use depends on the business requirements and the size of the application.

### Monolith

Monolithic means asingle server handle multiple business logic. It is tightly coupled. It is suitable for small applications that do not need to scale or handle high throughput. It is easy to develop and deploy compared to microservices.

### Microservices

Microservice is a distributed architecture, each service responsible for a single business logic. It is loosely coupled which is easy to add more features and scale specific components independently. The disadvantage is that it needs well designed and more complex to develop.

## Communication between Microservices

### Synchronous Communication

#### HTTP Requests

Microservices communicate with each other using HTTP requests. Each microservice has its own REST API. In Spring Boot, we can use the `RestTemplate` class to make HTTP requests.

#### Eureka and Feign

`Eureka` is a service registration tool. It allows microservices to register themselves and discover other services. Each service send a heartbeat to Eureka to let it know that it is still alive. If Eureka does not receive a heartbeat from a service, it will remove it from its registry.

`Feign` is a REST client to make HTTP requests to other microservices without using `RestTemplate`. It uses Eureka to discover other services. In this way, we can make HTTP requests to other services without hardcoding the URL, also simplifying the code.

### Asynchronous Communication

#### Message Brokers

We can use a `message broker` like `RabbitMQ` or `Kafka` to send messages between microservices to communicate `Asychonously`.

For example, when a user creates a new account, we can send a message to the email service to send a welcome email and to the notification service to send a notification to the user.

## API Gateway

A gateway exposes a stable service entry point and can route, authenticate, or rate-limit requests. See [API gateways and service discovery](/blog/DistributedSystem/2024-08-05-Failures-in-distributed-systems#api-gateways-and-service-discovery).

## Application Monitoring (Actuator & Eureka)

<span id="application-monitoring-actuator-euraka"></span>

Spring Boot Actuator exposes configured application health and metrics. Eureka registers services and helps callers locate instances. See [Spring profiles and observability](/blog/Java%26Spring/2023-06-19-monitoring#monitoring-with-actuator-metrics-and-logs).

## Microservices Debug (Logging & Distributed Tracing)

Use a trace ID to follow a request across services and match relevant log events in a centralized store. See [distributed tracing](/blog/DistributedSystem/2024-10-05-Splunk-Logging#distributed-tracing).

## Kafka

Review producers, brokers, topics, partitions, and consumer groups in [Kafka: Partitions and Delivery Guarantees](/blog/DistributedSystem/2024-06-15-kafka-basic#topics-partitions-and-consumer-groups).

## Fault-Tolerance

Time out calls that exceed their budget, use circuit breakers to limit repeated calls to failing dependencies, and route traffic to healthy instances. See [cascading failures and fault tolerance](/blog/DistributedSystem/2024-08-05-Failures-in-distributed-systems#cascading-failures-and-fault-tolerance).
