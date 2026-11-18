// Keep bookmarks to the original Java and Spring notes working after consolidation.
const mergedJavaSpringPosts = {
  '2023-03-29-Java-Core': '2023-01-20-Java-basic',
  '2025-08-20-StreamBuffer': '2023-01-20-Java-basic#buffered-input-for-coding-exercises',
  '2023-04-06-Dependency-Injection': '2023-04-07-Spring-Boot#dependency-injection-and-the-ioc-container',
  '2023-04-08-Annotations-in-Spring': '2023-04-07-Spring-Boot#bean-annotations-and-injection',
  '2023-04-10-Spring-AOP': '2023-04-07-Spring-Boot#spring-aop-and-proxies',
  '2023-10-25-SpringBootTutorial': '2023-04-07-Spring-Boot#create-a-spring-boot-project',
  '2023-04-06-Spring-MVC': '2023-04-12-REST-in-Spring#spring-mvc-request-flow',
  '2023-04-11-Spring-Security': '2023-04-12-REST-in-Spring#spring-security-and-authentication',
  '2023-06-23-swagger': '2023-04-12-REST-in-Spring#openapi-and-swagger-ui',
  '2023-04-09-Transactions-in-Spring': '2023-04-13-SpringDataJPA#transactions-and-acid',
  '2023-04-15-Testing-in-Spring': '2023-04-13-SpringDataJPA#testing-spring-applications',
  '2023-04-16-SpringProfileAndJasypt': '2023-06-19-monitoring#spring-profiles-and-secrets',
  '2023-06-11-async-communication': '2023-06-19-monitoring#async-work-and-executors',
  '2023-06-22-spring-cloud-config': '2023-06-19-monitoring#centralized-configuration-with-spring-cloud-config',
};

const mergedDistributedSystemPosts = {
  '2023-06-10-api-gateway': '2024-08-05-Failures-in-distributed-systems#api-gateways-and-service-discovery',
  '2023-06-13-cascading-failure': '2024-08-05-Failures-in-distributed-systems#cascading-failures-and-fault-tolerance',
  '2023-06-16-fault-tolerance': '2024-08-05-Failures-in-distributed-systems#cascading-failures-and-fault-tolerance',
  '2023-06-20-monolith-vs-microservices': '2024-08-05-Failures-in-distributed-systems#monolith-versus-microservices',
  '2023-06-21-microservices-communicate': '2024-08-05-Failures-in-distributed-systems#synchronous-and-asynchronous-communication',
  '2023-06-18-kafka': '2024-06-15-kafka-basic#topics-partitions-and-consumer-groups',
  '2024-10-11-Dead-Letter-Queue': '2024-06-15-kafka-basic#dead-letter-queue-and-controlled-replay',
  '2024-03-07-kafka-redis': '2025-03-04-Flink#kafka-and-redis-cache-projections',
  '2023-06-14-debug-in-microservices': '2024-10-05-Splunk-Logging#incident-triage-with-logs-and-metrics',
  '2023-06-15-elk': '2024-10-05-Splunk-Logging#centralized-logs-with-the-elastic-stack',
  '2023-06-17-jenkins': '2023-06-25-CICDpipeline#jenkins-and-cicd',
  '2024-02-16-knowledges': '2023-06-25-CICDpipeline#safe-rollouts-and-rollback',
  '2024-03-04-docker': '2023-06-25-CICDpipeline#docker-and-compose',
  '2024-09-04-Newman-Regression': '2023-06-25-CICDpipeline#newman-api-regression-reports',
};

const reclassifiedPosts = {
  '/blog/SystemDesign/2025-05-16-system-design-infra-kafka-DLQ': '/blog/DistributedSystem/2024-06-15-kafka-basic#operating-a-kafka-dead-letter-topic',
  '/blog/SystemDesign/2024-11-16-System-Design-DDIA-5': '/blog/DistributedSystem/2024-11-16-System-Design-DDIA-5',
  '/blog/DistributedSystem/2023-06-24-transaction-in-microservices': '/blog/SystemDesign/2023-06-24-transaction-in-microservices',
  '/blog/Algorithms/2025-11-24-prefix-matrix-sum': '/blog/Algorithms/2023-09-20-prefix-sum#matrix-prefix-sum',
  '/blog/LeetcodeProblem/2023-10-21-LeetCode-Daily': '/blog/Algorithms/2023-10-21-LeetCode-Daily',
  '/blog/LeetcodeProblem/2025-02-24-LC-removeDuplicatedElements': '/blog/Algorithms/2025-02-24-LC-removeDuplicatedElements',
  '/blog/LeetcodeProblem/2025-02-26-minimumOperationMakeArrayEquals': '/blog/Algorithms/2023-09-20-prefix-sum#prefix-sums-for-absolute-distances',
  '/blog/LeetcodeProblem/2025-03-07-lc75': '/blog/Algorithms/2025-03-07-lc75',
  '/blog/OA/2025-11-25-ub-code-prac-hub': '/blog/Algorithms/2025-11-25-ub-code-prac-hub',
  '/blog/OA/2025-12-09-ub': '/blog/Algorithms/2025-12-09-ub',
  '/blog/OA/2025-12-19-ub-code-final': '/blog/Algorithms/2025-12-19-ub-code-final',
  '/blog/OA/2025-12-19-ub-code-hello-interview': '/blog/Algorithms/2025-12-19-ub-code-final',
  '/blog/OA/2025-12-19-ub-code-leetcode': '/blog/Algorithms/2025-12-19-ub-code-final',
  '/blog/OA/2025-12-19-ub-system-design': '/blog/SystemDesign/2025-03-10-system-design-Uber#ride-sharing-interview-follow-ups',
  '/blog/OA/2026-03-01-bytedance-leetcode-problems.md': '/blog/Algorithms/2026-03-01-bytedance-leetcode-problems',
  '/blog/Interviews/2025-11-13-Uber-Phone': '/blog/Algorithms/2025-11-13-Uber-Phone',
  '/blog/ComputerNetwork/2023-09-21-TypeURLinBrowser': '/blog/ComputerNetwork/2023-09-21-TCPIP#what-happens-when-you-type-a-url-in-a-browser',
  '/blog/ComputerNetwork/2023-09-29-HTTP': '/blog/ComputerNetwork/2023-09-21-TCPIP#http',
  '/blog/ComputerNetwork/2023-09-22-RPC-HTTP-gRPC': '/blog/ComputerNetwork/2023-04-12-RESTFulAPI#rpc-remote-procedure-call',
  '/blog/AIAgent/2026-04-15-AI-Agent-Intro': '/blog/AIAgent/2026-03-12-Building_effective_agents#agent-harness-engineering',
  '/blog/AIAgent/2026-04-16-RAG': '/blog/AIAgent/2026-04-14-Introducing_Contextual_Retrieval#rag-architecture',
  '/blog/Interviews/2023-01-10-Interview-Preparation': '/blog/Interviews/2023-10-11-Software-interview',
  '/blog/Interviews/2024-09-25-SQL-questions': '/blog/Algorithms/2024-09-25-SQL-questions',
  '/blog/Algorithms/2025-02-26-minimumOperationMakeArrayEquals': '/blog/Algorithms/2023-09-20-prefix-sum#prefix-sums-for-absolute-distances',
  '/blog/SystemDesign/2025-01-27-CacheWritePolicy': '/blog/SystemDesign/2024-05-03-system-design-basic-scale-system#cache-write-policy',
  '/blog/SystemDesign/2025-12-19-ub-system-design': '/blog/SystemDesign/2025-03-10-system-design-Uber#ride-sharing-interview-follow-ups',
};

const mergedAlgorithmCategories = {
  LeetcodeProblem: 'LeetCode Problems',
  OA: 'Interview OA',
};

function postRedirects(category, posts, aliases = [category]) {
  return Object.entries(posts).flatMap(([source, destination]) =>
    aliases.map((alias) => ({
      source: `/blog/${alias}/${source}`,
      destination: `/blog/${category}/${destination}`,
      permanent: true,
    }))
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { outputFileTracingIncludes: { '/blog/*': ['./_posts/**/*.md'] } },
  transpilePackages: ['mermaid'],
  async redirects() {
    return [
      ...postRedirects('Java%26Spring', mergedJavaSpringPosts, ['Java&Spring', 'Java%26Spring']),
      ...postRedirects('DistributedSystem', mergedDistributedSystemPosts),
      ...Object.entries(reclassifiedPosts).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      ...Object.entries(mergedAlgorithmCategories).map(([tag, subcategory]) => ({
        source: '/blog',
        has: [{ type: 'query', key: 'tag', value: tag }],
        destination: `/blog?tag=Algorithms&subcategory=${encodeURIComponent(subcategory)}`,
        permanent: true,
      })),
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
