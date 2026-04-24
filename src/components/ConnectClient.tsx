'use client';

import { Mail, Linkedin, Github, Phone, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const contactsEn = [
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

const contactsZh = [
  {
    icon: Mail,
    label: '邮件',
    value: 'zzcjob397@gmail.com',
    href: 'mailto:zzcjob397@gmail.com',
    description: '适合详细咨询与合作提案',
    color: 'from-accent-cyan/20 to-accent-blue/10',
    borderColor: 'border-accent-cyan/20 hover:border-accent-cyan/50',
    iconColor: 'text-accent-cyan',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/zhicheng-z',
    href: 'https://www.linkedin.com/in/zhicheng-z-35805722b/',
    description: '职业社交，欢迎关注我的职业动态',
    color: 'from-blue-500/10 to-blue-600/5',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    iconColor: 'text-blue-400',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/ChrisZZhong',
    href: 'https://github.com/ChrisZZhong',
    description: '查看我的开源项目与代码贡献',
    color: 'from-slate-500/10 to-slate-600/5',
    borderColor: 'border-slate-500/20 hover:border-slate-500/50',
    iconColor: 'text-slate-300',
  },
  {
    icon: Phone,
    label: '电话',
    value: '202-725-1579',
    href: 'tel:+12027251579',
    description: '工作时间内可接受快速通话',
    color: 'from-green-500/10 to-green-600/5',
    borderColor: 'border-green-500/20 hover:border-green-500/50',
    iconColor: 'text-green-400',
  },
];

const t = {
  en: {
    label: 'REACH OUT',
    title: "Let's",
    titleGradient: 'Connect',
    desc: "Whether you have a project in mind, want to discuss tech, or just want to say hello — I'm always happy to hear from you.",
    available: 'Available for opportunities',
    availableDesc: "I'm currently open to full-time roles, consulting work, and interesting side projects. Feel free to reach out!",
    responseTime: 'I typically respond within 24–48 hours',
  },
  zh: {
    label: '联系我',
    title: '欢迎',
    titleGradient: '联系',
    desc: '无论你有项目想法、想聊聊技术，还是只是想打个招呼——我都很乐意听取。',
    available: '正在寻找新机会',
    availableDesc: '目前对全职岗位、咨询工作和有趣的项目合作持开放态度，欢迎随时联系！',
    responseTime: '通常在 24–48 小时内回复',
  },
};

export default function ConnectClient() {
  const { lang } = useLanguage();
  const contacts = lang === 'en' ? contactsEn : contactsZh;
  const tx = t[lang];

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
            {tx.label}
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-text-primary mb-4">
            {tx.title} <span className="gradient-text">{tx.titleGradient}</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            {tx.desc}
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
            <span className="text-green-400 font-semibold text-sm">{tx.available}</span>
          </div>
          <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed">
            {tx.availableDesc}
          </p>
        </div>

        {/* Response time note */}
        <div className="mt-6 text-center">
          <p className="text-text-muted text-xs font-mono flex items-center justify-center gap-2">
            <MessageCircle size={12} className="text-accent-cyan" />
            {tx.responseTime}
          </p>
        </div>
      </div>
    </div>
  );
}
