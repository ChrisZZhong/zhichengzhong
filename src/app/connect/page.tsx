import type { Metadata } from 'next';
import { Mail, Linkedin, Github, Phone, MessageCircle, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Connect | Zhicheng Zhong',
  description: 'Get in touch with Zhicheng Zhong.',
};

const contacts = [
  {
    icon: Mail,
    label: 'Email',
    value: 'zzcjob397@gmail.com',
    href: 'mailto:zzcjob397@gmail.com',
    description: 'Best for detailed inquiries & collaboration proposals',
    color: 'from-accent-cyan/20 to-accent-blue/10',
    borderColor: 'border-accent-cyan/20 hover:border-accent-cyan/50',
    iconColor: 'text-accent-cyan',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/zhicheng-z',
    href: 'https://www.linkedin.com/in/zhicheng-z-35805722b/',
    description: 'Connect professionally and follow my career updates',
    color: 'from-blue-500/10 to-blue-600/5',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    iconColor: 'text-blue-400',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/ChrisZZhong',
    href: 'https://github.com/ChrisZZhong',
    description: 'Check out my open-source projects and contributions',
    color: 'from-slate-500/10 to-slate-600/5',
    borderColor: 'border-slate-500/20 hover:border-slate-500/50',
    iconColor: 'text-slate-300',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '202-725-1579',
    href: 'tel:+12027251579',
    description: 'Available for quick calls during business hours',
    color: 'from-green-500/10 to-green-600/5',
    borderColor: 'border-green-500/20 hover:border-green-500/50',
    iconColor: 'text-green-400',
  },
];

export default function ConnectPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="relative py-16 px-6 overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-space pointer-events-none" />
        <div
          className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="max-w-4xl mx-auto relative text-center">
          <p className="text-xs font-mono font-semibold text-accent-cyan tracking-[0.2em] mb-3 uppercase">
            REACH OUT
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-text-primary mb-4">
            Let&apos;s <span className="gradient-text">Connect</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Whether you have a project in mind, want to discuss tech, or just want to say hello —
            I&apos;m always happy to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12">
        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {contacts.map(({ icon: Icon, label, value, href, description, color, borderColor, iconColor }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`glass-card ${borderColor} p-6 flex flex-col gap-4 group transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} border ${borderColor.split(' ')[0]} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent-cyan transition-all duration-200"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className="font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                  {value}
                </p>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Availability status */}
        <div className="mt-10 glass-card p-6 text-center border-accent-cyan/10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-green-400 font-semibold text-sm">Available for opportunities</span>
          </div>
          <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed">
            I&apos;m currently open to full-time roles, consulting work, and interesting side projects.
            Feel free to reach out!
          </p>
        </div>

        {/* Response time note */}
        <div className="mt-6 text-center">
          <p className="text-text-muted text-xs font-mono flex items-center justify-center gap-2">
            <MessageCircle size={12} className="text-accent-cyan" />
            I typically respond within 24–48 hours
          </p>
        </div>
      </div>
    </div>
  );
}
