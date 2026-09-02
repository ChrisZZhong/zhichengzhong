import type { ResumeData } from '@/types/resume';

export const defaultResume: ResumeData = {
  basics: {
    name: 'Zhicheng Zhong',
    location: 'New York',
    relocation: 'Open to Relocate',
    phone: '202-725-1579',
    email: 'zzcjob397@gmail.com',
    portfolioLabel: 'portfolio',
    portfolioUrl: 'https://www.zhichengzhong.com',
  },
  experiences: [
    {
      company: 'Madison-Davis',
      title: 'Software Developer',
      location: 'New York, NY',
      period: 'Oct 2024 - Present',
      bullets: [
        'Drove the migration of monolithic payment orchestration services into horizontally scalable microservices using **Java**, **Spring Boot**, **Cassandra**, **Oracle DB**, and OpenShift (**Kubernetes**), enabling 3x peak traffic growth and eliminating peak-hour throughput bottlenecks.',
        'Implemented **Transactional Outbox + CDC** (Debezium) to decouple receipt generation from payment processing, publishing domain events to **Kafka** with at-least-once delivery and idempotent consumers, achieving over 99% successful notification delivery.',
        'Built fault-tolerant retry, exponential backoff with jitter, DLQ routing, and replay mechanisms for distributed payment workflows, reducing long-tail notification failures by ~90%.',
        'Owned CAT and production support across infrastructure, QA, and application teams, debugging payment processing issues and improving **system reliability** across multiple deployment environments.',
      ],
    },
    {
      company: 'Fiserv',
      title: 'Software Engineer',
      location: 'Berkeley Heights, NJ',
      period: 'July 2023 - Oct 2024',
      bullets: [
        'Developed a **Redis** cache-aside layer in **Java (JavaEE)** to reduce database reads for client configurations, cutting average API latency by over 50% and restoring SLA compliance.',
        'Built a **Kafka reconciliation service** to validate configuration propagation from Kafka to Redis across time windows, detect persistent inconsistencies, and trigger re-runs to restore production data correctness.',
        'Implemented a high-throughput **Kafka** consumer group with 100-message batch processing to ingest configuration updates into Redis, sustaining ~10k msgs/sec under production load.',
      ],
    },
    {
      company: 'Tencent',
      title: 'Backend Developer Internship',
      location: 'Shenzhen, China',
      period: 'July 2020 - Oct 2020',
      bullets: [
        'Refactored a KPI anomaly detection platform for QQ Browser using **Go** and **gRPC**, enabling minute-level multi-algorithm **anomaly detection and root cause analysis** with results persisted in Druid OLAP DB, cutting KPI triage time from hours to minutes.',
      ],
    },
  ],
  projects: [
    {
      name: 'Options Market Intelligence Agent',
      bullets: [
        'Built a Python and **FastAPI** options research service that retrieves portfolio holdings, computes GEX, VEX, and historical/current IV metrics, and generates interactive heatmaps for pre-market analysis.',
        'Integrated the Gemini API to analyze volatility and portfolio positioning, producing structured reports with market outlook, support/resistance levels, volatility regime assessment, and risk-aware portfolio insights.',
      ],
    },
  ],
  skills: [
    { label: 'Languages', items: 'Java, Python, Go' },
    { label: 'Backend & Distributed Systems', items: 'Spring Boot, RESTful APIs, Microservices, gRPC, Kafka' },
    { label: 'Databases', items: 'SQL, MySQL, PostgreSQL, MongoDB, Redis, Oracle DB, Cassandra' },
    { label: 'Cloud & DevOps', items: 'AWS (EC2, S3, RDS, IAM), GCP, Docker, Kubernetes, OpenShift, Helm, CI/CD' },
    { label: 'Development & Testing', items: 'Git, Scrum, Unit Testing, VSCode, IntelliJ' },
    { label: 'AI', items: 'RAG, LangChain, LangGraph, Vector Search, Prompt Engineering, Codex, Cursor, Claude' },
  ],
  education: [
    {
      school: 'Georgetown University',
      location: 'Washington, D.C',
      degree: 'M.S. in Computer Science',
      period: 'Aug 2021 - May 2023',
    },
    {
      school: 'Nankai University',
      location: 'Tianjin, China',
      degree: 'B.S. in Computer Science',
      period: 'Sep 2017 - Jun 2021',
    },
  ],
};
