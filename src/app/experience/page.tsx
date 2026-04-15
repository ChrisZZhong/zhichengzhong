import type { Metadata } from 'next';
import { Briefcase, Code2, GraduationCap, Star, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Experience | Zhicheng Zhong',
  description: 'Professional experience, education, and skills.',
};

const experiences = [
  {
    company: 'Your Company Name',
    role: 'Software Engineer',
    period: '2023 – Present',
    location: 'City, State',
    description: [
      'Designed and implemented distributed microservices handling X requests/second',
      'Built event-driven pipelines using Apache Kafka for real-time data processing',
      'Improved system reliability from 99.5% to 99.99% SLA through chaos engineering',
    ],
    tags: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'Kubernetes'],
    type: 'work',
  },
  {
    company: 'Previous Company Name',
    role: 'Backend Developer',
    period: '2021 – 2023',
    location: 'City, State',
    description: [
      'Developed RESTful APIs serving millions of daily active users',
      'Optimized database queries reducing p99 latency by 40%',
      'Led migration from monolith to microservices architecture',
    ],
    tags: ['Java', 'Spring MVC', 'MySQL', 'Docker', 'CI/CD'],
    type: 'work',
  },
];

const education = [
  {
    school: 'Your University',
    degree: 'Bachelor of Science in Computer Science',
    period: '2017 – 2021',
    gpa: '3.X / 4.0',
    highlights: ['Algorithms & Data Structures', 'Operating Systems', 'Distributed Computing'],
  },
];

const skills = {
  'Languages': ['Java', 'Python', 'TypeScript', 'SQL'],
  'Frameworks': ['Spring Boot', 'Spring MVC', 'Flask', 'Next.js'],
  'Infrastructure': ['Kafka', 'Redis', 'Docker', 'Kubernetes', 'AWS'],
  'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'DynamoDB'],
  'Tools': ['Git', 'Jenkins', 'Splunk', 'Grafana', 'Newman'],
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
            A collection of roles, projects, and skills I&apos;ve accumulated as a software engineer.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-12">
        {/* Work Experience */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <Briefcase size={16} className="text-accent-cyan" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Work Experience</h2>
          </div>

          {/* Timeline */}
          <div className="relative pl-8 border-l border-card-border space-y-8">
            {experiences.map((exp, i) => (
              <div key={i} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[2.25rem] top-2 w-4 h-4 rounded-full bg-space border-2 border-accent-cyan flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                </div>

                <div className="glass-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-text-primary text-lg">{exp.role}</h3>
                      <p className="text-accent-cyan font-semibold">{exp.company}</p>
                      <p className="text-text-muted text-sm">{exp.location}</p>
                    </div>
                    <span className="text-xs text-text-muted font-mono bg-card-bg border border-card-border rounded-full px-3 py-1 whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {exp.description.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-text-muted">
                        <span className="text-accent-cyan mt-1.5 flex-shrink-0">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.tags.map((tag) => (
                      <span key={tag} className="tag-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <GraduationCap size={16} className="text-accent-purple" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Education</h2>
          </div>

          <div className="space-y-4">
            {education.map((edu, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-text-primary">{edu.degree}</h3>
                    <p className="text-accent-purple font-semibold">{edu.school}</p>
                    {edu.gpa && <p className="text-text-muted text-sm">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-xs text-text-muted font-mono bg-card-bg border border-card-border rounded-full px-3 py-1 whitespace-nowrap">
                    {edu.period}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {edu.highlights.map((h) => (
                    <span key={h} className="tag-badge">{h}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <Wrench size={16} className="text-accent-blue" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Technical Skills</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 size={14} className="text-accent-cyan" />
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

        {/* Note */}
        <div className="glass-card p-5 border-accent-cyan/20 text-center">
          <Star size={16} className="text-accent-cyan mx-auto mb-2" />
          <p className="text-text-muted text-sm italic">
            This page is under construction. More details coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
