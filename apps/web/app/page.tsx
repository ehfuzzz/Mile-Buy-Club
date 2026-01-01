"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Bell, Plane, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useTelemetry } from '@/lib/telemetry';

const cards = [
  {
    title: 'Sea-Tac → Narita in J',
    points: '86k points',
    copy: 'Partner saver space with instant confirm',
    badge: 'Live',
  },
  {
    title: 'NYC → Paris in F',
    points: '72k points',
    copy: 'Flagship suites, taxes under $80',
    badge: 'Tonight',
  },
  {
    title: 'SFO → Sydney in J',
    points: '87k points',
    copy: 'Non-stop with lounge access',
    badge: 'New',
  },
];

const features = [
  {
    icon: <Zap className="h-5 w-5 text-[color:var(--accent)]" />,
    title: 'Automated award monitoring',
    copy: 'Continuous scanning across major loyalty programs so you catch availability the moment it lands.',
  },
  {
    icon: <Bell className="h-5 w-5 text-[color:var(--accent)]" />,
    title: 'Instant, precise alerts',
    copy: 'Tailored pings for your cabins, routes, and balance—no noisy blasts or upsells.',
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-[color:var(--accent)]" />,
    title: 'Value-first ranking',
    copy: 'We highlight the clearest wins, keeping fuel surcharges and partner quirks in check.',
  },
];

const faqs = [
  {
    question: 'Is MileBuyClub really free?',
    answer: 'Yes. We monetize through affiliate partnerships, so members get the tools without a subscription.',
  },
  {
    question: 'Which programs do you monitor?',
    answer: 'We focus on popular loyalty programs and their partners, expanding coverage based on member demand.',
  },
  {
    question: 'How do alerts work?',
    answer: 'Set your routes and cabins. We surface high-quality space and message you instantly when it appears.',
  },
  {
    question: 'Can I browse live deals?',
    answer: 'Yes—head to the deals page to see current finds and track what matters to you.',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { trackEvent, hasTrackedDepth } = useTelemetry();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = () => setPrefersReducedMotion(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 60]);

  useEffect(() => {
    trackEvent({ name: 'landing_view', timestamp: new Date().toISOString() });
  }, [trackEvent]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const depth = Math.round(latest * 100);
    const thresholds: Array<25 | 50 | 75 | 90> = [25, 50, 75, 90];
    thresholds.forEach((threshold) => {
      if (depth >= threshold && !hasTrackedDepth[threshold]) {
        hasTrackedDepth[threshold] = true;
        trackEvent({ name: 'landing_scroll_depth', timestamp: new Date().toISOString(), props: { scrollDepth: threshold } });
      }
    });
  });

  const heroCards = useMemo(
    () =>
      cards.map((card, index) => (
        <motion.div
          key={card.title}
          className="glass-card relative rounded-2xl p-5 shadow-2xl"
          style={{ y }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          custom={0.1 * index}
          variants={reveal}
        >
          <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
            <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
              {card.badge}
            </span>
            <div className="flex items-center gap-1 text-xs text-[color:var(--muted)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--accent-2)]" />
              <span>verified window</span>
            </div>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-[color:var(--text)]">{card.title}</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{card.copy}</p>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-2xl font-bold text-[color:var(--accent)]">{card.points}</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(122,166,255,0.35)] px-3 py-1 text-xs text-[color:var(--muted)]">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              great value
            </div>
          </div>
        </motion.div>
      )),
    [y],
  );

  const handleCta = (cta: 'get_started' | 'sign_in' | 'browse_deals' | 'watch_demo', location: 'hero' | 'nav' | 'final_cta' | `section:${string}`) => {
    trackEvent({ name: 'cta_click', timestamp: new Date().toISOString(), props: { cta, location } });
  };

  const handleNav = (link: 'home' | 'deals' | 'watchers' | 'docs' | 'login' | 'signup') => {
    trackEvent({ name: 'nav_click', timestamp: new Date().toISOString(), props: { location: 'nav' } });
    if (link === 'login') {
      handleCta('sign_in', 'nav');
    }
    if (link === 'signup') {
      handleCta('get_started', 'nav');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(122,166,255,0.25),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_60%_60%,rgba(66,232,201,0.35),transparent_65%)] blur-3xl" />
      </div>

      <Header variant="glass" onNavClick={handleNav} />

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-24 px-4 pb-24 pt-32 sm:px-6 lg:px-8" ref={heroRef}>
        <section className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill">Free forever (affiliate-only)</span>
              <span className="pill">Auto-monitor award space</span>
              <span className="pill">Instant alerts</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Award flights, surfaced the moment they appear.
              </h1>
              <p className="max-w-2xl text-lg text-[color:var(--muted)] sm:text-xl">
                MileBuyClub keeps eyes on premium cabins, partner quirks, and real fees—so you act quickly without wasting points. Built for travelers, free through affiliate support.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                variant="shine"
                className="px-7"
                asChild
                onClick={() => handleCta('get_started', 'hero')}
              >
                <Link href="/onboarding/chat" className="gap-2">
                  Get started free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-[rgba(122,166,255,0.3)] px-6"
                asChild
                onClick={() => handleCta('browse_deals', 'hero')}
              >
                <Link href="/deals">See live deals</Link>
              </Button>
              <button
                onClick={() => handleCta('watch_demo', 'hero')}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)] transition-colors hover:text-[color:var(--text)]"
              >
                <div className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[rgba(122,166,255,0.3)] bg-[rgba(255,255,255,0.03)]">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),transparent_45%)] opacity-80" />
                  <PlayIcon className="relative h-4 w-4" />
                </div>
                Watch demo
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Routes watched', value: 'Curated by you' },
                { label: 'Alerts sent', value: 'Only when it matters' },
                { label: 'Pricing', value: 'Free—affiliate supported' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[rgba(122,166,255,0.2)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--text)]">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <motion.div
              className="absolute -left-10 -top-10 hidden h-24 w-24 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(122,166,255,0.3),transparent_60%)] blur-2xl lg:block"
              aria-hidden
              animate={{ y: prefersReducedMotion ? 0 : [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            />
            <div className="relative space-y-4 lg:pl-10">
              {heroCards}
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <motion.div
            className="flex flex-col gap-3 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
          >
            <span className="pill w-fit">How it works</span>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-semibold sm:text-4xl">Stay ahead of award drops.</h2>
              <p className="max-w-xl text-[color:var(--muted)]">
                Build your watcher list, let MileBuyClub scan across programs, and get actionable alerts when premium cabins align with your preferences.
              </p>
            </div>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="glass-card h-full rounded-2xl border border-[rgba(122,166,255,0.15)] p-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                custom={0.05 * idx}
                variants={reveal}
                whileHover={{ y: prefersReducedMotion ? 0 : -6, transition: { duration: 0.25 } }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(66,232,201,0.08)]">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--text)]">{feature.title}</h3>
                <p className="mt-2 text-[color:var(--muted)]">{feature.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
          >
            <span className="pill w-fit">Live deals</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-semibold sm:text-4xl">See what members are watching now.</h2>
              <Button
                variant="outline"
                className="w-fit border-[rgba(122,166,255,0.35)]"
                asChild
                onClick={() => handleCta('browse_deals', 'section:live-deals')}
              >
                <Link href="/deals" className="gap-2">
                  Browse deals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            {cards.map((card, idx) => (
              <motion.div
                key={`${card.title}-${idx}`}
                className="glass-card relative rounded-2xl border border-[rgba(122,166,255,0.2)] p-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                custom={0.05 * idx}
                variants={reveal}
                whileHover={{ y: prefersReducedMotion ? 0 : -4 }}
              >
                <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                  <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-1 text-[color:var(--accent)]">{card.badge}</span>
                  <Plane className="h-4 w-4 text-[color:var(--accent-2)]" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--text)]">{card.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{card.copy}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-semibold text-[color:var(--accent)]">{card.points}</span>
                  <div className="flex items-center gap-1 text-xs text-[color:var(--muted)]">
                    <Star className="h-4 w-4 text-[color:var(--accent-2)]" />
                    curated
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
          >
            <span className="pill w-fit">Answers</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">FAQ</h2>
            <p className="max-w-2xl text-[color:var(--muted)]">Clarity around pricing, alerts, and coverage—no opaque promises.</p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.question}
                className="glass-card rounded-2xl border border-[rgba(122,166,255,0.2)] p-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                custom={0.05 * idx}
                variants={reveal}
              >
                <div className="flex items-center gap-2 text-[color:var(--accent-2)]">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Trust</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-[color:var(--text)]">{faq.question}</h3>
                <p className="mt-2 text-[color:var(--muted)]">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="gradient-border rounded-3xl bg-[rgba(255,255,255,0.02)] p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <span className="pill w-fit">Ready when you are</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Catch the next award window.</h2>
              <p className="max-w-2xl text-[color:var(--muted)]">
                Start a free account, add your must-fly routes, and let MileBuyClub watch the midnight runway for you. Alerts stay focused and free—backed by affiliate-only revenue.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                variant="shine"
                className="px-7"
                asChild
                onClick={() => handleCta('get_started', 'final_cta')}
              >
                <Link href="/onboarding/chat" className="gap-2">
                  Get started free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[rgba(122,166,255,0.35)] px-6"
                asChild
                onClick={() => handleCta('sign_in', 'final_cta')}
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Play"
    >
      <path d="M8 5.14v13.72L19 12 8 5.14Z" />
    </svg>
  );
}
