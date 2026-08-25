import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { z } from "zod";

const inputSchema = z.object({
  url: z.string().trim().url("Enter a complete public URL.").max(2048),
});

const MAX_INSPECTION_BYTES = 300_000;
const MAX_REDIRECTS = 4;

export type InfographicAnalysis = {
  sourceUrl: string;
  imageUrl: string;
  title: string;
  domain: string;
  format: string;
  fileSize: number | null;
  score: number;
  channelCount: number;
};

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) return true;
  if (!isIP(address) || address.includes(":")) return false;
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function assertPublicUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (url.username || url.password) throw new Error("URLs with embedded credentials are not supported.");
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("Please use a publicly accessible URL.");
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Please use a publicly accessible URL.");
  }
  return url;
}

async function safeFetch(rawUrl: string, redirects = 0): Promise<{ response: Response; finalUrl: URL }> {
  const url = await assertPublicUrl(rawUrl);
  const response = await fetch(url, {
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,text/html;q=0.8,*/*;q=0.5",
      Range: `bytes=0-${MAX_INSPECTION_BYTES - 1}`,
      "User-Agent": "vIS Infographic Inspector/1.0",
    },
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= MAX_REDIRECTS) throw new Error("The URL redirected too many times.");
    const location = response.headers.get("location");
    if (!location) throw new Error("The URL returned an invalid redirect.");
    return safeFetch(new URL(location, url).toString(), redirects + 1);
  }
  if (!response.ok && response.status !== 206) throw new Error(`The source returned HTTP ${response.status}.`);
  return { response, finalUrl: url };
}

async function readTextLimited(response: Response) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_INSPECTION_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value.subarray(0, MAX_INSPECTION_BYTES - size);
    chunks.push(chunk);
    size += chunk.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function findMeta(html: string, key: string) {
  for (const tag of html.match(/<meta\s+[^>]*>/gi) ?? []) {
    const property = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1];
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (property?.toLowerCase() === key.toLowerCase() && content) return decodeHtml(content.trim());
  }
  return null;
}

function titleFromUrl(url: URL) {
  const name = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? url.hostname)
    .replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[-_]+/g, " ").trim();
  return name ? name.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Untitled infographic";
}

function bytesFromHeader(response: Response) {
  const value = response.headers.get("content-range")?.split("/").pop() ?? response.headers.get("content-length");
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function analyzeInfographic(input: unknown): Promise<InfographicAnalysis> {
  const { url: rawUrl } = inputSchema.parse(input);
  const source = await safeFetch(rawUrl);
  let imageResponse = source.response;
  let imageUrl = source.finalUrl.toString();
  let title = titleFromUrl(source.finalUrl);
  let hasSocialTitle = false;
  const sourceType = source.response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";

  if (sourceType === "text/html" || sourceType === "application/xhtml+xml") {
    const html = await readTextLimited(source.response);
    const pageTitle = findMeta(html, "og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    const candidate = findMeta(html, "og:image:secure_url") ?? findMeta(html, "og:image") ?? findMeta(html, "twitter:image");
    if (!candidate) throw new Error("No shareable infographic image was found on that page.");
    const image = await safeFetch(new URL(candidate, source.finalUrl).toString());
    imageResponse = image.response;
    imageUrl = image.finalUrl.toString();
    if (pageTitle) {
      title = decodeHtml(pageTitle).slice(0, 120);
      hasSocialTitle = true;
    }
  }

  const format = imageResponse.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
  const supported = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];
  if (!supported.includes(format)) throw new Error("Use a PNG, JPEG, WebP, GIF, or AVIF infographic.");
  const fileSize = bytesFromHeader(imageResponse);
  await imageResponse.body?.cancel().catch(() => undefined);
  let score = 70;
  if (source.finalUrl.protocol === "https:") score += 10;
  if (["image/png", "image/webp", "image/avif"].includes(format)) score += 8;
  if (fileSize && fileSize <= 10_000_000) score += 7;
  if (hasSocialTitle) score += 5;

  return {
    sourceUrl: source.finalUrl.toString(), imageUrl, title,
    domain: source.finalUrl.hostname.replace(/^www\./, ""),
    format: format.replace("image/", "").toUpperCase().replace("JPEG", "JPG"),
    fileSize, score,
    channelCount: score >= 92 ? 8 : score >= 82 ? 7 : score >= 72 ? 6 : 5,
  };
}
