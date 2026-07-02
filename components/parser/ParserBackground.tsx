export function ParserBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-studio-snow" />
      <div className="absolute inset-0 bg-mesh-light opacity-90" />
      <div className="absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-studio-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-studio-glow/10 blur-3xl" />
      <div className="absolute inset-0 noise-overlay opacity-30" />
    </div>
  );
}
