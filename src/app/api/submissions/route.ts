import { ZodError } from "zod";
import { analyzeInfographic } from "@/lib/infographic";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const submissions = await prisma.submission.findMany({ orderBy: { updatedAt: "desc" }, take: 8 });
  return Response.json({ submissions });
}

export async function POST(request: Request) {
  try {
    const analysis = await analyzeInfographic(await request.json());
    const submission = await prisma.submission.upsert({
      where: { sourceUrl: analysis.sourceUrl },
      create: analysis,
      update: { ...analysis, status: "Ready" },
    });
    return Response.json({ submission }, { status: 201 });
  } catch (error) {
    const message = error instanceof ZodError
      ? error.issues[0]?.message ?? "Check the URL and try again."
      : error instanceof Error
        ? error.name === "TimeoutError" ? "The source took too long to respond." : error.message
        : "The infographic could not be inspected.";
    return Response.json({ error: message }, { status: 400 });
  }
}
