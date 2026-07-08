import Link from 'next/link';
import { ConnectButton } from './ConnectButton';
import { Wordmark } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="shrink-0" aria-label="Home">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/"
            className="rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-800"
          >
            Balance tool
          </Link>
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
}
