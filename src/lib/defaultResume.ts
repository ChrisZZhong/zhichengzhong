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
        'Drove the migration of monolithic payment orchestration services into horizontally scalable microservices on OpenShift (**Kubernetes**) using **Java** and **Spring Boot**, enabling 3x peak traffic growth and eliminating peak-hour throughput bottlenecks.',
        'Implemented **Transactional** Outbox with **CDC** (Debezium) pattern to decouple email receipt generation from the core payment workflow, publishing domain events to **Kafka** with at-least-once delivery and idempotent consumers, achieving over 99% successful notification delivery.',
        'Developed a fault-tolerant retry mechanism with exponential backoff and jitter, along with Dead Letter Queue (DLQ) routing and replay capabilities, reducing long-tail notification failures by ~90%.',
        'Partnered with infrastructure, QA, and application teams to support CAT & production releases, troubleshoot payment processing issues, and ensure high service availability across multiple deployment environments.',
      ],
    },
    {
      company: 'Fiserv',
      title: 'Software Engineer',
      location: 'Berkeley Heights, NJ',
      period: 'July 2023 - Oct 2024',
      bullets: [
        'Developed a **Redis** cache-aside layer in **Java (JavaEE)** to offload database reads for client configurations and improve API latency, cutting average API latency by over 50% and restoring SLA compliance.',
        'Built a message-count-based Kafka reconciliation service to validate customer configuration propagation from Kafka to Redis across time windows, detect persistent mismatches, and trigger re-runs to restore consistency in production.',
        'Implemented a high-throughput **Kafka** consumer group with batch processing (100 msgs/batch) to ingest customer configuration updates into Redis, sustaining ~10k msgs/sec under production load.',
      ],
    },
    {
      company: 'Tencent',
      title: 'Backend Developer Internship',
      location: 'Shenzhen, China',
      period: 'July 2020 - Oct 2020',
      bullets: [
        'Refactored a KPI anomaly detection platform for QQ Browser using **Go** and **gRPC**, deployed minute-level multi-algorithm **anomaly detection & root cause analysis** with results in **Druid OLAP DB**, cutting KPI triage time from hours to minutes.',
      ],
    },
  ],
  projects: [
    {
      name: 'Options Market Intelligence Agent',
      bullets: [
        'Built an AI-powered options research agent using Python and FastAPI that automatically retrieves portfolio holdings from Robinhood, computes Gamma Exposure (GEX), Volatility Exposure (VEX), and historical/current implied volatility (IV) metrics, and generates interactive heatmaps for pre-market analysis.',
        'Integrated the Gemini API to analyze GEX, VEX, IV trends, and portfolio positioning, producing structured pre-market reports with market outlook, key support/resistance levels, volatility regime assessment, and risk-aware portfolio insights.',
      ],
    },
  ],
  skills: [
    { label: 'Languages', items: 'Java, Python, Go' },
    { label: 'Backend & Distributed Systems', items: 'Spring Boot, RESTful APIs, Microservices, gRPC' },
    { label: 'Databases & MQ', items: 'PostgreSQL, MySQL, MongoDB, Redis, Oracle DB, Kafka' },
    { label: 'Cloud & DevOps', items: 'AWS (EC2, S3, RDS, IAM), GCP, Docker, Kubernetes, Helm, CI/CD, Git, OpenShift' },
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
