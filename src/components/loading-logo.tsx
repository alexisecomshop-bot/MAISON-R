// Pulsing-logo loading screen. Used as the Suspense fallback for route
// segments (loading.tsx files) so the Maison R logo shows while a page or
// search result loads.

export function LoadingLogo({ label = "Chargement" }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Maison R"
          className="h-16 md:h-20 w-auto animate-pulse-logo"
          onError={(e) => {
            // Fallback to wordmark if /logo.png is missing.
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            e.currentTarget.style.display = "none";
            if (fallback) fallback.style.display = "block";
          }}
        />
        <div
          className="font-display text-3xl md:text-4xl animate-pulse-logo"
          style={{ display: "none" }}
        >
          Maison R
        </div>
      </div>
      <div className="text-xs uppercase tracking-[0.3em] text-black/40">{label}</div>
    </div>
  );
}
