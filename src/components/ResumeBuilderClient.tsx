'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Braces,
  Check,
  Clipboard,
  Download,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { defaultResume } from '@/lib/defaultResume';
import type {
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeSkillGroup,
} from '@/types/resume';

type EditorMode = 'sections' | 'json';
type ContactItem = { label?: string; href?: string };

const resumeRewritePrompt = `You are helping rewrite a one-page software engineering resume JSON for a specific job description.

Input:
1. The current resume JSON that follows this schema:
{
  "basics": {
    "name": "optional string",
    "location": "optional string",
    "relocation": "optional string",
    "phone": "optional string",
    "email": "optional string",
    "portfolioLabel": "optional string",
    "portfolioUrl": "optional string"
  },
  "experiences": [
    {
      "company": "string",
      "title": "string",
      "location": "string",
      "period": "string",
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "bullets": ["string"]
    }
  ],
  "skills": [
    {
      "label": "string",
      "items": "comma-separated string"
    }
  ],
  "education": [
    {
      "school": "string",
      "location": "string",
      "degree": "string",
      "period": "string"
    }
  ]
}

2. A job description.

Task:
- Rewrite the resume JSON to better match the job description.
- Preserve facts. Do not invent employers, degrees, dates, metrics, tools, or responsibilities.
- Prefer stronger wording, better ordering, and keyword alignment over adding length.
- Keep it suitable for a one-page resume.
- Keep each bullet concise and impact-oriented.
- Use **bold** markdown only for the most important technologies, keywords, or impact phrases inside bullet strings.
- Contact fields in "basics" are optional. Omit or keep them based on the input.
- Return valid JSON only. Do not wrap it in markdown. Do not add commentary.`;

const emptyExperience: ResumeExperience = {
  company: '',
  title: '',
  location: '',
  period: '',
  bullets: [''],
};

const emptyProject: ResumeProject = {
  name: '',
  bullets: [''],
};

const emptySkill: ResumeSkillGroup = {
  label: '',
  items: '',
};

const emptyEducation: ResumeEducation = {
  school: '',
  location: '',
  degree: '',
  period: '',
};

function cloneResume(data: ResumeData): ResumeData {
  return JSON.parse(JSON.stringify(data)) as ResumeData;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
  const [moved] = items.splice(fromIndex, 1);
  if (!moved) return;
  items.splice(toIndex, 0, moved);
}

export default function ResumeBuilderClient() {
  const [resume, setResume] = useState<ResumeData>(() => cloneResume(defaultResume));
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(defaultResume, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [mode, setMode] = useState<EditorMode>('sections');
  const [showPreview, setShowPreview] = useState(true);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [pageUsage, setPageUsage] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);

  const usageLabel = useMemo(() => `${Math.round(pageUsage * 100)}%`, [pageUsage]);

  useEffect(() => {
    setJsonDraft(JSON.stringify(resume, null, 2));
  }, [resume]);

  useEffect(() => {
    const measure = () => {
      const page = pageRef.current;
      if (!page) return;
      const usage = page.scrollHeight / page.clientHeight;
      setPageUsage(usage);
      setIsOverflowing(usage > 1.01);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (pageRef.current) observer.observe(pageRef.current);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [resume]);

  const updateResume = (updater: (draft: ResumeData) => void) => {
    setResume((current) => {
      const draft = cloneResume(current);
      updater(draft);
      return draft;
    });
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft) as ResumeData;
      if (!parsed.basics || !Array.isArray(parsed.experiences) || !Array.isArray(parsed.projects)) {
        throw new Error('Missing basics, experiences, or projects.');
      }
      setResume(parsed);
      setJsonError('');
      setMode('sections');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const resetResume = () => {
    setResume(cloneResume(defaultResume));
    setJsonError('');
  };

  const exportPdf = () => {
    if (isOverflowing) {
      const ok = window.confirm('The resume is longer than one page. Export anyway?');
      if (!ok) return;
    }
    window.print();
  };

  const copyRewritePrompt = async () => {
    await navigator.clipboard.writeText(resumeRewritePrompt);
    setPromptCopied(true);
    window.setTimeout(() => setPromptCopied(false), 1600);
  };

  return (
    <div className="resume-builder min-h-screen pt-20 pb-12">
      <div className="resume-builder-header px-6 py-8 border-b border-card-border bg-grid">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-mono font-semibold text-accent-cyan tracking-[0.2em] uppercase">
              Resume Workspace
            </p>
            <h1 className="mt-3 text-3xl lg:text-4xl font-black text-text-primary">
              HTML Resume <span className="gradient-text">Builder</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm lg:text-base text-text-muted">
              Edit the structured resume, preview the Letter-size page, and export through the browser PDF flow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusPill overflowing={isOverflowing} usageLabel={usageLabel} />
            <button type="button" className="resume-action secondary" onClick={() => setShowPreview((value) => !value)}>
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button type="button" className="resume-action secondary" onClick={resetResume}>
              <RotateCcw size={16} />
              Reset
            </button>
            <button type="button" className="resume-action primary" onClick={exportPdf}>
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className={`resume-workspace-grid max-w-[1320px] mx-auto px-4 sm:px-6 py-8 grid gap-6 ${showPreview ? '' : 'preview-hidden'}`}>
        <section className="resume-panel">
          <div className="resume-mode-tabs">
            <button
              type="button"
              className={mode === 'sections' ? 'active' : ''}
              onClick={() => setMode('sections')}
            >
              <FileText size={15} />
              Sections
            </button>
            <button
              type="button"
              className={mode === 'json' ? 'active' : ''}
              onClick={() => setMode('json')}
            >
              <Braces size={15} />
              JSON
            </button>
          </div>

          {mode === 'sections' ? (
            <SectionsEditor resume={resume} updateResume={updateResume} />
          ) : (
            <div className="space-y-4">
              <textarea
                className="resume-json-input"
                value={jsonDraft}
                spellCheck={false}
                onChange={(event) => setJsonDraft(event.target.value)}
                aria-label="Resume JSON"
              />
              {jsonError && (
                <div className="resume-alert">
                  <AlertTriangle size={16} />
                  {jsonError}
                </div>
              )}
              <button type="button" className="resume-action primary w-full justify-center" onClick={applyJson}>
                Apply JSON
              </button>
            </div>
          )}
        </section>

        <section className={`resume-preview-wrap ${showPreview ? '' : 'screen-hidden-preview'}`} aria-hidden={!showPreview}>
          <div className="resume-preview-toolbar">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Eye size={16} className="text-accent-cyan" />
              Preview
            </div>
            <StatusPill overflowing={isOverflowing} usageLabel={usageLabel} compact />
          </div>

          {isOverflowing && (
            <div className="resume-alert mb-4">
              <AlertTriangle size={16} />
              Content exceeds one Letter page. Tighten bullets, reduce sections, or export only after accepting the overflow.
            </div>
          )}

          <div className="resume-print-surface">
            <ResumePreview refObject={pageRef} resume={resume} />
          </div>
        </section>
      </div>

      <section className="resume-ai-prompt max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="resume-prompt-panel">
          <div className="resume-prompt-heading">
            <div>
              <h2>AI Rewrite Prompt</h2>
              <p>Copy this prompt into another AI with your resume JSON and the job description.</p>
            </div>
            <button type="button" className="resume-action secondary" onClick={copyRewritePrompt}>
              {promptCopied ? <Check size={16} /> : <Clipboard size={16} />}
              {promptCopied ? 'Copied' : 'Copy Prompt'}
            </button>
          </div>
          <textarea className="resume-prompt-textarea" value={resumeRewritePrompt} readOnly />
        </div>
      </section>
    </div>
  );
}

function StatusPill({
  overflowing,
  usageLabel,
  compact = false,
}: {
  overflowing: boolean;
  usageLabel: string;
  compact?: boolean;
}) {
  return (
    <div className={`resume-status ${overflowing ? 'danger' : 'ok'} ${compact ? 'compact' : ''}`}>
      {overflowing ? <AlertTriangle size={15} /> : <FileText size={15} />}
      <span>{overflowing ? 'Over one page' : 'Within one page'}</span>
      <strong>{usageLabel}</strong>
    </div>
  );
}

function SectionsEditor({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: (updater: (draft: ResumeData) => void) => void;
}) {
  return (
    <div className="space-y-6">
      <EditorBlock title="Contact">
        <div className="grid sm:grid-cols-2 gap-3">
          <TextInput label="Name" value={resume.basics.name ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.name = value; })} />
          <TextInput label="Location" value={resume.basics.location ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.location = value; })} />
          <TextInput label="Relocation" value={resume.basics.relocation ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.relocation = value; })} />
          <TextInput label="Phone" value={resume.basics.phone ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.phone = value; })} />
          <TextInput label="Email" value={resume.basics.email ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.email = value; })} />
          <TextInput label="Portfolio Label" value={resume.basics.portfolioLabel ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.portfolioLabel = value; })} />
          <div className="sm:col-span-2">
            <TextInput label="Portfolio URL" value={resume.basics.portfolioUrl ?? ''} onChange={(value) => updateResume((draft) => { draft.basics.portfolioUrl = value; })} />
          </div>
        </div>
      </EditorBlock>

      <EditorBlock
        title="Experience"
        actionLabel="Add role"
        onAction={() => updateResume((draft) => { draft.experiences.push({ ...emptyExperience, bullets: [''] }); })}
      >
        {resume.experiences.map((experience, index) => (
          <DraggableCard
            key={`experience-${index}`}
            dragType="experience"
            index={index}
            title={`Role ${index + 1}`}
            onMove={(from, to) => updateResume((draft) => { moveItem(draft.experiences, from, to); })}
            onRemove={() => updateResume((draft) => { draft.experiences.splice(index, 1); })}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <TextInput label="Company" value={experience.company} onChange={(value) => updateResume((draft) => { draft.experiences[index].company = value; })} />
              <TextInput label="Title" value={experience.title} onChange={(value) => updateResume((draft) => { draft.experiences[index].title = value; })} />
              <TextInput label="Location" value={experience.location} onChange={(value) => updateResume((draft) => { draft.experiences[index].location = value; })} />
              <TextInput label="Period" value={experience.period} onChange={(value) => updateResume((draft) => { draft.experiences[index].period = value; })} />
              <div className="sm:col-span-2">
                <BulletEditor
                  dragType={`experience-bullet-${index}`}
                  bullets={experience.bullets}
                  onAdd={() => updateResume((draft) => { draft.experiences[index].bullets.push(''); })}
                  onMove={(from, to) => updateResume((draft) => { moveItem(draft.experiences[index].bullets, from, to); })}
                  onRemove={(bulletIndex) => updateResume((draft) => { draft.experiences[index].bullets.splice(bulletIndex, 1); })}
                  onChange={(bulletIndex, value) => updateResume((draft) => { draft.experiences[index].bullets[bulletIndex] = value; })}
                />
              </div>
            </div>
          </DraggableCard>
        ))}
      </EditorBlock>

      <EditorBlock
        title="Projects"
        actionLabel="Add project"
        onAction={() => updateResume((draft) => { draft.projects.push({ ...emptyProject, bullets: [''] }); })}
      >
        {resume.projects.map((project, index) => (
          <DraggableCard
            key={`project-${index}`}
            dragType="project"
            index={index}
            title={`Project ${index + 1}`}
            onMove={(from, to) => updateResume((draft) => { moveItem(draft.projects, from, to); })}
            onRemove={() => updateResume((draft) => { draft.projects.splice(index, 1); })}
          >
            <TextInput label="Name" value={project.name} onChange={(value) => updateResume((draft) => { draft.projects[index].name = value; })} />
            <BulletEditor
              dragType={`project-bullet-${index}`}
              bullets={project.bullets}
              onAdd={() => updateResume((draft) => { draft.projects[index].bullets.push(''); })}
              onMove={(from, to) => updateResume((draft) => { moveItem(draft.projects[index].bullets, from, to); })}
              onRemove={(bulletIndex) => updateResume((draft) => { draft.projects[index].bullets.splice(bulletIndex, 1); })}
              onChange={(bulletIndex, value) => updateResume((draft) => { draft.projects[index].bullets[bulletIndex] = value; })}
            />
          </DraggableCard>
        ))}
      </EditorBlock>

      <EditorBlock
        title="Skills"
        actionLabel="Add skill group"
        onAction={() => updateResume((draft) => { draft.skills.push({ ...emptySkill }); })}
      >
        {resume.skills.map((skill, index) => (
          <DraggableCard
            key={`skill-${index}`}
            dragType="skill"
            index={index}
            title={`Skill group ${index + 1}`}
            onMove={(from, to) => updateResume((draft) => { moveItem(draft.skills, from, to); })}
            onRemove={() => updateResume((draft) => { draft.skills.splice(index, 1); })}
          >
            <TextInput label="Label" value={skill.label} onChange={(value) => updateResume((draft) => { draft.skills[index].label = value; })} />
            <TextArea label="Items" value={skill.items} rows={3} onChange={(value) => updateResume((draft) => { draft.skills[index].items = value; })} />
          </DraggableCard>
        ))}
      </EditorBlock>

      <EditorBlock
        title="Education"
        actionLabel="Add school"
        onAction={() => updateResume((draft) => { draft.education.push({ ...emptyEducation }); })}
      >
        {resume.education.map((education, index) => (
          <DraggableCard
            key={`education-${index}`}
            dragType="education"
            index={index}
            title={`School ${index + 1}`}
            onMove={(from, to) => updateResume((draft) => { moveItem(draft.education, from, to); })}
            onRemove={() => updateResume((draft) => { draft.education.splice(index, 1); })}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <TextInput label="School" value={education.school} onChange={(value) => updateResume((draft) => { draft.education[index].school = value; })} />
              <TextInput label="Location" value={education.location} onChange={(value) => updateResume((draft) => { draft.education[index].location = value; })} />
              <TextInput label="Degree" value={education.degree} onChange={(value) => updateResume((draft) => { draft.education[index].degree = value; })} />
              <TextInput label="Period" value={education.period} onChange={(value) => updateResume((draft) => { draft.education[index].period = value; })} />
            </div>
          </DraggableCard>
        ))}
      </EditorBlock>
    </div>
  );
}

function EditorBlock({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="resume-editor-block">
      <div className="resume-editor-heading">
        <h2>{title}</h2>
        {actionLabel && onAction && (
          <button type="button" onClick={onAction}>
            <Plus size={14} />
            {actionLabel}
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DraggableCard({
  dragType,
  index,
  title,
  onMove,
  onRemove,
  children,
}: {
  dragType: string;
  index: number;
  title: string;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const transferKey = `application/x-resume-${dragType}`;

  return (
    <div
      className="resume-editor-card"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(transferKey, String(index));
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData(transferKey));
        if (Number.isInteger(fromIndex)) onMove(fromIndex, index);
      }}
    >
      <div className="resume-card-heading">
        <span>
          <GripVertical size={15} />
          {title}
        </span>
        <button type="button" onClick={onRemove} aria-label={`Remove ${title}`}>
          <Trash2 size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}

function BulletEditor({
  dragType,
  bullets,
  onAdd,
  onMove,
  onRemove,
  onChange,
}: {
  dragType: string;
  bullets: string[];
  onAdd: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}) {
  const transferKey = `application/x-resume-${dragType}`;

  return (
    <div className="resume-bullet-editor">
      <div className="resume-bullet-heading">
        <span>Bullets</span>
        <button type="button" onClick={onAdd}>
          <Plus size={14} />
          Add bullet
        </button>
      </div>
      <div className="space-y-2">
        {bullets.map((bullet, index) => (
          <div
            className="resume-bullet-row"
            key={`${dragType}-${index}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData(transferKey, String(index));
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const fromIndex = Number(event.dataTransfer.getData(transferKey));
              if (Number.isInteger(fromIndex)) onMove(fromIndex, index);
            }}
          >
            <span className="resume-drag-handle" aria-hidden="true">
              <GripVertical size={15} />
            </span>
            <textarea
              value={bullet}
              rows={3}
              onChange={(event) => onChange(index, event.target.value)}
              aria-label={`Bullet ${index + 1}`}
            />
            <button type="button" onClick={() => onRemove(index)} aria-label={`Remove bullet ${index + 1}`}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="resume-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="resume-field">
      <span>{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ResumePreview({
  refObject,
  resume,
}: {
  refObject: React.RefObject<HTMLDivElement>;
  resume: ResumeData;
}) {
  const rawContactItems: ContactItem[] = [
    { label: resume.basics.location, href: undefined },
    { label: resume.basics.relocation, href: undefined },
    { label: resume.basics.phone, href: undefined },
    { label: resume.basics.portfolioLabel, href: resume.basics.portfolioUrl },
    { label: resume.basics.email, href: resume.basics.email ? `mailto:${resume.basics.email}` : undefined },
  ];
  const contactItems = rawContactItems.filter(
    (item): item is ContactItem & { label: string } => Boolean(item.label),
  );

  return (
    <div className="resume-sheet" ref={refObject}>
      <header className="resume-document-header">
        {resume.basics.name && <h1>{resume.basics.name}</h1>}
        <div>
          {contactItems.map((item, index) => {
            return (
              <span key={`${item.label}-${index}`}>
                {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                {index < contactItems.length - 1 && <b>|</b>}
              </span>
            );
          })}
        </div>
      </header>

      <ResumeSection title="Experience">
        {resume.experiences.map((experience, index) => (
          <article className="resume-entry" key={`${experience.company}-${experience.period}-${index}`}>
            <div className="resume-entry-top">
              <strong>{experience.company}</strong>
              <span>{experience.period}</span>
            </div>
            <div className="resume-entry-sub">
              <em>{experience.title}</em>
              <span>{experience.location}</span>
            </div>
            <ResumeBullets bullets={experience.bullets} />
          </article>
        ))}
      </ResumeSection>

      <ResumeSection title="Projects">
        {resume.projects.map((project, index) => (
          <article className="resume-entry" key={`${project.name}-${index}`}>
            <div className="resume-entry-top">
              <strong>{project.name}</strong>
            </div>
            <ResumeBullets bullets={project.bullets} />
          </article>
        ))}
      </ResumeSection>

      <ResumeSection title="Skills">
        <div className="resume-skills">
          {resume.skills.map((skill, index) => (
            <p key={`${skill.label}-${index}`}>
              <strong>{skill.label}:</strong> {skill.items}
            </p>
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title="Education">
        {resume.education.map((education, index) => (
          <article className="resume-education" key={`${education.school}-${index}`}>
            <p>
              <strong>{education.school}</strong>, {education.location} - {education.degree}
            </p>
            <span>{education.period}</span>
          </article>
        ))}
      </ResumeSection>
    </div>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-document-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ResumeBullets({ bullets }: { bullets: string[] }) {
  return (
    <ul>
      {bullets.filter(Boolean).map((bullet, index) => (
        <li key={`${bullet}-${index}`}>
          <InlineFormattedText text={bullet} />
        </li>
      ))}
    </ul>
  );
}

function InlineFormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}
