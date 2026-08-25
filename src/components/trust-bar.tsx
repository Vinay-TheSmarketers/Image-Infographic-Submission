const platforms = ["Pinterest", "Behance", "Dribbble", "LinkedIn", "Medium", "Reddit", "Imgur", "Visual.ly"];

export function TrustBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white" aria-label="Supported platforms">
      <div className="relative mx-auto flex h-16 max-w-[1600px] items-center overflow-hidden">
        <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
        <div className="marquee-track flex min-w-max items-center">
          {[...platforms, ...platforms].map((platform, index) => (
            <div key={`${platform}-${index}`} className="flex items-center gap-8 pr-8 text-sm font-medium text-gray-500">
              <span>{platform}</span><span className="size-1 rounded-full bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
