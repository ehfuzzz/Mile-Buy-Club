'use client';

import Link from 'next/link';
import { Menu, X, Plane, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type NavClick = 'home' | 'deals' | 'watchers' | 'docs' | 'login' | 'signup';

interface HeaderProps {
  variant?: 'solid' | 'glass';
  onNavClick?: (cta: NavClick) => void;
}

export function Header({ variant = 'solid', onNavClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      { href: '/deals', label: 'Deals', key: 'deals' as const },
      { href: '/watchers', label: 'Watchers', key: 'watchers' as const },
      { href: '/docs', label: 'Docs', key: 'docs' as const },
    ],
    [],
  );

  const shellClasses = cn(
    'sticky top-0 z-40 w-full backdrop-blur-xl transition-all',
    variant === 'glass'
      ? 'border-b border-[rgba(122,166,255,0.25)] bg-[rgba(7,13,31,0.75)] shadow-[0_10px_40px_rgba(0,0,0,0.35)]'
      : 'border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
  );

  const logo = (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(140deg,#0f1f3f,#0b1630)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(66,232,201,0.35),transparent_55%)]" />
        <Plane className="relative h-5 w-5 text-[color:var(--accent)]" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--muted)]">MileBuy</span>
        <span className="text-base font-semibold text-[color:var(--text)]">Club</span>
      </div>
    </div>
  );

  const handleNavClick = (key: NavClick) => {
    onNavClick?.(key);
    setIsOpen(false);
  };

  return (
    <header className={shellClasses}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => handleNavClick('home')}>
          {logo}
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => handleNavClick(link.key)}
              className="text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            onClick={() => handleNavClick('login')}
            className="rounded-full border border-[rgba(122,166,255,0.35)] px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition-colors hover:border-[color:var(--accent)]"
          >
            Sign in
          </Link>
          <Link
            href="/onboarding/chat"
            onClick={() => handleNavClick('signup')}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 text-sm font-semibold text-[#031325] shadow-[0_12px_40px_rgba(66,232,201,0.3)]"
          >
            <Sparkles className="h-4 w-4" />
            Get started
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-[color:var(--text)]" />
          ) : (
            <Menu className="h-6 w-6 text-[color:var(--text)]" />
          )}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[rgba(122,166,255,0.25)] bg-[rgba(7,13,31,0.85)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.key}`}
                href={link.href}
                onClick={() => handleNavClick(link.key)}
                className="text-[color:var(--text)]"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-[rgba(122,166,255,0.2)]" />
            <Link href="/login" onClick={() => handleNavClick('login')} className="text-[color:var(--text)]">
              Sign in
            </Link>
            <Link
              href="/onboarding/chat"
              onClick={() => handleNavClick('signup')}
              className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 text-center font-semibold text-[#031325]"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
