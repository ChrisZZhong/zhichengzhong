---
title: "Anthropic - Demystifying evals for AI agents"
date: 2026-04-14
description: "Notes on Anthropic - Demystifying evals for AI agents"
tag: AIAgent
prime: false
pinned: true
---

# Introduction [Source article](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

The capabilities that make agents useful also make them difficult to evaluate. An evaluation strategy that works across deployment settings combines techniques to match the complexity of the system being assessed.

Effective evaluations help teams release AI agents with confidence. Without them, teams can fall into a reactive cycle: problems appear only in production, and fixing one failure creates another. Evals reveal problems and behavioral changes before users encounter them, and their value accumulates throughout an agent's lifecycle.

As discussed in [Building effective agents](https://www.zhichengzhong.com/blog/AiAgent/2026-03-12-Building_effective_agents), agents work across multiple turns, calling tools, changing state, and adapting to intermediate results. The autonomy, intelligence, and flexibility that make them useful also make them harder to evaluate.

Through internal development and work with customers at the forefront of agent development, we have learned how to design more rigorous and useful evaluations. The following approaches have worked across agent architectures and real-world deployments.

## The structure of an evaluation

An evaluation, or eval, tests an AI system by giving it input and applying grading logic to its output to measure success. This article focuses on automated evals that can run during development without real users.

<img src = '/media/AIAgent/bd42e7b2f3e9bb5218142796d3ede4816588dec0-4584x2834.png'>

- **Single-turn evaluations** are straightforward: one prompt, one response, and grading logic.

In a simple eval, the agent processes a prompt and a grader checks whether its output meets expectations. In a more complex multi-turn eval, a coding agent receives tools, a task (building an MCP server in this example), and an environment. It runs an agent loop of tool calls and reasoning, updating the environment with its implementation. Unit tests then check whether the MCP server works.

- **Agent evaluations** are more complex. Agents use tools across multiple turns, change environmental state, and adapt as they go, so errors can propagate and accumulate. Frontier models can also find creative solutions beyond the assumptions of static evals. For example, Opus 4.5 solved a flight-booking problem in 𝜏2-bench by finding a loophole in the policy. It “failed” the specified evaluation while actually offering the user a better solution.

Agent evaluations are more complex. Agents use tools across multiple turns, change environmental state, and adapt as they go, so errors can propagate and accumulate. Frontier models can also find creative solutions beyond the assumptions of static evals. For example, Opus 4.5 solved a flight-booking problem in 𝜏2-bench by finding a loophole in the policy. It “failed” the specified evaluation while actually offering the user a better solution.

We use the following definitions when building agent evals:

<img src = '/media/AIAgent/0205b36f9639fc27f2f6566f73cb56b06f59d555-4584x2580.png'>

1. A `task`, also called a `problem` or `test case`, is a single test with defined inputs and success criteria.

2. A `trial` is one attempt to complete a task. Because model outputs vary between runs, we run multiple trials to obtain more consistent results.

3. A `grader` is logic that scores some aspect of agent performance. A task can have several graders, each containing multiple assertions, sometimes called `checks`.

4. A `transcript`, also called a `trace` or `trajectory`, is the complete record of a trial: outputs, tool calls, reasoning, intermediate results, and other interactions. For the Anthropic API, this is the full message array at the end of the evaluation, containing every API call and response during the run.

5. An `outcome` is the final state of the environment after a trial. A flight-booking agent may end its transcript with “Your flight has been booked,” but the outcome depends on whether the corresponding reservation exists in the environment's SQL database.

6. An `evaluation harness` is the infrastructure that runs an evaluation end to end. It supplies instructions and tools, runs tasks concurrently, records each step, grades outputs, and aggregates results.

7. An `agent harness`, or `scaffold`, enables a model to operate as an agent: it handles input, coordinates tool calls, and returns results. Evaluating an “agent” really means evaluating the model and harness together. Claude Code, for example, is a flexible agent harness. We used its core components through the Agent SDK to build our harness for long-running agents.

8. An `evaluation suite` is a collection of tasks designed to measure specific capabilities or behaviors, usually with a shared overall goal. A customer support suite might test refunds, cancellations, and escalation workflows.

## Why build evaluations?

Teams can make surprising progress early on through manual testing, internal use, and intuition. Rigorous evals may even feel like overhead that slows releases. Beyond the prototype stage, however, development without evals breaks down as the agent enters production and scales.

A turning point often comes when users say an agent feels worse after a change. The team is left guessing and checking. Debugging becomes reactive: wait for feedback, reproduce the problem manually, fix it, and hope nothing else regressed. Without evals, teams cannot separate real regressions from noise, automatically test changes against hundreds of scenarios before release, or measure improvements.

We have seen this progression repeatedly. Claude Code initially developed through rapid iteration on feedback from Anthropic employees and external users. We later added evals for specific concerns such as concision and file editing, then expanded to more complex behaviors such as overengineering. These evals uncover issues, guide improvements, and focus collaboration between research and product teams. Together with production monitoring, A/B testing, and user research, they provide the signals needed to improve Claude Code as it scales.

Writing evals is useful at every stage of an agent's lifecycle. Early on, it forces the product team to define success. Later, it helps maintain a consistent quality standard.

Descript's agent helps people edit videos, so its evals cover three dimensions of successful editing: avoid breaking functionality, follow instructions, and do high-quality work. The team moved from human grading to LLM graders using product-defined rubrics and regular human calibration. They now regularly run separate suites for quality benchmarking and regression testing. Bolt AI started building evals after its agent was already widely used. In just three months, the team built a system that runs the agent, grades output through static analysis, tests applications with browser agents, and uses LLM judges to assess behaviors such as instruction following.

Some teams create eval cases at the start; others add them while scaling, once the lack of evals becomes a bottleneck. Early evals are especially valuable because they explicitly encode expected behavior. Two engineers reading the same initial specification may disagree about how the AI should handle edge cases. An eval suite resolves that ambiguity. Whenever they are introduced, evals help accelerate development.

Evals also determine how quickly you can adopt new models. When a stronger model arrives, teams without evals may spend weeks testing it. Competitors with evals can identify its strengths, adjust prompts, and upgrade within days.

Once the system is in place, benchmarking and regression tracking come along with it: latency, token usage, cost per task, and error rates can all be tracked over a fixed task set. Evals can also become a high-bandwidth communication channel between product and research, defining metrics researchers can optimize. Their benefits extend beyond tracking regressions and improvements. Because the costs appear up front while the benefits accumulate later, their compounding value is easy to underestimate.

## How to evaluate AI agents

The following sections describe proven techniques for evaluating agents. Use them as a starting point and adapt them to your domain.

### Three types of graders for agents

Agent evals typically combine three kinds of graders:

- Code-based graders
- Model-based graders
- Human graders

Each assesses some part of the transcript or outcome. Choosing the right grader is central to effective evaluation design.

#### Code-based graders

Methods:
- String matching (exact, regex, fuzzy, and so on)
- Binary tests (fail-to-pass, pass-to-pass)
- Static analysis (lint, types, security)
- Outcome verification
- Tool call verification (tools used and parameters)
- Transcript analysis (turn count and token usage)

Pros:
- Fast
- Inexpensive
- Objective
- Reproducible
- Easy to debug
- Verify specific conditions

Cons:
- Can reject valid variations that do not match the expected pattern
- Miss nuance
- Limited ability to assess subjective tasks


#### Model-based graders

Methods:
- Rubric-based scoring
- Natural language assertions
- Pairwise comparison
- Reference-based evaluation
- Multi-judge consensus

Pros:
- Flexible and scalable
- Capture nuance
- Handle open-ended tasks
- Handle freeform output

Cons:
- Non-deterministic
- More expensive than code
- Require calibration against human graders for accuracy

#### Human graders

Methods:
- Subject-matter expert (SME) review
- Crowdsourced judgment
- Spot-check sampling
- A/B testing
- Inter-annotator agreement

Pros:
- Gold-standard quality
- Match expert user judgment
- Calibrate model-based graders

Cons:
- Expensive
- Slow
- Often require access to human experts at scale

## Capability vs. regression evals

`Capability or “quality” evals` ask, “What can this agent do well?” They should begin with low pass rates and target tasks the agent finds difficult, giving the team a challenge to work toward.

`Regression evals` ask, “Can the agent still handle everything it could before?” Their pass rates should be close to 100%. They guard against backsliding: a lower score signals that something has broken and needs attention. Run regression evals alongside capability evals so improvements in one area do not introduce problems elsewhere.

After an agent launches and improves, capability evals with high pass rates can graduate into a continuously running regression suite. A task that once asked “Can we do this at all?” now asks “Can we still do it reliably?”

> In other words, first establish a capability through capability evals, then use regression evals to ensure the agent can keep completing the task reliably.

### Evaluating coding agents

Coding agents write, test, and debug code, navigating repositories and running commands like human developers. Effective evals usually depend on clearly specified tasks, stable test environments, and thorough tests of the generated code.

`Deterministic graders` are a natural fit for coding agents because software is often straightforward to evaluate: does it run, and do the tests pass? SWE-bench Verified and Terminal-Bench are two widely used benchmarks that follow this approach. SWE-bench Verified gives agents GitHub issues from popular Python repositories and runs test suites against their solutions. A solution passes only if it fixes failing tests without breaking existing ones. In one year, LLM scores rose from 40% to over 80% on this evaluation. Terminal-Bench takes a different approach, testing end-to-end technical tasks such as building a Linux kernel from source or training a machine learning model.

Once pass/fail tests verify the key outcomes of a coding task, it is often useful to grade code quality as well. Heuristic rules can assess qualities beyond passing tests, while model-based graders with clear rubrics can evaluate how the agent uses tools or interacts with users.

Consider a coding task in which the agent must fix an authentication bypass vulnerability. The illustrative YAML below shows how graders and metrics can evaluate its work.

```yaml
task:
  id: "fix-auth-bypass_1"
  desc: "Fix authentication bypass when password field is empty and ..."
  graders:
    - type: deterministic_tests
      required: [test_empty_pw_rejected.py, test_null_pw_rejected.py]
    - type: llm_rubric
      rubric: prompts/code_quality.md
    - type: static_analysis
      commands: [ruff, mypy, bandit]
    - type: state_check
      expect:
        security_logs: {event_type: "auth_blocked"}
    - type: tool_calls
      required:
        - {tool: read_file, params: {path: "src/auth/*"}}
        - {tool: edit_file}
        - {tool: run_tests}
  tracked_metrics:
    - type: transcript
      metrics:
        - n_turns
        - n_toolcalls
        - n_total_tokens
    - type: latency
      metrics:
        - time_to_first_token
        - output_tokens_per_sec
        - time_to_last_token
```

This example demonstrates the range of available graders for illustration. In practice, coding evals usually use unit tests for correctness and an LLM rubric for overall code quality, adding other graders and metrics only when needed.

### Evaluating conversational agents

Conversational agents interact with users in support, sales, coaching, and similar domains. Unlike traditional chatbots, they maintain state, use tools, and take action during the conversation. Coding and research agents may also have multi-turn interactions, but conversational agents pose an additional challenge: interaction quality itself must be evaluated. Effective evals combine verifiable final-state outcomes with rubrics covering both task completion and communication quality. Unlike most evals, they often need a second LLM to simulate the user. We use this approach in alignment auditing agents to stress-test models through extended adversarial conversations.

Success can be measured along several dimensions:
1. Was the issue resolved? (State check.)
2. Was it completed within 30 turns? (Transcript limit.)
3. Was the tone appropriate? (LLM rubric.)

𝜏-Bench and its successor τ2-Bench incorporate multiple dimensions. They simulate multi-turn interactions in domains such as retail support and flight booking, with one model playing the user while the agent handles realistic scenarios.

**Example: a theoretical evaluation for a conversational agent**

Imagine a customer support task in which the agent must handle a refund for a frustrated customer.

```yaml
graders:
  - type: llm_rubric
    rubric: prompts/support_quality.md
    assertions:
      - "Agent showed empathy for customer's frustration"
      - "Resolution was clearly explained"
      - "Agent's response grounded in fetch_policy tool results"
  - type: state_check
    expect:
      tickets: {status: resolved}
      refunds: {status: processed}
  - type: tool_calls
    required:
      - {tool: verify_identity}
      - {tool: process_refund, params: {amount: "<=100"}}
      - {tool: send_confirmation}
  - type: transcript
    max_turns: 10
tracked_metrics:
  - type: transcript
    metrics:
      - n_turns
      - n_toolcalls
      - n_total_tokens
  - type: latency
    metrics:
      - time_to_first_token
      - output_tokens_per_sec
      - time_to_last_token
```

Like the coding example, this task includes several grader types for illustration. In practice, conversational evals commonly use model-based graders to assess communication quality and goal completion, since tasks such as answering questions may have several valid answers.

### Evaluating research agents

Research agents gather, synthesize, and analyze information to produce answers or reports. Unlike coding unit tests, which provide binary pass/fail signals, research quality depends on the task. “Comprehensive,” “well sourced,” and even “correct” mean different things in market research, acquisition due diligence, and scientific reporting.

Research evals face distinct challenges. Experts may disagree about whether a synthesis is comprehensive, ground truth changes as sources evolve, and longer, more open-ended outputs create more opportunities for error. Benchmarks such as BrowseComp test whether agents can find needles in the haystack of the open web, using questions designed to be easy to verify but difficult to solve.

One strategy combines several grader types. `Groundedness checks` verify that retrieved material supports the claims. `Coverage checks` specify the key facts a good answer must include. `Source quality checks` confirm that sources are authoritative, not merely the first results retrieved. Exact matching can work for objectively answerable questions such as “What was Company X's Q3 revenue?” LLMs can flag unsupported claims and gaps in coverage, and assess the coherence and completeness of open-ended synthesis.

### Computer use agents

Computer use agents interact with software through the same interfaces people use: screenshots, clicks, keyboard input, and scrolling, rather than APIs or code execution. They can operate any application with a graphical user interface (GUI), from design tools to legacy enterprise software. Evaluations run these agents in real or sandboxed environments and check whether they achieve the intended result. WebArena, for example, tests browser tasks using URL and page-state checks for navigation, plus backend state checks for data-changing tasks: was the order actually placed, rather than just a confirmation page displayed? OSWorld extends this to full operating-system control, with scripts checking file-system state, application settings, database contents, and UI element properties after the task.

Browser agents must balance token efficiency against latency. DOM-based interactions are fast but can consume many tokens; screenshot-based interactions are slower but may use fewer tokens. Extracting DOM text is efficient when Claude summarizes Wikipedia, for example. Screenshots are more efficient when shopping for a laptop sleeve on Amazon, where extracting the whole DOM would consume many tokens. For Claude for Chrome, we developed evals to check whether the agent selects the appropriate tool for each context, making browser tasks faster and more accurate.

## **Metrics:** thinking about non-determinism in agent evaluations

`pass@k` measures the probability of finding at least one correct solution in k attempts. It rises as k increases because more attempts create more chances to succeed. A pass@1 score of 50% means the model solved half the evaluation tasks on its first try. In coding, first-attempt success, or pass@1, is often what matters most. In other settings, proposing multiple solutions can be useful as long as one works.

`pass^k` measures the probability that all k trials succeed. It falls as k increases because consistent success across more trials is harder. With a 75% success rate per trial and three independent trials, the probability of succeeding on all three is (0.75)³ ≈ 42%. This matters especially for user-facing agents, where people expect reliable service every time.

<img src='/media/AIAgent/3ddac5be07a0773922ec9df06afec55922f8194a-4584x2580.png'>

At k=1, pass@k and pass^k are identical: both represent the per-trial success rate. As the trial count increases, they move in opposite directions. By k=10 in this example, pass@k approaches 100%, while pass^k falls toward 0%.

Both metrics are useful. Product requirements determine which matters more: pass@k suits tools where one successful attempt is valuable, while pass^k suits agents whose consistency is essential.

# Going from zero to one: a roadmap to great evals for agents

This section offers practical, tested advice for building trustworthy evals from scratch. Think of it as a roadmap for eval-driven agent development: define success early, measure it clearly, and keep iterating.

Some teams postpone evals because they believe they need hundreds of tasks. In fact, 20–50 simple tasks drawn from real failures are a strong starting point. Early in agent development, most changes have visible effects, so small samples can be sufficient. Mature agents may need larger, more complex suites to detect smaller effects, but begin with the 80/20 rule. Evals become harder to build the longer you wait. Early product requirements naturally translate into test cases; later, you have to reverse-engineer success criteria from a running system.

<img src = '/media/AIAgent/0db40cc0e14402222a179fc6297b9c8818e97c8a-4584x2580.png'>

## Step 1: start with what you already test manually

Begin with the checks you already run during development: behaviors verified before each release and tasks users commonly attempt. If the product is live, review bug trackers and support queues. Turn reported failures into test cases so the suite reflects actual usage, and prioritize by user impact to focus effort where it matters.

## Step 2: write clear task specifications with reference solutions

Getting task quality right is harder than it looks. Two domain experts should independently reach the same pass/fail judgment on a good task. Could they complete it themselves? If not, improve the task. Ambiguity in a specification becomes noise in the metric. The same applies to model-based rubrics: vague grading criteria lead to inconsistent judgments.

An agent that follows instructions correctly should be able to complete every task. Subtle problems can undermine that. A Terminal-Bench audit found tasks that requested a script without specifying its path, while the tests assumed a particular path. An agent could fail through no fault of its own. Everything checked by a grader should be explicit in the task description. With frontier models, a 0% pass rate across many attempts, such as 0% pass@100, often suggests a flawed task rather than missing capability, so inspect the specification and graders. Create a reference solution for each task: a known working output that passes all graders. This proves the task is solvable and checks that grading is configured correctly.

## Step 3: build a balanced task set

Test both when a behavior should happen and when it should not. One-sided evals produce one-sided optimization. If you test only whether an agent searches when it should, you may get an agent that searches for almost everything. Avoid `class-imbalanced` evals. We learned this while evaluating web search for Claude.ai: the model needed to avoid unnecessary searches while still researching broadly when appropriate. The suite included queries requiring search, such as weather, and queries answerable from existing knowledge, such as “Who founded Apple?” Balancing under-triggering (failing to search when needed) and over-triggering (searching unnecessarily) required many iterations on prompts and evals. We kept adding examples to improve coverage.

Test both when a behavior should happen and when it should not. One-sided evals produce one-sided optimization. If you test only whether an agent searches when it should, you may get an agent that searches for almost everything. Avoid class-imbalanced evals. We learned this while evaluating web search for Claude.ai: the model needed to avoid unnecessary searches while still researching broadly when appropriate. The suite included queries requiring search, such as weather, and queries answerable from existing knowledge, such as “Who founded Apple?” Balancing under-triggering (failing to search when needed) and over-triggering (searching unnecessarily) required many iterations on prompts and evals. We kept adding examples to improve coverage.

## Design the eval harness and graders

## Step 4: build a robust harness with a stable environment

The agent used in evals should function much like the production agent, and the environment should not introduce extra confounding factors. Isolate each trial by starting from a clean environment. Unnecessary shared state, such as leftover files, cached data, or exhausted resources, creates correlated failures caused by infrastructure rather than agent performance. Shared state can also inflate scores. In internal evals, we observed Claude gain an unfair advantage by inspecting Git history from earlier trials. If several trials fail because of the same environmental constraint, such as insufficient memory, they are not independent. Their shared cause makes the evaluation unreliable as a measure of agent performance.

The agent used in evals should function much like the production agent, and the environment should not introduce extra confounding factors. Isolate each trial by starting from a clean environment. Unnecessary shared state, such as leftover files, cached data, or exhausted resources, creates correlated failures caused by infrastructure rather than agent performance. Shared state can also inflate scores. In internal evals, we observed Claude gain an unfair advantage by inspecting Git history from earlier trials. If several trials fail because of the same environmental constraint, such as insufficient memory, they are not independent. Their shared cause makes the evaluation unreliable as a measure of agent performance.

## Step 5: design graders carefully

Good evaluation design means choosing graders suited to both the agent and the task. Prefer deterministic graders where possible, use LLM graders when needed or when flexibility helps, and use human graders selectively for additional validation.

It is tempting to check that the agent follows an exact sequence of steps, such as calling tools in a prescribed order. We have found this too rigid: agents often find valid approaches the eval author did not anticipate, making such tests brittle. To avoid unnecessarily restricting creativity, it is usually better to assess the final result than the path taken.

For multi-step tasks, award partial credit. A support agent that identifies the issue and verifies the customer but fails to process a refund performs meaningfully better than one that fails immediately. Results should reflect that continuum.

Model grading requires iteration to establish accuracy. Calibrate LLM judges closely against human experts so their judgments align. Give the model an escape route to reduce hallucinations, such as returning “Unknown” when information is insufficient. Clear, structured rubrics for individual dimensions also help. Grade each dimension with a separate LLM judge instead of one judge handling everything. Once the system is reliable, occasional human review is sufficient.

Subtle eval defects can produce low scores even when the agent performs well: grading bugs, harness restrictions, or ambiguity can prevent success. Experienced teams miss these too. Opus 4.5 initially scored 42% on CORE-Bench before an Anthropic researcher found rigid grading that rejected “96.12” when expecting “96.124991…”, ambiguous specifications, and stochastic tasks that could not be reproduced exactly. After fixing the bugs and using a less restrictive harness, its score reached 95%. METR similarly found misconfigured tasks in its time-horizon benchmark: instructions asked agents to reach a threshold, but graders required exceeding it. Models such as Claude were penalized for following instructions, while models ignoring the stated target scored better. Carefully review both tasks and graders to catch these problems.

Make graders resistant to bypasses and hacks. An agent should not be able to cheat its way through an eval. Passing should require solving the actual problem, not exploiting an accidental loophole.

## Maintain and use the eval long-term

## Step 6: read the transcripts

You cannot know whether graders work well without reading transcripts and scores from many trials. At Anthropic, we built tools for viewing eval transcripts and regularly set aside time to read them. When a task fails, the transcript shows whether the agent truly made a mistake or a grader rejected a valid solution. It also reveals important details about agent and grader behavior.

Failures should be fair: it should be clear what went wrong and why. When scores stop improving, we need confidence that agent performance is responsible, rather than the eval itself. Reading transcripts verifies that an eval measures what matters and is a core skill in agent development.

## Step 7: monitor capability eval saturation

An eval at 100% can catch regressions but offers no signal for improvement. Saturation occurs when the agent passes every solvable task. The source article gives SWE-bench Verified as an example: scores started at 30% that year, with frontier models nearing saturation around 80%. Progress slows as only the hardest tasks remain, so major capability gains may appear as small score increases. Code review startup Qodo was initially unimpressed by Opus 4.5 because its one-shot coding evals missed gains on longer, more complex tasks. A new agentic evaluation framework made those improvements much clearer.

As a rule, we do not take scores at face value until someone examines the eval details and reads transcripts. Revise the eval if grading is unfair, tasks are ambiguous, valid solutions are penalized, or the harness constrains the model.

## Step 8: keep evaluation suites healthy through open contribution and maintenance

An eval suite is a living artifact. It needs continuing attention and clear ownership to stay useful.

We have tried several maintenance approaches at Anthropic. The most effective has been a dedicated eval team responsible for core infrastructure, with domain experts and product teams owning most tasks and running their own evals.

For AI product teams, writing and refining evals should be as routine as maintaining unit tests. Teams can waste weeks on features that seemed fine in early tests but fail to meet unstated expectations. Well-designed evals could have caught those problems earlier. Defining eval tasks is one of the best ways to test whether product requirements are concrete enough to begin development.

We recommend eval-driven development: define planned capabilities through evals before the agent can deliver them, then iterate until it performs well. Internally, we often build features that are only “good enough” today as a bet on model capabilities a few months ahead. Capability evals with low initial pass rates make these bets explicit. When a new model arrives, a quick suite run shows which bets have paid off.

The people closest to product requirements and users are best placed to define success. With current models, product managers, customer success managers, and salespeople can use Claude Code to submit eval tasks as PRs. Let them do it—and actively help them contribute.


## Combining evals with other methods for a holistic understanding of agents

Automated evals can test agents on thousands of tasks without deployment or impact on real users. But they are only one way to understand performance. A fuller picture also requires production monitoring, user feedback, A/B testing, manual transcript review, and systematic human evaluation.

## An overview of approaches for understanding AI agent performance

## An overview of methods for understanding AI agent performance

| Method | Pros | Cons |
|---|---|---|
| **Automated evals**<br><br>Run tests programmatically without real users | Faster iteration<br><br>Fully reproducible<br><br>No user impact<br><br>Can run on every commit<br><br>Test scenarios at scale without production deployment | Higher up-front investment<br><br>Ongoing maintenance as products and models evolve to prevent eval drift<br><br>Can create false confidence if they do not reflect real usage |
| **Production monitoring**<br><br>Track metrics and errors in live systems | Reveals real user behavior at scale<br><br>Catches issues automated evals miss<br><br>Provides real-world evidence of agent performance | Reactive: problems often affect users before discovery<br><br>Signals can be noisy<br><br>Requires monitoring and instrumentation infrastructure<br><br>No reference answers for grading |
| **A/B testing**<br><br>Compare versions using real user traffic | Measures actual outcomes such as retention and task completion<br><br>Controls confounding variables<br><br>Systematic and scalable | Slow: often takes days or weeks and sufficient traffic to reach significance<br><br>Only tests deployed changes<br><br>Hard to explain metric changes without examining transcripts |
| **User feedback**<br><br>Explicit signals such as thumbs-down ratings and bug reports | Reveals unanticipated problems<br><br>Includes real user examples<br><br>Often closely related to product goals | Sparse and self-selected<br><br>Skewed toward severe problems<br><br>Users rarely explain failures in detail<br><br>Cannot be automated<br><br>Relying too much on users to find issues can harm their experience |
| **Manual transcript review**<br><br>People read through agent conversations | Builds intuition about failure modes<br><br>Finds subtle quality issues automated checks miss<br><br>Calibrates standards for good performance and clarifies details | Time-consuming<br><br>Difficult to scale<br><br>Uneven coverage<br><br>Reviewer fatigue and differences between reviewers affect consistency<br><br>Usually qualitative rather than a clear quantitative score |
| **Systematic human studies**<br><br>Trained reviewers score agent outputs using a structured process | Multiple reviewers provide gold-standard judgments<br><br>Works for subjective or ambiguous tasks<br><br>Provides signals for improving model-based graders | Expensive with slow feedback<br><br>Difficult to run frequently<br><br>Reviewer disagreements need reconciliation<br><br>Complex domains such as law, finance, and medicine require experts |

| Method | Pros | Cons |
|---|---|---|
| **Automated evals**<br><br>Running tests programmatically without real users | Faster iteration<br><br>Fully reproducible<br><br>No user impact<br><br>Can run on every commit<br><br>Tests scenarios at scale without requiring a prod deployment | Requires more up-front investment to build<br><br>Requires ongoing maintenance as product and model evolves to avoid drift<br><br>Can create false confidence if it doesn’t match real usage patterns |
| **Production monitoring**<br><br>Tracking metrics and errors in live systems | Reveals real user behavior at scale<br><br>Catches issues that synthetic evals miss<br><br>Provides ground truth on how agents actually perform | Reactive; problems reach users before you know about them<br><br>Signals can be noisy<br><br>Requires investment in instrumentation<br><br>Lacks ground truth for grading |
| **A/B testing**<br><br>Comparing variants with real user traffic | Measures actual user outcomes (retention, task completion)<br><br>Controls for confounds<br><br>Scalable and systematic | Slow; days or weeks to reach significance and requires sufficient traffic<br><br>Only tests changes you deploy<br><br>Less signal on the underlying “why” for changes in metrics without being able to thoroughly review the transcripts |
| **User feedback**<br><br>Explicit signals like thumbs-down or bug reports | Surfaces problems you didn't anticipate<br><br>Comes with real examples from actual human users<br><br>The feedback often correlates with product goals | Sparse and self-selected<br><br>Skews toward severe issues<br><br>Users rarely explain why something failed<br><br>Not automated<br><br>Relying primarily on users to catch issues can have negative user impact |
| **Manual transcript review**<br><br>Humans reading through agent conversations | Builds intuition for failure modes<br><br>Catches subtle quality issues automated checks miss<br><br>Helps calibrate what "good" looks like and grasp details | Time-intensive<br><br>Doesn't scale<br><br>Coverage is inconsistent<br><br>Reviewer fatigue or different reviewers can affect the signal quality<br><br>Typically only gives qualitative signal rather than clear quantitative grading |
| **Systematic human studies**<br><br>Structured grading of agent outputs by trained raters | Gold-standard quality judgements from multiple human raters<br><br>Handles subjective or ambiguous tasks<br><br>Provides signal for improving model-based graders | Relatively expensive and slow turnaround<br><br>Hard to run frequently<br><br>Inter-rater disagreement requires reconciliation<br><br>Complex domains (legal, finance, healthcare) require human experts to conduct studies |

These methods fit different stages of agent development. Automated evals are especially useful before launch and in CI/CD, running for every agent change or model upgrade as the first line of defense against quality problems. After launch, monitoring detects distribution shifts and unexpected real-world failures. With enough traffic, A/B tests validate major changes. User feedback and transcript review are ongoing practices: triage feedback, read sample transcripts weekly, and investigate further as needed. Reserve systematic human studies for calibrating LLM graders or evaluating subjective outputs where human consensus is the reference standard.


Like the Swiss cheese model in safety engineering, no single evaluation layer catches everything. Combining methods lets one layer catch failures another misses.
<img src = '/media/AIAgent/b77b8dbb7c2e57f063fbc8a087a853d5809b74b0-4584x2580.png'>

The most effective teams combine automated evals for rapid iteration, production monitoring for real-world evidence, and regular human review for calibration.

## Conclusion

Teams without evals get stuck in reactive cycles: one fix creates another failure, and real regressions are hard to distinguish from noise. Teams that invest early gain momentum instead. Failures become test cases, test cases prevent regressions, and metrics replace guesswork. Evals give the team direction by turning “the agent feels worse” into actionable work. Their value compounds when treated as core infrastructure rather than an afterthought.

Different agent types require different approaches, but the principles are shared. Start early instead of waiting for perfection. Draw realistic tasks from observed failures. Define clear, dependable success criteria. Choose graders carefully and combine types. Keep tasks challenging enough for the model. Refine evals to improve the signal-to-noise ratio. Read the transcripts!

Agent evaluation is still a young, fast-moving field. As agents undertake longer tasks, collaborate in multi-agent systems, and handle more subjective work, evaluation techniques will need to adapt. We will keep sharing best practices as we learn.

