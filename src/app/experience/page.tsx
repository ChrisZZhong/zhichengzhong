'use client';

import { Briefcase, GraduationCap, Wrench, Code2, FolderGit2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  en: {
    pageLabel: 'CAREER JOURNEY',
    pageTitle: 'My Experience',
    pageDesc: 'Software developer specializing in distributed microservices, event-driven systems, backend platforms, and AI-powered tools.',
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
          'Drove the migration of monolithic payment orchestration services into horizontally scalable microservices on OpenShift (Kubernetes) using Java and Spring Boot, enabling 3× peak traffic growth and eliminating peak-hour throughput bottlenecks.',
          'Implemented Transactional Outbox with CDC (Debezium) pattern to decouple email receipt generation from the core payment workflow, publishing domain events to Kafka with at-least-once delivery and idempotent consumers, achieving over 99% successful notification delivery.',
          'Developed a fault-tolerant retry mechanism with exponential backoff and jitter, along with Dead Letter Queue (DLQ) routing and replay capabilities, reducing long-tail notification failures by ~90%.',
          'Partnered with infrastructure, QA, and application teams to support CAT & production releases, troubleshoot payment processing issues, and ensure high service availability across multiple deployment environments.',
        ],
        tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'OpenShift', 'Debezium', 'DLQ', 'Microservices'],
      },
      {
        company: 'Fiserv',
        role: 'Software Engineer',
        period: 'Jul 2023 – Oct 2024',
        location: 'Berkeley Heights, NJ',
        highlights: [
          'Developed a Redis cache-aside layer in Java (JavaEE) to offload database reads for client configurations and improve API latency, cutting average API latency by over 50% and restoring SLA compliance.',
          'Built a message-count-based Kafka reconciliation service to validate customer configuration propagation from Kafka to Redis across time windows, detect persistent mismatches, and trigger re-runs to restore consistency in production.',
          'Implemented a high-throughput Kafka consumer group with batch processing (100 msgs/batch) to ingest customer configuration updates into Redis, sustaining ~10k msgs/sec under production load.',
        ],
        tags: ['Java', 'JavaEE', 'Redis', 'Kafka', 'Reconciliation', 'Batch Processing'],
      },
      {
        company: 'Tencent',
        role: 'Backend Developer Intern',
        period: 'Jul 2020 – Oct 2020',
        location: 'Shenzhen, China',
        highlights: [
          'Refactored a KPI anomaly detection platform for QQ Browser using Go and gRPC, deployed minute-level multi-algorithm anomaly detection & root cause analysis with results in Druid OLAP DB, cutting KPI triage time from hours to minutes.',
        ],
        tags: ['Go', 'gRPC', 'Druid', 'AIOps', 'Anomaly Detection'],
      },
    ],
    projects: [
      {
        name: 'Options Market Intelligence Agent',
        period: '2026',
        highlights: [
          'Built an AI-powered options research agent using Python and FastAPI that automatically retrieves portfolio holdings from Robinhood, computes Gamma Exposure (GEX), Volatility Exposure (VEX), and historical/current implied volatility (IV) metrics, and generates interactive heatmaps for pre-market analysis.',
          'Integrated the Gemini API to analyze GEX, VEX, IV trends, and portfolio positioning, producing structured pre-market reports with market outlook, key support/resistance levels, volatility regime assessment, and risk-aware portfolio insights.',
        ],
        tags: ['Python', 'FastAPI', 'Gemini API', 'Robinhood', 'GEX', 'VEX', 'Implied Volatility', 'Heatmaps'],
        link: '',
      },
    ],
    education: [
      { school: 'Georgetown University', location: 'Washington, D.C.', degree: 'M.S. in Computer Science', period: 'Aug 2021 – May 2023' },
      { school: 'Nankai University', location: 'Tianjin, China', degree: 'B.S. in Computer Science', period: 'Sep 2017 – Jun 2021' },
    ],
    skills: {
      'Languages': ['Java', 'Python', 'Go'],
      'Backend & Distributed Systems': ['Spring Boot', 'RESTful APIs', 'Microservices', 'gRPC'],
      'Databases & MQ': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle DB', 'Kafka'],
      'Cloud & DevOps': ['AWS (EC2, S3, RDS, IAM)', 'GCP', 'Docker', 'Kubernetes', 'Helm', 'CI/CD', 'Git', 'OpenShift'],
      'AI': ['RAG', 'LangChain', 'LangGraph', 'Vector Search', 'Prompt Engineering', 'Codex', 'Cursor', 'Claude'],
    },
  },
  zh: {
    pageLabel: '职业历程',
    pageTitle: '我的经历',
    pageDesc: '专注于分布式微服务、事件驱动系统、后端平台与 AI 工具的软件工程师。',
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
          '推动将单体支付编排服务迁移为基于 OpenShift (Kubernetes) 的横向可扩展微服务，使用 Java 和 Spring Boot，支撑 3 倍峰值流量增长并消除高峰时段吞吐瓶颈。',
          '实现 Transactional Outbox 与 CDC (Debezium) 模式，将邮件收据生成与核心支付流程解耦，通过 Kafka 以至少一次投递语义发布领域事件，并配合幂等消费者，实现超过 99% 的通知成功投递率。',
          '开发具备指数退避与抖动的容错重试机制，并结合 Dead Letter Queue (DLQ) 路由与重放能力，将长尾通知失败率降低约 90%。',
          '与基础设施、QA 和应用团队协作支持 CAT 与生产发布，排查支付处理问题，并保障多个部署环境下的高服务可用性。',
        ],
        tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'OpenShift', 'Debezium', 'DLQ', '微服务'],
      },
      {
        company: 'Fiserv',
        role: '软件工程师',
        period: '2023.07 – 2024.10',
        location: '新泽西州 Berkeley Heights',
        highlights: [
          '使用 Java (JavaEE) 开发 Redis cache-aside 缓存层，降低客户配置查询对数据库的读压力并改善 API 延迟，将平均 API 延迟降低超过 50%，恢复 SLA 合规。',
          '构建基于消息计数的 Kafka 对账服务，按时间窗口校验客户配置从 Kafka 到 Redis 的传播结果，检测持续性不一致并触发重跑，以恢复生产环境一致性。',
          '实现高吞吐 Kafka 消费者组，采用批处理模式（100 条/批）将客户配置更新写入 Redis，在生产负载下稳定支撑约 10k 条/秒的消息处理速率。',
        ],
        tags: ['Java', 'JavaEE', 'Redis', 'Kafka', '对账服务', '批处理'],
      },
      {
        company: '腾讯 Tencent',
        role: '后端开发实习生',
        period: '2020.07 – 2020.10',
        location: '深圳',
        highlights: [
          '使用 Go 和 gRPC 重构 QQ 浏览器 KPI 异常检测平台，部署分钟级多算法异常检测与根因分析，结果存入 Druid OLAP 数据库，将 KPI 故障排查时间从数小时缩短至数分钟。',
        ],
        tags: ['Go', 'gRPC', 'Druid', 'AIOps', '异常检测'],
      },
    ],
    projects: [
      {
        name: '期权市场智能分析 Agent',
        period: '2026',
        highlights: [
          '使用 Python 和 FastAPI 构建 AI 驱动的期权研究 Agent，自动从 Robinhood 获取投资组合持仓，计算 Gamma Exposure (GEX)、Volatility Exposure (VEX) 以及历史/当前隐含波动率 (IV) 指标，并生成交互式热力图用于盘前分析。',
          '集成 Gemini API 分析 GEX、VEX、IV 趋势和组合仓位，生成结构化盘前报告，覆盖市场展望、关键支撑/阻力位、波动率状态评估和风险感知的组合洞察。',
        ],
        tags: ['Python', 'FastAPI', 'Gemini API', 'Robinhood', 'GEX', 'VEX', '隐含波动率', '热力图'],
        link: '',
      },
    ],
    education: [
      { school: '乔治城大学', location: '华盛顿特区', degree: '计算机科学 硕士', period: '2021.08 – 2023.05' },
      { school: '南开大学', location: '天津', degree: '计算机科学 学士', period: '2017.09 – 2021.06' },
    ],
    skills: {
      '编程语言': ['Java', 'Python', 'Go'],
      '后端 & 分布式系统': ['Spring Boot', 'RESTful API', '微服务', 'gRPC'],
      '数据库 & 消息队列': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle DB', 'Kafka'],
      '云计算 & DevOps': ['AWS (EC2, S3, RDS, IAM)', 'GCP', 'Docker', 'Kubernetes', 'Helm', 'CI/CD', 'Git', 'OpenShift'],
      'AI': ['RAG', 'LangChain', 'LangGraph', '向量搜索', 'Prompt Engineering', 'Codex', 'Cursor', 'Claude'],
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
