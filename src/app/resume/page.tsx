import type { Metadata } from 'next';
import ResumeBuilderClient from '@/components/ResumeBuilderClient';

export const metadata: Metadata = {
  title: 'Resume Builder | Zhicheng Zhong',
  description: 'Edit, preview, and export a one-page HTML resume.',
};

export default function ResumePage() {
  return <ResumeBuilderClient />;
}
