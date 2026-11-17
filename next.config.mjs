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

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { outputFileTracingIncludes: { '/blog/*': ['./_posts/**/*.md'] } },
  transpilePackages: ['mermaid'],
  async redirects() {
    return Object.entries(mergedJavaSpringPosts).flatMap(([source, destination]) =>
      ['Java&Spring', 'Java%26Spring'].map((category) => ({
        source: `/blog/${category}/${source}`,
        destination: `/blog/Java%26Spring/${destination}`,
        permanent: true,
      }))
    );
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
