import { Hexagon } from 'lucide-react';

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl bg-brand text-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Hexagon style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  );
}

export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display text-[1.4rem] font-bold tracking-tight text-ink">sui tool</span>
    </div>
  );
}
