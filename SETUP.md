# Portfolio Setup Guide

## Quick Start

```bash
cd portfolio
npm install
npm run dev
```

Open https://localhost:3000

## Deploy to Vercel

1. Push the `portfolio/` folder to GitHub as a new repo
2. Go to vercel.com → New Project → Import your repo
3. Vercel auto-detects Next.js — just click Deploy

## Personalize Before Deploying

Search for these placeholder values and replace them in `src/components/HomeClient.tsx` and `src/app/connect/page.tsx`:

| Placeholder | Replace with |
|---|---|
| `your@email.com` | Your real email |
| `linkedin.com/in/yourprofile` | Your LinkedIn URL |
| `github.com/yourusername` | Your GitHub URL |
| `+1 (XXX) XXX-XXXX` | Your phone (or remove) |
| `YOUR_COMPANY` / `YOUR_LINKEDIN` / `YOUR_GITHUB` in HomeClient | Your real URLs |
| Bio text in HomeClient.tsx | Your actual bio |
| Experience entries in experience/page.tsx | Your real experience |

## Add New Blog Posts

Drop any `.md` file into the `_posts/` folder with this frontmatter:

```markdown
---
layout: post
title: "My Post Title"
date: 2024-03-15
description: "Short description"
tag: System Design
---

Your content here...
```

Mermaid diagrams are supported natively:

```markdown
\`\`\`mermaid
graph TD
  A --> B --> C
\`\`\`
```

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark sci-fi design system
- **react-markdown** + **remark-gfm** — markdown rendering
- **react-syntax-highlighter** — code syntax highlighting
- **mermaid** — diagram rendering (client-side)
- **framer-motion** — animations
- **lucide-react** — icons
