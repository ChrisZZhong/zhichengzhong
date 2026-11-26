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

### Excalidraw diagrams

Save a drawing under `public/media/` and reference it using the usual Markdown image syntax. The blog renders a local `.excalidraw` file as a read-only diagram.

```markdown
![Search indexing and query flow](/media/system-design/post-search.excalidraw)
```

For a static image, export SVG from Excalidraw and use the same syntax with `.svg`. Keep the editable source outside `public/` if you only want to publish the exported image.

### Edit blog posts and drawings locally

```bash
npm run blog:edit
```

Open [the local blog](http://127.0.0.1:3000/blog). Select a post and click **Unlock editing**, then enter the Interviews password. The same session enables **Edit post** across blog categories, including Interviews. Use the Markdown toolbar for headings, lists, and code blocks. Use **Undo** and **Redo** or the browser's usual editing shortcuts.

In the preview, use **Insert Excalidraw here** after a Markdown paragraph or complete block. A blank line between prose lines starts a new paragraph. Multiple sentences and soft line breaks in one paragraph share a single button. Solution cards support the same placement inside their content. Click **Insert drawing** to place the image in the draft, then **Save to workspace** to write your changes.

To reuse shapes copied from Excalidraw, click the drawing canvas and paste with **Cmd+V** or **Ctrl+V**.

The article's URL path determines both drawing folders:

- Editable source in `diagrams/<category>/<post-slug>/<drawing>.excalidraw`
- Public article SVG in `public/media/diagrams/<category>/<post-slug>/<drawing>.svg`
- Password-protected article SVG alongside its source in `diagrams/<category>/<post-slug>/<drawing>.svg`, served through the blog's password check

Click **Edit drawing** on a managed diagram to reopen its source. Saving a revision updates the article's image link and keeps the previous drawing files. Save to the workspace, then commit the Markdown and both drawing files together when you are ready to publish. Editing is available to the local authoring server on `127.0.0.1`.

### System Design solution cards

Place alternatives under their shared question heading. Use one `<details>` per solution with a one-line `<summary>`. Use `data-rating="great"` for pale green, `data-rating="good"` for pale yellow, and `data-rating="bad"` for pale red. Cards start collapsed and open independently.

```markdown
### How should the search service handle repeat queries?

<details class="solution-card" data-rating="good">
<summary>Good Solution: Cache results by query</summary>
<div class="solution-card-body">

##### Approach

Key the cache by the normalized query and its filters.

##### Challenges

Set a TTL that balances freshness against hit rate.

</div>
</details>
```

Leave a blank line before the first Markdown block and after the last one inside the body. The body supports normal Markdown, including diagrams, lists, and code blocks. Include `Challenges` when you have trade-offs to document. Close the card before moving on to shared takeaways or the next section.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark sci-fi design system
- **react-markdown** + **remark-gfm** — markdown rendering
- **react-syntax-highlighter** — code syntax highlighting
- **mermaid** — diagram rendering (client-side)
- **framer-motion** — animations
- **lucide-react** — icons
