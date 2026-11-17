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
