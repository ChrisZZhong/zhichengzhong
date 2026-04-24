'use client';

import { Briefcase, GraduationCap, Wrench, Code2, FolderGit2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  en: {
    pageLabel: 'CAREER JOURNEY',
    pageTitle: 'My Experience',
    pageDesc: 'Software developer specializing in distributed microservices, event-driven systems, and AI/RAG-powered tools.',
    workSection: 'Work Experience',
    projectsSection: 'Projects',
    educationSection: 'Education',
    skillsSection: 'Technical Skills',
    projectLive: 'Live ↗',
    experiences: [
      {
        company: 'Madison-Davis',
        role: 'Software Developer',
        period: 'Oct 2024 – Present',
        location: 'New York, NY',
        highlights: [
          'Led the refactoring of monolithic payment orchestration service into horizontally scalable event-driven microservices on OpenShift (Kubernetes) using Java and Spring Boot, enabling 3× peak traffic growth and eliminating peak-hour throughput bottlenecks.',
          'Implemented Transactional Outbox with CDC (Debezium) pattern to decouple email receipt generation from the core payment workflow, publishing domain events to Kafka with at-least-once delivery and idempotent consumers, improving notification reliability to 99.9% while ensuring eventual consistency.',
          'Built a fault-tolerant retry framework with exponential backoff and jitter to handle transient downstream failures, integrating Dead Letter Queue (DLQ) routing and replay capability, reducing long-tail notification failures by ~90%.',
        ],
        tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'OpenShift', 'Debezium', 'CDC', 'Microservices'],
      },
      {
        company: 'Fiserv',
        role: 'Software Engineer',
        period: 'Jul 2023 – Oct 2024',
        location: 'Berkeley Heights, NJ',
        highlights: [
          'Developed a Redis cache-aside layer in Java (JavaEE) to offload database reads and improve API latency, reducing average response time from 15s to 7s and restoring SLA compliance.',
          'Implemented a high-throughput Kafka consumer group with batch processing (100 msgs/batch) to ingest customer configuration updates into Redis, sustaining ~10k msgs/sec under production load.',
          'Collaborated closely with DevOps and QA teams to support end-to-end CI/CD processes using Kubernetes and Helm, including QA, CAT, and production deployments, while also onboarding new clients and handling production incidents.',
        ],
        tags: ['Java', 'JavaEE', 'Redis', 'Kafka', 'Kubernetes', 'Helm', 'CI/CD'],
      },
      {
        company: 'Tencent',
        role: 'Backend Developer Intern',
        period: 'Jul 2020 – Oct 2020',
        location: 'Shenzhen, China',
        highlights: [
          'Refactored an AIOps anomaly detection platform for QQ Browser using Go and gRPC, deployed minute-level multi-algorithm anomaly detection & root cause analysis with results in Druid OLAP DB, cutting KPI triage time from hours to minutes.',
        ],
        tags: ['Go', 'gRPC', 'Druid', 'AIOps', 'Anomaly Detection'],
      },
    ],
    projects: [
      {
        name: 'Personal Portfolio AI Agent',
        period: '2025',
        highlights: [
          "Built a full-stack AI agent for personal portfolio with a FastAPI (SSE streaming) backend and Next.js frontend, featuring RAG-powered Q&A, real-time Google Calendar scheduling, deployed on Railway + Vercel.",
          "Designed a two-stage RAG ingestion pipeline using LangChain's Markdown header splitter followed by recursive character chunking (500 chars, 50 overlap), storing embeddings in ChromaDB with Google's embedding-001 model to enable semantic search over personal blog content.",
          "Integrated Google Calendar API to enable real-time meeting scheduling through a conversational AI agent — queries Freebusy API to surface available time slots, then creates calendar events via a custom LangChain tool invoked within a multi-turn agentic loop.",
        ],
        tags: ['Python', 'FastAPI', 'Next.js', 'RAG', 'ChromaDB', 'LangChain', 'Gemini', 'Google Calendar API'],
        link: '/agent',
      },
    ],
    education: [
      { school: 'Georgetown University', location: 'Washington, D.C.', degree: 'M.S. in Computer Science', period: 'Aug 2021 – May 2023' },
      { school: 'Nankai University', location: 'Tianjin, China', degree: 'B.S. in Computer Science', period: 'Sep 2017 – Jun 2021' },
    ],
    skills: {
      'Languages': ['Python', 'Java', 'Go', 'JavaScript', 'SQL'],
      'LLM & Retrieval Systems': ['RAG (Retriever-Augmented Generation)', 'Vector Search (PGVector, FAISS)', 'Semantic Embeddings', 'Query Understanding (MQE, Rewriting, Decomposition)', 'Prompt Engineering', 'LangGraph', 'RAGAS'],
      'Backend & Distributed Systems': ['FastAPI', 'Spring Boot', 'RESTful APIs', 'Kafka', 'Event-Driven Architecture', 'Microservices', 'gRPC'],
      'Databases & Storage': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'MS SQL Server'],
      'Cloud & DevOps': ['AWS (EC2, S3, RDS, IAM)', 'GCP', 'Docker', 'Kubernetes', 'Helm', 'CI/CD', 'Git'],
    },
  },
  zh: {
    pageLabel: '职业历程',
    pageTitle: '我的经历',
    pageDesc: '专注于分布式微服务、事件驱动系统与 AI/RAG 工具的软件工程师。',
    workSection: '工作经历',
    projectsSection: '项目经历',
    educationSection: '教育背景',
    skillsSection: '技术技能',
    projectLive: '查看 ↗',
    experiences: [
      {
        company: 'Madison-Davis',
        role: '软件工程师',
        period: '2024.10 – 至今',
        location: '纽约',
        highlights: [
          '主导将单体支付编排服务重构为基于 OpenShift (Kubernetes) 的横向可扩展事件驱动微服务，使用 Java 和 Spring Boot，支撑 3 倍峰值流量增长，消除峰值时段吞吐量瓶颈。',
          '实现事务性发件箱（Transactional Outbox）结合 CDC（Debezium）模式，将邮件收据生成与核心支付流程解耦，通过 Kafka 以至少一次投递语义发布领域事件，配合幂等消费者，将通知可靠性提升至 99.9%，同时保证最终一致性。',
          '构建具备指数退避与抖动的容错重试框架以应对下游瞬时故障，集成死信队列（DLQ）路由与消息重放能力，将长尾通知失败率降低约 90%。',
        ],
        tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'OpenShift', 'Debezium', 'CDC', '微服务'],
      },
      {
        company: 'Fiserv',
        role: '软件工程师',
        period: '2023.07 – 2024.10',
        location: '新泽西州 Berkeley Heights',
        highlights: [
          '使用 Java (JavaEE) 构建 Redis 旁路缓存层以减轻数据库读压力，将平均 API 响应时间从 15s 降至 7s，恢复 SLA 合规。',
          '实现基于 Kafka 消费者组的高吞吐批处理管道（100 条/批），将客户配置更新摄入 Redis，在生产环境下稳定支撑约 10k 条/秒的消息处理速率。',
          '与 DevOps 和 QA 团队紧密协作，使用 Kubernetes 和 Helm 支持端到端 CI/CD 流程，涵盖 QA、CAT 及生产部署，同时承担新客户接入与生产事故处理。',
        ],
        tags: ['Java', 'JavaEE', 'Redis', 'Kafka', 'Kubernetes', 'Helm', 'CI/CD'],
      },
      {
        company: 'Tencent',
        role: '后端开发实习生',
        period: '2020.07 – 2020.10',
        location: '深圳',
        highlights: [
          '使用 Go 和 gRPC 重构 QQ 浏览器的 AIOps 异常检测平台，部署分钟级多算法异常检测与根因分析，结果存入 Druid OLAP 数据库，将 KPI 故障排查时间从数小时缩短至数分钟。',
        ],
        tags: ['Go', 'gRPC', 'Druid', 'AIOps', '异常检测'],
      },
    ],
    projects: [
      {
        name: '个人作品集 AI 助手',
        period: '2025',
        highlights: [
          '使用 FastAPI（SSE 流式传输）后端和 Next.js 前端构建全栈 AI 助手，具备 RAG 驱动的问答、实时 Google 日历预约等功能，部署于 Railway + Vercel。',
          '设计两阶段 RAG 摄取管道：先用 LangChain Markdown 标题分割器，再用递归字符分割（500 字符，50 字符重叠），使用 Google embedding-001 将内容向量化存入 ChromaDB，实现对博客内容的语义搜索。',
          '集成 Google Calendar API，通过对话式 AI 助手实现实时会议预约——查询 Freebusy API 获取可用时间段，并通过多轮 agentic loop 中的自定义 LangChain 工具创建日历事件。',
        ],
        tags: ['Python', 'FastAPI', 'Next.js', 'RAG', 'ChromaDB', 'LangChain', 'Gemini', 'Google Calendar API'],
        link: '/agent',
      },
    ],
    education: [
      { school: '乔治城大学', location: '华盛顿特区', degree: '计算机科学 硕士', period: '2021.08 – 2023.05' },
      { school: '南开大学', location: '天津', degree: '计算机科学 学士', period: '2017.09 – 2021.06' },
    ],
    skills: {
      '编程语言': ['Python', 'Java', 'Go', 'JavaScript', 'SQL'],
      'LLM & 检索系统': ['RAG（检索增强生成）', '向量搜索（PGVector, FAISS）', '语义 Embedding', '查询理解（MQE、查询改写、分解）', 'Prompt Engineering', 'LangGraph', 'RAGAS'],
      '后端 & 分布式系统': ['FastAPI', 'Spring Boot', 'RESTful API', 'Kafka', '事件驱动架构', '微服务', 'gRPC'],
      '数据库 & 存储': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'MS SQL Server'],
      '云计算 & DevOps': ['AWS (EC2, S3, RDS, IAM)', 'GCP', 'Docker', 'Kubernetes', 'Helm', 'CI/CD', 'Git'],
    },
  },
};

export default function ExperiencePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="relative py-16 px-6 overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-space pointer-events-none" />
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          <p className="text-xs font-mono font-semibold text-accent-purple tracking-[0.2em] mb-3 uppercase">
            {t.pageLabel}
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-text-primary mb-4">
            {lang === 'en' ? (
              <>My <span className="gradient-text">Experience</span></>
            ) : (
              <>我的<span className="gradient-text">经历</span></>
            )}
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            {t.pageDesc}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-12">

        {/* ── Work Experience ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Briefcase size={16} className="text-accent-cyan" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{t.workSection}</h2>
          </div>

          <div className="relative pl-8 border-l border-card-border space-y-10">
            {t.experiences.map((exp, i) => (
              <div key={i} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[2.25rem] top-2 w-4 h-4 rounded-full bg-space border-2 border-accent-cyan flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                </div>

                <div className="glass-card p-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-text-primary text-lg leading-tight">{exp.role}</h3>
                      <p className="text-accent-cyan font-semibold">{exp.company}</p>
                      <p className="text-text-muted text-sm">{exp.location}</p>
                    </div>
                    <span className="text-xs text-text-muted font-mono bg-card-bg border border-card-border rounded-full px-3 py-1 whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>

                  {/* Bullet points */}
                  <ul className="space-y-2.5 mb-4">
                    {exp.highlights.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-text-muted leading-relaxed">
                        <span className="text-accent-cyan mt-1 flex-shrink-0 text-xs">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-card-border">
                    {exp.tags.map((tag) => (
                      <span key={tag} className="tag-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <FolderGit2 size={16} className="text-accent-purple" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{t.projectsSection}</h2>
          </div>

          <div className="space-y-6">
            {t.projects.map((proj, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-text-primary text-lg leading-tight">{proj.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted font-mono bg-card-bg border border-card-border rounded-full px-3 py-1">{proj.period}</span>
                    {proj.link && (
                      <a href={proj.link} className="text-xs text-accent-purple font-mono hover:underline flex items-center gap-1">
                        {t.projectLive}
                      </a>
                    )}
                  </div>
                </div>
                <ul className="space-y-2.5 mb-4">
                  {proj.highlights.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-text-muted leading-relaxed">
                      <span className="text-accent-purple mt-1 flex-shrink-0 text-xs">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-card-border">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Education ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <GraduationCap size={16} className="text-accent-purple" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{t.educationSection}</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {t.education.map((edu, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-text-primary">{edu.school}</h3>
                    <p className="text-accent-purple font-medium text-sm">{edu.degree}</p>
                    <p className="text-text-muted text-sm">{edu.location}</p>
                  </div>
                  <span className="text-xs text-text-muted font-mono bg-card-bg border border-card-border rounded-full px-3 py-1 whitespace-nowrap">
                    {edu.period}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <Wrench size={16} className="text-accent-blue" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{t.skillsSection}</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(t.skills).map(([category, items]) => {
              const isWide = category === 'LLM & Retrieval Systems' || category === 'LLM & 检索系统';
              return (
                <div key={category} className={`glass-card p-5 ${isWide ? 'sm:col-span-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 size={14} className="text-accent-cyan flex-shrink-0" />
                    <h3 className="font-semibold text-text-primary text-sm">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span key={skill} className="tag-badge">{skill}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
