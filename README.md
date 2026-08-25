# vIS — Smarketers Infographic Submitter

vIS is a local-first Next.js application for inspecting, scoring, and organizing public infographic URLs before off-page distribution. It follows redirects safely, recognizes direct image links and Open Graph images, calculates a readiness score, matches a channel count, and saves the queue in SQLite.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 and owned shadcn/ui component source
- Prisma 6 with a local SQLite database
- Lucide React icons and Sonner-powered shadcn toasts
- Zod request validation

Every package is pinned to an exact version in `package.json`; `package-lock.json` locks the full dependency graph.

## Run locally

Requirements: Node.js 20.9 or newer and npm 10 or newer.

```bash
npm install
copy .env.example .env
npm run db:setup
npm run dev
```

On macOS or Linux, replace the `copy` command with:

```bash
cp .env.example .env
```

Open [http://localhost:3000](http://localhost:3000). Paste a public direct image URL or a public page containing an `og:image` or `twitter:image` tag, then choose **Get Started**.

No external API key is required. `DATABASE_URL="file:./dev.db"` creates the database at `prisma/dev.db`. The idempotent setup command applies the checked-in schema through Prisma Client, so repeated runs are safe. Set `NEXT_PUBLIC_APP_URL` to the public origin when deploying so social-preview URLs are absolute.

## Production build

```bash
npm run lint
npm run build
npm start
```

The build uses Next.js standalone output. SQLite is intentionally local: deploy to a persistent Node.js host and mount durable storage for `prisma/dev.db`. Serverless filesystems are not appropriate for this database configuration.

## Database commands

```bash
npm run db:generate
npm run db:setup
npm run db:studio
```

## API

### `GET /api/submissions`

Returns the eight most recently inspected submissions.

### `POST /api/submissions`

Request:

```json
{ "url": "https://example.org/infographic.png" }
```

The route accepts HTTP(S) only, blocks local and private-network destinations, validates every redirect, limits response inspection, verifies the image MIME type, and then creates or refreshes the SQLite record.

## Foundational open-source projects

The application is built from the same open-source foundations named in the brief. To inspect their upstream source independently:

```bash
git clone https://github.com/ixartz/Next-js-Boilerplate.git references/nextjs-boilerplate
git clone https://github.com/shadcn-ui/ui.git references/shadcn-ui
git clone https://github.com/prisma/prisma.git references/prisma
git clone https://github.com/lucide-icons/lucide.git references/lucide
```

To reproduce the project initialization in an empty, lowercase-named directory:

```bash
npx create-next-app@16.3.2 vis-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
cd vis-app
npx shadcn@4.19.0 init -d --base radix
npx shadcn@4.19.0 add input card badge table sonner -y
npm install --save-exact @prisma/client@6.19.0 prisma@6.19.0 lucide-react@1.34.0 zod@4.4.3
```

## Project layout

```text
prisma/schema.prisma            SQLite data model
src/app/api/submissions/route.ts API read/write route
src/lib/infographic.ts          URL safety and image analysis
src/lib/prisma.ts               Development-safe Prisma client
src/components/submission-app.tsx Main interactive workspace
src/components/ui/              Owned shadcn/ui component source
```
