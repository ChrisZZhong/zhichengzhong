---
title: "Anthropic - Building effective agents"
date: 2026-03-12
description: "Notes on Anthropic - Building effective agents"
tag: AIAgent
prime: false
pinned: true
---

# Introduction

This article shares lessons from working with customers and building agents ourselves, along with practical advice for developers building effective agents.

## Agent VS Workflows

two types of agentic systems:

- Workflows are systems where LLMs and tools are orchestrated through predefined code paths.

- Agents, on the other hand, are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks.

## Building block: the augmented LLM

The basic building block of agentic systems is an LLM enhanced with augmentations such as retrieval, tools, and memory.

<img src='/media/AIAgent/d3083d3f40bb2b6f477901cc9a240738d3dd1371-2401x1000.png'>

Two things to focus on during development:

1. Customize capabilities to fit your needs (MCP, A2A).
2. Give the LLM interfaces that are easy to use and well documented.

### Agent Harness Engineering

The overview below shows where orchestration, tool execution, state, and observability fit in a larger agent application.

![Agent harness architecture reference](/media/AIAgent/Agent_Architecture.jpg)

## Five workflow patterns

### 1) Prompt chaining

Prompt chaining breaks a task into a sequence of steps, with each LLM call processing the previous call's output. I think of this as COT — chain of thought.

<img src = '/media/AIAgent/7418719e3dab222dccb379b8879e1dc08ad34c78-2401x1000.png'>

When to use this workflow: it works well when a task can be cleanly and easily divided into fixed subtasks. The main goal is to trade latency for higher accuracy by making each LLM call simpler.

Examples of prompt chaining:
- Write a document outline, check that it meets specific criteria, and then write the document from that outline.
- Write marketing copy, then translate it into another language.

### 2) Routing

Routing classifies an input and directs it to a specific downstream task. This separates concerns and allows more targeted prompts. Without it, optimizing for one kind of input can hurt performance on others.

<img src = '/media/AIAgent/5c0c0e9fe4def0b584c04d37849941da55e5e71c-2401x1000.png'>

When to use this workflow: routing suits complex tasks with distinct categories that are best handled separately, where an LLM or a conventional classification model or algorithm can classify inputs accurately.

Examples of routing:
- Direct different customer service requests (general questions, refunds, technical support) to different downstream workflows, prompts, and tools.
- Choose models based on question difficulty: route simple or common questions to smaller, cost-effective models such as Claude Haiku 4.5, and difficult or unusual questions to more capable models such as Claude Sonnet 4.5 to optimize performance.

### 3) Parallelization

LLMs can sometimes work on a task simultaneously, with their outputs aggregated programmatically. This workflow has two main forms:

- Sectioning: split a task into independent subtasks that can run in parallel.
- Voting: run the same task multiple times to obtain different outputs.

<img src = '/media/AIAgent/406bb032ca007fd1624f261af717d70e6ca86286-2401x1000.png'>

When to use this workflow: parallelization is useful when independent subtasks can run concurrently for speed, or when multiple perspectives or attempts produce a result with higher confidence. For complex tasks with several dimensions, LLMs often perform better when a separate call handles each dimension, keeping attention focused on that particular aspect.

Examples of parallelization:
- sectioning:
    - Implement guardrails with one model instance handling the user's query and another screening for inappropriate content or requests. This often works better than having a single LLM call handle both guardrails and the core response.
    - Automate LLM evaluations, with each call evaluating a different aspect of the model's performance on a given prompt.
- Voting:
    - Review code for vulnerabilities using several different prompts, flagging the code when a problem is found.
    - Assess whether content is inappropriate using multiple prompts to evaluate different aspects, or vary voting thresholds to balance false positives and false negatives.
    
### 4) Orchestrator-workers
 
In this workflow, a central LLM dynamically breaks down a task, delegates subtasks to worker LLMs, and combines their results.

When to use this workflow: it fits complex tasks where the necessary subtasks are hard to predict. In coding, for example, both the number of files to change and the nature of each change depend on the task. Its topology resembles parallelization, but the key difference is flexibility: subtasks are determined by the orchestrator from the input, rather than defined in advance. Think coding agents.

Examples of orchestrator-workers:

- Coding products that make complex changes across multiple files on each task.
- Search tasks that gather and analyze information from multiple sources to find potentially relevant material.

### 5) Evaluator-optimizer

In this workflow, one LLM call generates a response while another evaluates it and provides feedback, forming a loop.

When to use this workflow: it works especially well when evaluation criteria are clear and iterative refinement adds measurable value. Two signs of a good fit: human feedback can noticeably improve an LLM's response, and the LLM can provide that kind of feedback itself. This resembles a human writer's iterative process of drafting and polishing an article.

- Literary translation, where an LLM translator may miss subtle nuances on the first pass, but an LLM evaluator can offer useful criticism.

- Complex search tasks that require several rounds of searching and analysis to gather comprehensive information, with an evaluator deciding whether further searches are necessary.

## Agents

Agents are increasingly being used in production as key LLM capabilities mature: understanding complex inputs, reasoning and planning, using tools reliably, and recovering from errors. An agent starts with instructions from a human or an interactive discussion. Once the task is clear, it plans and acts independently, potentially returning to the human for more information or judgment. At each step, it needs ground truth from the environment, such as tool results or code execution, to assess its progress. It can pause at checkpoints or obstacles for human feedback. A task usually ends when completed, but stopping conditions, such as a maximum iteration count, are often added to maintain control.

Agents can handle complex tasks, yet their implementations are often simple: an LLM using tools in a loop based on environmental feedback. That makes a clearly designed toolset and thorough documentation essential.

The diagram below resembles ReAct (a reasoning–action loop).

<img src = '/media/AIAgent/58d9f10c985c4eb5d53798dea315f7bb5ab6249e-2401x1000.png'>

## Combining the patterns
These building blocks are not mandatory recipes. They are general patterns that developers can adapt and combine for different use cases. As with any LLM capability, success depends on measuring performance and iterating. Again: add complexity only when it meaningfully improves results.

## Follow three core principles

1. Keep agent designs simple.
2. Improve transparency by making the agent's planning steps explicit.
3. Carefully design the agent-computer interface (ACI) through thorough tool documentation and testing.