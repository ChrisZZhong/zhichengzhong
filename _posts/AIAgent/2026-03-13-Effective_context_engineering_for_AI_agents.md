---
title: "Anthropic - Effective context engineering for AI agents"
date: 2026-03-12
description: "Notes on Anthropic - Effective context engineering for AI agents"
tag: AIAgent
prime: false
pinned: true
---

# Introduction

Context is essential to AI agents, but it is a finite resource. This article explores how to gather and manage the context that drives agents effectively. [Source article](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

Prompt engineering has long been a focus in applied AI. Now a new term, context engineering, is emerging. Building with language models is becoming less about finding the right words for a prompt and more about answering a broader question: **“What configuration of context is most likely to produce the behavior we want from our model?”**

Context is the set of tokens included when sampling from a large language model (LLM). The engineering challenge is to make those tokens as useful as possible within the LLM's inherent constraints, so that it consistently produces the desired results. Managing an LLM effectively often means thinking in terms of context: its overall state at any given moment and the behavior that state might produce.

## Context engineering vs. prompt engineering

At Anthropic, we view context engineering as a natural extension of prompt engineering. Prompt engineering is about writing and organizing instructions for an LLM to get the best results. Context engineering is the set of strategies for managing and maintaining the best collection of tokens, or information, during inference, including everything beyond the prompt itself.

Prompt engineering mainly focuses on writing effective prompts, especially system prompts. But as we build more capable agents that operate over multiple inference rounds and longer periods, we need **strategies for managing the entire context state: system instructions, tools, Model Context Protocol (MCP), external data, message history, and more.**

<img src = '/media/AIAgent/faa261102e46c7f090a2402a49000ffae18c5dd6-2292x1290.png'>

Although LLMs are fast and can handle growing amounts of data, we have observed that, like humans, they eventually lose focus or become confused. Research on needle-in-a-haystack benchmarks illustrates **context rot**: as the number of tokens in the context window grows, the model becomes less able to recall information from it accurately.

This scarcity of attention comes from architectural constraints. LLMs use the Transformer architecture, in which each token can attend to every other token in the context. For n tokens, that creates n² pairwise relationships.

With a limited attention budget, good context engineering means finding the smallest possible set of high-signal tokens that maximizes the likelihood of the desired outcome. That is easier said than done. The following sections explain what this principle means for different parts of the context.

## System prompts

System prompts should be extremely clear, use straightforward language, and present concepts at the right level of abstraction for the agent. That level sits in a sweet spot between two common failure modes.

At one extreme, engineers hard-code complicated, brittle logic into prompts to control agent behavior precisely. This makes the system fragile and increasingly difficult to maintain. In other words, do not lock everything into IF-ELSE rules.

At the other extreme, engineers give vague, overly general guidance that offers no concrete signal about the expected output, or incorrectly assumes shared context.

The right level balances specificity and flexibility: concrete enough to guide behavior, yet flexible enough to give the model useful heuristics.

<img src = '/media/AIAgent/0442fe138158e84ffce92bed1624dd09f37ac46f-2292x1288.png'>

We recommend organizing prompts into distinct sections, such as `<background_information>`, instructions, `## Tool guidance`, and `## Output description`, separated by XML tags or Markdown headings. The exact format may matter less as models become more capable.

Whatever the structure, aim for the minimum information that fully describes the desired behavior. Minimum does not necessarily mean short: the agent still needs enough information up front to behave as intended. Start by testing a minimal prompt with the best model, see how it performs on your task, then add clear instructions and examples to address the failure modes you observe.

## Tools

Tools let agents interact with their environment and acquire new context as they work. Since tools define the contract between an agent and its space of information and actions, they must promote efficiency in two ways:

- Return information efficiently.
- Encourage the agent to behave efficiently.

One common failure mode is an oversized toolset that covers too much or leaves ambiguous choices about which tool to use. If a human engineer cannot clearly tell which tool fits a situation, we should not expect an agent to do better. As discussed below, a carefully chosen minimum viable toolset also makes context easier to maintain and trim reliably over long interactions.

**Providing examples**, also known as few-shot prompting, is a well-established practice we strongly recommend. Teams often overload prompts with edge cases in an attempt to describe every rule an LLM should follow. We recommend the opposite: carefully select a diverse set of representative examples that demonstrate the intended behavior. For an LLM, an example can be worth a thousand words.

Be deliberate: keep context informative, concise, and clear. Next, let's look at dynamically retrieving context at runtime.

## Context retrieval and autonomous search

We have gravitated toward a simple definition of an agent: an LLM that autonomously uses tools in a loop.

Instead of processing all relevant data in advance, agents using a **just-in-time** approach maintain lightweight identifiers, such as file paths, saved queries, and web links. They use those references to load data dynamically into context through tools at runtime. Claude Code, Anthropic's agentic coding solution, uses this approach for complex analysis of large databases. The model can write targeted queries, save results, and use Bash commands such as head and tail to analyze large datasets without loading entire data objects into context. This resembles human cognition: we usually do not memorize a whole information repository. We rely on external organization and indexing systems, such as file systems, inboxes, and bookmarks, to retrieve information when needed.

Beyond storage efficiency, the metadata attached to these references can guide behavior through both explicit and implicit signals. For an agent working in a file system, test_utils.py in a tests directory serves a different purpose from a file with the same name in src/core_logic/. Directory hierarchies, naming conventions, and timestamps help both people and agents understand how and when to use information.

Allowing agents to navigate and retrieve data autonomously also enables progressive disclosure: they discover relevant context through exploration. Every interaction supplies context for the next decision. File size suggests complexity, names suggest purpose, and timestamps offer clues about relevance. Agents build understanding layer by layer, keeping only what they need in working memory and using notes for persistence. This self-managed context window keeps attention on relevant information instead of overwhelming the model with lengthy but potentially irrelevant material.

There is a trade-off: exploration at runtime is slower than retrieving precomputed data. It also takes careful design and planning to give the LLM appropriate tools and heuristics for navigating its information environment. Without guidance, an agent can waste context by misusing tools, following dead ends, or overlooking crucial information.

In some cases, the most effective approach is a hybrid: retrieve some data in advance for speed, then let the agent decide what else to explore. The right degree of autonomy depends on the task. Claude Code follows this hybrid model: CLAUDE.md files are placed into context up front, while basic tools such as glob and grep let it navigate the environment and retrieve files just in time, avoiding problems with stale indexes and complex syntax trees.

Hybrid strategies may be better suited to settings with less dynamic content, such as legal or financial work. As models improve, agent designs will increasingly let intelligent models act autonomously with less manual intervention. Given how quickly this field changes, “do the simplest thing that works” is likely to remain our best advice to teams building agents with Claude.

## Context engineering for long-running tasks

Long-horizon tasks require an agent to stay coherent, retain context, and pursue its goal across sequences of actions that exceed the LLM's context window. Tasks involving tens of minutes to hours of continuous work, such as large codebase migrations or comprehensive research projects, need techniques specifically designed to overcome context limits.

Waiting for larger context windows may seem like the obvious strategy. Yet context rot and relevance problems are likely to affect windows of any size for the foreseeable future, at least when agents need to perform at their best. To keep agents effective over longer periods, we have developed techniques that address these limitations directly:

- Compaction
- Structured note-taking
- Sub-agent architectures

### Compaction

**Preserve recall first, then remove redundancy to improve precision.**

Compaction summarizes a conversation as it approaches the context limit and starts a fresh context window with that summary. It is often the first approach to maintaining coherence over long tasks. The goal is to distill context with high fidelity so the agent can continue with minimal loss of performance.

In Claude Code, for example, we pass message history to a model to summarize and compress the most important details. It preserves architectural decisions, unresolved bugs, and implementation details while discarding redundant tool output and messages. The agent then continues with this compacted context and the five most recently accessed files. Users get a continuous experience without having to manage context-window limits themselves.

The art lies in deciding what to keep and what to discard. Overly aggressive compaction can lose subtle but critical context whose importance becomes clear only later. Engineers implementing compaction should tune their prompts carefully against complex agent trajectories. First maximize recall, ensuring that the summary captures all relevant information; then iterate to improve precision by removing redundancy.

### Structured note-taking

Structured note-taking, or agent memory, means that an agent periodically writes notes to storage outside its context window. Those notes are brought back into context later.

This provides persistent memory with little overhead. Whether Claude Code maintains a to-do list or a custom agent keeps a NOTES.md file, this simple pattern lets agents track progress on complex tasks and retain key context and dependencies that would otherwise be lost across dozens of tool calls.

After a context reset, the agent reads its notes and resumes hours-long training sequences or dungeon exploration. Continuity across summarization steps makes long-term strategies possible in a way that keeping everything in the LLM's context window alone does not.

### Sub-agent architectures

Sub-agent architectures offer another way around context limits. Instead of one agent maintaining the state of an entire project, specialized sub-agents handle focused tasks in fresh context windows. The main agent coordinates the high-level plan, while sub-agents do detailed technical work or use tools to find relevant information. A sub-agent may explore extensively, consuming tens of thousands of tokens or more, yet return only a concise summary, typically 1,000–2,000 tokens.

This separates responsibilities: detailed search context stays within the sub-agents, while the main agent focuses on synthesis and analysis. We discussed this pattern in “How we built our multi-agent research system,” where it significantly outperformed a single-agent system on complex research tasks.

### Summary

The right technique depends on the task. For example:

- Compaction maintains conversational continuity in tasks with extensive back-and-forth.
- Note-taking works well for iterative development with clear milestones.
- Sub-agent architectures handle complex research and analysis where parallel exploration pays off.

Context engineering represents a fundamental shift in how we build with LLMs. As models improve, the challenge extends beyond crafting a perfect prompt to arranging information so it fits within the model's limited attention budget at each step. Whether compacting information for long-running tasks, designing token-efficient tools, or letting agents explore their environment just in time, the principle is the same: find the smallest set of high-signal tokens that maximizes the likelihood of the desired outcome.

These techniques will evolve as models improve. We already see smarter models requiring less prescriptive engineering, allowing agents to operate more autonomously. Even so, treating context as a valuable, finite resource remains essential to building reliable and effective agents.

