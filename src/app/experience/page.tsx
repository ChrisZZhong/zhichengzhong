import type { Metadata } from 'next';
import { Briefcase, GraduationCap, Wrench, Code2, FolderGit2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Experience | Zhicheng Zhong',
  description: 'Professional experience, education, and skills of Zhicheng Zhong.',
};

const experiences = [
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
      'Refactored a monolithic payment orchestration service into horizontally scalable event-driven microservices on OpenShift (Kubernetes) using Java and Spring Boot, enabling 3× peak traffic growth.',
      'Implemented Transactional Outbox with CDC (Debezium) pattern to decouple email receipt generation from the core payment workflow, publishing domain events to Kafka with at-least-once delivery and idempotent consumers, improving notification reliability to 99.9%.',
      'Built a fault-tolerant retry framework with exponential backoff and jitter to handle transient downstream failures, integrating Dead Letter Queue (DLQ) routing and replay capability, reducing long-tail notification failures by ~90%.',
    ],
    tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'OpenShift', 'Debezium', 'CDC', 'Microservices'],
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
];

const projects = [
  {
    name: 'Personal Portfolio AI Agent',
    period: '2025',
    highlights: [
      'Built a full-stack AI agent for personal portfolio with a FastAPI (SSE streaming) backend and Next.js frontend, featuring RAG-powered Q&A, real-time Google Calendar scheduling, deployed on Railway + Vercel.',
      'Designed a two-stage RAG ingestion pipeline using LangChain\'s Markdown header splitter followed by recursive character chunking (500 chars, 50 overlap), storing embeddings in ChromaDB with Google\'s embedding-001 model to enable semantic search over personal blog content.',
      'Integrated Google Calendar API to enable real-time meeting scheduling through a conversational AI agent — queries Freebusy API to surface available time slots, then creates calendar events via a custom LangChain tool invoked within a multi-turn agentic loop.',
    ],
    tags: ['Python', 'FastAPI', 'Next.js', 'RAG', 'ChromaDB', 'LangChain', 'Gemini', 'Google Calendar API'],
    link: '/agent',
  },
];

const education = [
  {
    school: 'Georgetown University',
    location: 'Washington, D.C.',
    degree: 'M.S. in Computer Science',
    period: 'Aug 2021 – May 2023',
  },
  {
    school: 'Nankai University',
    location: 'Tianjin, China',
    degree: 'B.S. in Computer Science',
    period: 'Sep 2017 – Jun 2021',
  },
];

const skills: Record<string, string[]> = {
  'Languages': ['Python', 'Java', 'Go', 'JavaScript', 'SQL'],
  'LLM & Retrieval Systems': ['RAG (Retriever-Augmented Generation)', 'Vector Search (PGVector, FAISS)', 'Semantic Embeddings', 'Query Understanding (MQE, Rewriting, Decomposition)', 'Prompt Engineering', 'LangGraph', 'RAGAS'],
  'Backend & Distributed Systems': ['FastAPI', 'Spring Boot', 'RESTful APIs', 'Kafka', 'Event-Driven Architecture', 'Microservices', 'gRPC'],
  'Databases & Storage': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'MS SQL Server'],
  'Cloud & DevOps': ['AWS (EC2, S3, RDS, IAM)', 'GCP', 'Docker', 'Kubernetes', 'Helm', 'CI/CD', 'Git'],
};

export default function ExperiencePage() {
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
            CAREER JOURNEY
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-text-primary mb-4">
            My <span className="gradient-text">Experience</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Software developer specializing in distributed microservices, event-driven
            systems, and AI/RAG-powered tools.
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
            <h2 className="text-xl font-bold text-text-primary">Work Experience</h2>
          </div>

          <div className="relative pl-8 border-l border-card-border space-y-10">
            {experiences.map((exp, i) => (
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
            <h2 className="text-xl font-bold text-text-primary">Projects</h2>
          </div>

          <div className="space-y-6">
            {projects.map((proj, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-text-primary text-lg leading-tight">{proj.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted font-mono bg-card-bg border border-card-border rounded-full px-3 py-1">{proj.period}</span>
                    {proj.link && (
                      <a href={proj.link} className="text-xs text-accent-purple font-mono hover:underline flex items-center gap-1">
                        Live ↗
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
            <h2 className="text-xl font-bold text-text-primary">Education</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {education.map((edu, i) => (
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
            <h2 className="text-xl font-bold text-text-primary">Technical Skills</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className={`glass-card p-5 ${category === 'LLM & RAG' ? 'sm:col-span-2' : ''}`}>
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
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
