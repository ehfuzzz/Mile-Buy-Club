"use client";

import React, { useEffect, useMemo, useState } from 'react';

type Listener<T> = (value: T) => void;

class MotionValue<T = number> {
  private value: T;
  private listeners: Listener<T>[] = [];

  constructor(initial: T) {
    this.value = initial;
  }

  get() {
    return this.value;
  }

  set(v: T) {
    this.value = v;
    this.listeners.forEach((listener) => listener(v));
  }

  on(_event: 'change', callback: Listener<T>) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  initial?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  variants?: unknown;
  custom?: unknown;
  whileHover?: unknown;
  animate?: unknown;
  transition?: unknown;
  style?: React.CSSProperties | undefined;
};

function createMotionComponent<T extends keyof JSX.IntrinsicElements>(tag: T) {
  const Component = React.forwardRef<HTMLElement, MotionProps>((props, ref) => {
    const {
      children,
      style,
      initial: _initial,
      whileInView: _whileInView,
      viewport: _viewport,
      variants: _variants,
      custom: _custom,
      whileHover: _whileHover,
      animate: _animate,
      transition: _transition,
      ...rest
    } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Comp: any = tag;
    return (
      <Comp ref={ref} style={style} {...rest}>
        {children}
      </Comp>
    );
  });
  Component.displayName = `motion.${String(tag)}`;
  return Component;
}

export const motion = {
  div: createMotionComponent('div'),
  section: createMotionComponent('section'),
  main: createMotionComponent('main'),
};

export function useMotionValueEvent<T>(value: MotionValue<T>, _event: 'change', handler: Listener<T>) {
  useEffect(() => {
    const unsub = value.on('change', handler);
    return () => unsub();
  }, [handler, value]);
}

export function useTransform<T extends number | string>(
  value: MotionValue<number>,
  input: [number, number],
  output: [T, T]
) {
  const transformed = useMemo(() => new MotionValue<T>(output[0]), [output]);

  useEffect(() => {
    const unsub = value.on('change', (v) => {
      const [inMin, inMax] = input;
      const [outMin, outMax] = output;
      const clamped = Math.max(inMin, Math.min(inMax, v));
      const progress = (clamped - inMin) / (inMax - inMin || 1);
      const next =
        typeof outMin === 'number' && typeof outMax === 'number'
          ? ((outMin as number) + (outMax as number - outMin as number) * progress) as T
          : (progress >= 0.5 ? outMax : outMin);
      transformed.set(next);
    });
    return () => unsub();
  }, [input, output, transformed, value]);

  return transformed;
}

export function useScroll({ target }: { target?: React.RefObject<HTMLElement | null> }) {
  const [progress] = useState(() => new MotionValue(0));

  useEffect(() => {
    function calculate() {
      if (!target?.current) {
        const scrolled = window.scrollY;
        const height = document.body.scrollHeight - window.innerHeight;
        progress.set(height > 0 ? scrolled / height : 0);
        return;
      }
      const rect = target.current.getBoundingClientRect();
      const total = rect.height || 1;
      const visible = Math.min(Math.max(-rect.top, 0), total);
      progress.set(Number((visible / total).toFixed(3)));
    }

    calculate();
    window.addEventListener('scroll', calculate, { passive: true });
    window.addEventListener('resize', calculate);
    return () => {
      window.removeEventListener('scroll', calculate);
      window.removeEventListener('resize', calculate);
    };
  }, [progress, target]);

  return { scrollYProgress: progress };
}

export { MotionValue };
