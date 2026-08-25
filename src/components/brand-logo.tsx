import { ArrowUpRight } from "lucide-react";

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2" aria-label="Smarketers vIS">
      <span className="relative grid size-8 place-items-center rounded-lg bg-gray-900 text-white">
        <svg viewBox="0 0 28 28" className="size-6" aria-hidden="true">
          <path d="M4 20 L10 14 L15 17 L23 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 7 H23 V13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-[-0.03em] text-gray-900">Smarketers</span>
      <span className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
        vIS <ArrowUpRight className="size-3" />
      </span>
    </div>
  );
}
