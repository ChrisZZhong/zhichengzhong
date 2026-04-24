import type { Metadata } from 'next';
import ConnectClient from '@/components/ConnectClient';

export const metadata: Metadata = {
  title: 'Connect | Zhicheng Zhong',
  description: 'Get in touch with Zhicheng Zhong.',
};

export default function ConnectPage() {
  return <ConnectClient />;
}
