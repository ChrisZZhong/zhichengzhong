import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Zhicheng Zhong | Software Engineer',
  description: 'Personal portfolio of Zhicheng Zhong — Software Engineer, System Design enthusiast, and backend developer.',
  openGraph: {
    title: 'Zhicheng Zhong | Software Engineer',
    description: 'Personal portfolio of Zhicheng Zhong.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-space text-text-primary antialiased">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
