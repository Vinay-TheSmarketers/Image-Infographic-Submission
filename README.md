# vIS — Smarketers Infographic Submitter Architecture & Strategy Guide

> **Smarketers Off-Page Suite** — Local-first Next.js application that inspects, scores, and organizes public infographic URLs before off-page distribution, storing targets in a local SQLite database via Prisma ORM.

---

## 🤖 Automation Matrix: Automated vs. Human Operator Boundaries

To maximize visual link building equity and ensure high directory acceptance rates, vIS delineates automated inspection from operator tasks:

```
┌─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ ⚡ 100% AUTOMATED BY vIS ENGINE                        │ 👤 HUMAN OPERATOR GATEWAY & DIRECTORY SUBMISSION        │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ • Direct image link & Open Graph meta tag detection     │ • Designing high-quality 800x2000px vertical infographics│
│ • Aspect ratio & resolution calculation                 │ • Creating custom embed code with targeted backlinks    │
│ • 4-criterion readiness scoring (0–100%)                │ • Uploading visual assets to Pinterest, Visual.ly, etc. │
│ • Distribution channel matching                         │ • Confirming image indexing via Google Images Search    │
│ • Prisma ORM SQLite database persistence                │ • Monitoring referral traffic from visual directories   │
└─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🎯 Intricate Visual SEO Strategy Playbook

### 1. Infographic Dimensions & Readiness Standards
vIS evaluates visual assets across four critical readiness standards:
- **Vertical Aspect Ratio (> 2:1)**: Tall vertical infographics (e.g. 800px width by 2000px–3000px height) achieve the highest engagement rates on Pinterest and infographic directories.
- **High Resolution & Crisp Typography**: Image text must be legibly readable without zooming.
- **Open Graph Metadata Completeness**: Host page must configure `og:image`, `og:title`, and `og:description` tags.

### 2. The HTML Embed Code Strategy
When publishing an infographic on your website, provide an easily copyable HTML embed snippet:
```html
<a href="https://yourbrand.com/target-page">
  <img src="https://yourbrand.com/images/infographic.png" alt="Niche Research Infographic by YourBrand" />
</a>
<p>Source: <a href="https://yourbrand.com/target-page">YourBrand</a></p>
```
When other bloggers embed your infographic on their sites, you automatically earn a contextual dofollow backlink!

---

## 🏗️ End-to-End System Architecture

```mermaid
flowchart TD
    User([User Input: Infographic Page / Image URL]) --> UI[Next.js App UI]
    UI -->|POST /api/submissions| API[Route Handler /api/submissions]
    
    subgraph Inspection & Scraper Engine
        API --> Fetcher[HTTP Redirect & Fetcher]
        Fetcher --> Inspector[infographic.ts - Infographic Inspector]
        Inspector -->|Check Image Types| ImageCheck{Direct Image or OG Meta?}
        ImageCheck -->|Direct Link| Direct[Parse Image Dimensions & Format]
        ImageCheck -->|Web Page| OGParser[Extract og:image & Alt Tags via Cheerio]
    end
    
    subgraph Scoring & Distribution Matching
        Direct --> Scoring[Readiness Scoring Engine]
        OGParser --> Scoring
        Scoring -->|Assess Resolution, Aspect Ratio, Meta| ReadinessScore[Calculate Score 0-100]
        ReadinessScore --> ChannelMatch[Distribution Channel Matcher]
    end
    
    subgraph Database Persistence
        ChannelMatch --> Prisma[Prisma ORM Client]
        Prisma --> DB[(SQLite Database dev.db)]
        DB --> UIResponse[JSON Response with Submissions Queue]
        UIResponse --> UI
    end
```

---

## 💻 Code Internals & Technical Deep Dive

### 1. Multi-Format Image Inspector (`src/lib/infographic.ts`)
Inspects direct `.png`, `.jpg`, `.webp` assets as well as HTML landing pages for `og:image` and `<main>` image tags.

### 2. Database Persistence via Prisma ORM
Stores submission queues, scores, and channel statuses in a local SQLite file (`prisma/dev.db`).

---

## 📊 Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components, Lucide Icons, Sonner Toasts
- **Database & ORM**: Prisma 6 with local SQLite database
- **Validation**: Zod 3.x

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma db push

# Run dev server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 🌐 Part of Smarketers Off-Page Suite
vIS is part of the Smarketers Off-Page Suite — open-source, local-first marketing applications designed for privacy, speed, and reliability without SaaS dependencies.
