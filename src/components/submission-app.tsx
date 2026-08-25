"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, CircleGauge, Clock3, ExternalLink, FileImage, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BrandLogo } from "@/components/brand-logo";
import { TrustBar } from "@/components/trust-bar";

type Submission = {
  id: string; sourceUrl: string; imageUrl: string; title: string; domain: string;
  format: string; fileSize: number | null; score: number; channelCount: number;
  status: string; updatedAt: string;
};

function formatBytes(bytes: number | null) {
  if (bytes === null) return "Size unavailable";
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function timeAgo(date: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export function SubmissionApp() {
  const [url, setUrl] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/submissions", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSubmissions(data.submissions ?? []))
      .catch(() => toast.error("Submission history is temporarily unavailable."));
  }, []);

  const metrics = {
    ready: submissions.filter((item) => item.status === "Ready").length,
    average: submissions.length ? Math.round(submissions.reduce((sum, item) => sum + item.score, 0) / submissions.length) : 0,
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Inspecting URL and image metadata…");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The infographic could not be prepared.");
      setSubmissions((current) => [data.submission, ...current.filter((item) => item.id !== data.submission.id)].slice(0, 8));
      setUrl("");
      toast.success(`${data.submission.title} is ready for ${data.submission.channelCount} channels.`, { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The infographic could not be prepared.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <div className="hidden items-center gap-6 text-sm text-gray-500 sm:flex">
            <a href="#workflow" className="transition-colors hover:text-gray-900">Workflow</a>
            <a href="#submissions" className="transition-colors hover:text-gray-900">Recent submissions</a>
            <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Local workspace
            </span>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-gray-200" id="workflow">
          <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20">
            <Badge variant="outline" className="mb-7 rounded-full border-gray-200 bg-white px-3 py-1.5 text-gray-600 shadow-sm">
              <Sparkles className="mr-1.5 size-3.5" /> Off-page distribution, organized
            </Badge>
            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] text-gray-950 sm:text-6xl sm:leading-[1.05]">One infographic. Every right place.</h1>
            <p className="mx-auto mt-6 max-w-3xl text-balance text-base leading-7 text-gray-600 sm:text-lg">Meet the Smarketers Family Off Page Suite. The only unified ecosystem your brand needs for scaled, off-page visibility and outreach automation.</p>

            <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.28)] sm:flex">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <FileImage className="hidden size-5 shrink-0 text-gray-400 sm:block" />
                <Input type="url" inputMode="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste a public infographic or page URL" aria-label="Infographic URL" className="h-13 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0" />
              </div>
              <Button type="submit" disabled={loading} className="h-13 w-full rounded-xl bg-gray-950 px-7 text-white hover:bg-gray-800 sm:w-auto">
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />} Get Started
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Public URLs only</span>
              <span className="flex items-center gap-1.5"><Check className="size-3.5" /> PNG, JPG, WebP, GIF, AVIF</span>
              <span className="flex items-center gap-1.5"><Check className="size-3.5" /> No API key required</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14" id="submissions">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Prepared" value={submissions.length} icon={<FileImage className="size-5 text-gray-600" />} />
            <Metric label="Ready now" value={metrics.ready} icon={<Check className="size-5 text-gray-600" />} />
            <Metric label="Avg. readiness" value={metrics.average ? `${metrics.average}%` : "—"} icon={<CircleGauge className="size-5 text-gray-600" />} />
          </div>

          <div className="mt-8 flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Distribution queue</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Recent submissions</h2></div>
            <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-600"><Clock3 className="mr-1 size-3" /> Live history</Badge>
          </div>

          <Card className="mt-5 overflow-hidden border-gray-200 py-0 shadow-none">
            {submissions.length ? (
              <Table>
                <TableHeader><TableRow className="bg-gray-50/80 hover:bg-gray-50/80"><TableHead className="pl-5">Infographic</TableHead><TableHead>Format</TableHead><TableHead>Readiness</TableHead><TableHead>Channels</TableHead><TableHead className="pr-5 text-right">Status</TableHead></TableRow></TableHeader>
                <TableBody>{submissions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[360px] pl-5"><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="group block"><span className="flex items-center gap-1.5 truncate font-medium text-gray-900 group-hover:underline">{item.title}<ExternalLink className="size-3.5 shrink-0 text-gray-400" /></span><span className="mt-0.5 block truncate text-xs text-gray-500">{item.domain} · {timeAgo(item.updatedAt)}</span></a></TableCell>
                    <TableCell><span className="text-sm font-medium">{item.format}</span><span className="block text-xs text-gray-500">{formatBytes(item.fileSize)}</span></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gray-900" style={{ width: `${item.score}%` }} /></div><span className="text-xs font-medium text-gray-600">{item.score}%</span></div></TableCell>
                    <TableCell className="text-sm text-gray-600">{item.channelCount} matched</TableCell>
                    <TableCell className="pr-5 text-right"><Badge variant="outline" className="rounded-full border-gray-200 bg-white text-gray-700"><span className="mr-1.5 size-1.5 rounded-full bg-emerald-500" />{item.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            ) : (
              <div className="grid min-h-48 place-items-center px-6 py-10 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-xl bg-gray-100"><FileImage className="size-5 text-gray-500" /></span><p className="mt-3 font-medium">Your first submission starts above</p><p className="mt-1 text-sm text-gray-500">Paste a public infographic or a page with an Open Graph image.</p></div></div>
            )}
          </Card>
        </section>
      </main>
      <TrustBar />
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return <Card className="border-gray-200 shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-gray-100">{icon}</span></CardContent></Card>;
}
