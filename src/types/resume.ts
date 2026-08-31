export type ResumeBasics = {
  name?: string;
  location?: string;
  relocation?: string;
  phone?: string;
  email?: string;
  portfolioLabel?: string;
  portfolioUrl?: string;
};

export type ResumeExperience = {
  company: string;
  title: string;
  location: string;
  period: string;
  bullets: string[];
};

export type ResumeProject = {
  name: string;
  bullets: string[];
};

export type ResumeSkillGroup = {
  label: string;
  items: string;
};

export type ResumeEducation = {
  school: string;
  location: string;
  degree: string;
  period: string;
};

export type ResumeData = {
  basics: ResumeBasics;
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation[];
};
