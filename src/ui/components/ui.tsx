import type { ReactNode } from 'react';
import { cn } from '@/ui/cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card p-6', className)}>{children}</div>;
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60',
        variant === 'primary' ? 'btn-primary' : 'btn-ghost',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
      {children}
    </label>
  );
}
