---
title: "Anthropic - Introducing Contextual Retrieval (RAG)"
date: 2026-02-12
description: "Notes on Anthropic - Contextual Retrieval"
tag: AIAgent
prime: false
---

# Introduction [Source article](https://www.anthropic.com/engineering/contextual-retrieval)

AI models often need background knowledge to be useful in a particular setting. A customer service chatbot, for example, needs to understand the business it serves, while a legal analysis bot needs access to a large body of past cases.

Developers commonly use retrieval-augmented generation (RAG) to expand a model's knowledge. RAG retrieves relevant information from a knowledge base and adds it to the user's prompt, significantly improving the model's responses. Traditional RAG, however, loses context when encoding information, which can prevent the system from retrieving relevant material.

This article introduces Contextual Retrieval, a method that substantially improves the retrieval step in RAG. It combines two techniques: Contextual Embeddings and Contextual BM25. Together, they reduce retrieval failures by 49%, or by 67% when combined with reranking. Better retrieval accuracy translates directly into better performance on downstream tasks.

## A note on longer prompts

Sometimes the simplest solution is the best. If your knowledge base contains fewer than 200,000 tokens, roughly 500 pages, you can put the entire knowledge base in the model's prompt without using RAG or a similar technique.

A few weeks before the source article was published, we introduced prompt caching for Claude, making this approach faster and cheaper. Developers can cache frequently used prompts across API calls, cutting latency in half and reducing costs by up to 90%. See the [prompt caching guide](https://platform.claude.com/cookbook/misc-prompt-caching) for details.

As your knowledge base grows, though, you need a more scalable solution. That is where Contextual Retrieval comes in.

## A RAG primer: scaling to larger knowledge bases

RAG is a standard solution for knowledge bases too large to fit in a context window. It preprocesses the knowledge base as follows:

1. Split the knowledge base, or document corpus, into smaller text chunks, usually no more than a few hundred tokens each.
2. Use an embedding model to convert those chunks into vectors that encode their meaning.
3. Store the embeddings in a vector database for semantic similarity search.

At runtime, when a user submits a query, the vector database finds the chunks most semantically similar to that query. Those chunks are then added to the prompt sent to the generative model.

Embedding models capture semantic relationships well, but they can miss important exact matches. An older technique helps here: BM25 (Best Matching 25), a ranking function that uses lexical matching to find exact words or phrases. It is especially useful for queries containing unique identifiers or technical terms.

BM25 builds on TF-IDF, or term frequency–inverse document frequency, which measures a term's importance to a document. BM25 improves on it by accounting for document length and applying a saturation function to term frequency, helping prevent common words from dominating the results.

For example, suppose a user searches a technical support database for “error code TS-999.” An embedding model might retrieve general material about error codes while missing the exact identifier “TS-999.” BM25 looks for that specific text string to identify relevant documents.

Combining embeddings with BM25 lets RAG retrieve the most relevant chunks more accurately, using these steps:

<img src = 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F45603646e979c62349ce27744a940abf30200d57-3840x2160.png&w=3840&q=75'>

1. Split the knowledge base, or document corpus, into smaller chunks, usually no more than a few hundred tokens each.
2. Create TF-IDF encodings and semantic embeddings for the chunks.
3. Use BM25 to find the best chunks based on exact matches.
4. Use embeddings to find the best chunks based on semantic similarity.
5. Combine and deduplicate the results from steps 3 and 4 using rank fusion.
6. Add the top K chunks to the prompt to generate a response.

Combining BM25 and embeddings gives traditional RAG more comprehensive, accurate results by balancing exact term matching with broader semantic understanding.

This approach scales cost-effectively to knowledge bases far larger than a single prompt can hold. But traditional RAG has a major limitation: it often strips away context.

## The context problem in traditional RAG

Traditional RAG divides documents into small chunks for efficient retrieval. This works for many applications, but problems arise when individual chunks do not carry enough context.

Suppose your knowledge base contains embedded financial information, such as SEC filings, and someone asks: “How much did ACME Corporation's revenue grow in Q2 2023?”

The relevant chunk might say: “The company's revenue grew by 3% over the previous quarter.” On its own, this does not identify the company or time period, making the information difficult to retrieve or use effectively.

## Introducing Contextual Retrieval

Contextual Retrieval addresses this by prepending explanatory context specific to each chunk before embedding it (Contextual Embeddings) and before building the BM25 index (Contextual BM25).

Returning to the SEC filings example, here is how a chunk can be transformed:

```text
original_chunk = "The company's revenue grew by 3% over the previous quarter."

contextualized_chunk = "This chunk is from an SEC filing on ACME corp's performance in Q2 2023; the previous quarter's revenue was $314 million. The company's revenue grew by 3% over the previous quarter."
```

Other ways of using context to improve retrieval have been proposed before. These include adding generic document summaries to chunks, which produced very limited gains in our experiments; hypothetical document embeddings; and summary-based indexing, which performed poorly in our evaluations. These differ from the approach described here.

## Implementing Contextual Retrieval

Manually annotating thousands or millions of chunks would be impractical. Instead, we use Claude with a prompt that asks for concise, chunk-specific context explaining how the chunk fits into the whole document. We used the following Claude 3 Haiku prompt to generate context for each chunk:

<img src = 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F2496e7c6fedd7ffaa043895c23a4089638b0c21b-3840x2160.png&w=3840&q=75'>

```
<document> 
{{WHOLE_DOCUMENT}} 
</document> 
Here is the chunk we want to situate within the whole document 
<chunk> 
{{CHUNK_CONTENT}} 
</chunk> 
Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else. 
```

The generated context, typically 50–100 tokens, is prepended to each chunk before embedding it and before creating the BM25 index.

## Using Prompt Caching to reduce the costs of Contextual Retrieval

[Prompt caching guide](https://platform.claude.com/cookbook/misc-prompt-caching)

The prompt caching feature mentioned earlier makes Contextual Retrieval inexpensive with Claude. Instead of passing the reference document again for every chunk, load it into the cache once and refer to the cached content. Assuming 800-token chunks, 8,000-token documents, 50-token contextualization instructions, and 100 tokens of generated context per chunk, the one-time cost is $1.02 per million document tokens.

### Methodology

We experimented across knowledge domains (codebases, fiction, arXiv papers, and scientific papers), embedding models, retrieval strategies, and evaluation metrics. Appendix II of the source article lists example questions and answers for each domain.

The chart below shows average performance across domains using the best-performing embedding configuration, Gemini Text 004, and retrieving the top 20 chunks. The metric is 1 minus recall@20: the percentage of relevant documents not retrieved within those top 20 chunks. Full results are in the source article's appendix. Contextualization improved performance for every embedding-and-source combination evaluated.

Performance gains:

<img src = 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F7f8d739e491fe6b3ba0e6a9c74e4083d760b88c9-3840x2160.png&w=3840&q=75'>

Contextual Embeddings reduced top-20 retrieval failures by 35% (5.7% → 3.7%).

Combining Contextual Embeddings with Contextual BM25 reduced top-20 retrieval failures by 49% (5.7% → 2.9%).

**Things to consider**

1. Chunk boundaries: think carefully about how documents are split. Chunk size, boundaries, and overlap all affect retrieval performance.

2. Embedding models: Contextual Retrieval improved every model we tested, but some benefited more than others. Gemini and Voyage embeddings were particularly effective.

3. Custom contextualization prompts: our general prompt works well, but prompts tailored to your domain or use case may work better. For example, include a glossary of key terms that are defined only in other documents in the knowledge base.

4. Number of chunks: adding more chunks increases the chance of including relevant information, but too much information can distract the model. We tested 5, 10, and 20 chunks and found that 20 worked best.

Always run evals. Response generation can also improve when you pass contextualized chunks to the model and distinguish the added context from the original chunk.

## Reranking for further performance gains

Contextual Retrieval can be combined with other techniques for further gains. Traditional RAG searches a knowledge base for potentially relevant chunks. With large knowledge bases, this initial retrieval may return many chunks, sometimes hundreds, with widely varying relevance and importance.

Reranking is a common filtering technique that passes only the most relevant chunks to the model. It improves responses and can reduce costs and latency by reducing the information the model must process. The main steps are:

1. Perform initial retrieval to obtain potentially relevant chunks. We used the top 150.

2. Pass the top N chunks and the user's query to a reranking model.

3. Score each chunk for relevance and importance to the prompt, then select the top K. We used the top 20.

4. Pass those top K chunks to the model as context to generate the final result.

Performance gains:

<img src = 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F8f82c6175a64442ceff4334b54fac2ab3436a1d1-3840x2160.png&w=3840&q=75'>

Many reranking models are available. We tested Cohere's reranker. Voyage also offers one, but we did not have time to test it. Our experiments showed that adding reranking improved retrieval across domains.

Specifically, reranking Contextual Embeddings and Contextual BM25 results reduced top-20 retrieval failures by 67% (5.7% → 1.9%).

## Cost and latency considerations

Reranking affects latency and cost, especially when many chunks are involved. It adds a runtime step, so even a reranker that scores all chunks in parallel introduces some latency. There is an inherent trade-off between reranking more chunks for better performance and fewer chunks for lower latency and cost. Try different settings for your use case to find the right balance.

## Conclusion

We tested combinations of embedding models, BM25, Contextual Retrieval, rerankers, and the total number of retrieved chunks across different dataset types. Here is what we found:

1. Embeddings plus BM25 work better than embeddings alone.

2. Voyage and Gemini produced the best embeddings among the models we tested.

3. Passing the top 20 chunks to the model works better than passing only 10 or 5.

4. Adding context to chunks substantially improves retrieval accuracy.

5. Reranking consistently outperforms not reranking in these tests.

6. These benefits stack: for maximum performance, combine Contextual Embeddings from Voyage or Gemini with Contextual BM25, add reranking, and include 20 chunks in the prompt.

## Comparison data

The following results are broken down by dataset, embedding provider, whether BM25 is used alongside embeddings, whether Contextual Retrieval is enabled, and whether results are reranked for retrieval@20.

<img src = 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F646a894ec4e6120cade9951a362f685cd2ec89b2-2458x2983.png&w=3840&q=75'>



