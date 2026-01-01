import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'shine';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles =
      'relative inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default:
        'bg-[color:var(--accent)] text-[#031325] hover:brightness-105 focus-visible:ring-[color:var(--accent)] shadow-[0_10px_40px_rgba(66,232,201,0.25)]',
      outline:
        'border border-[rgba(122,166,255,0.35)] bg-transparent text-[color:var(--text)] hover:border-[color:var(--accent)] focus-visible:ring-[rgba(122,166,255,0.4)]',
      ghost: 'hover:bg-[rgba(255,255,255,0.04)] text-[color:var(--text)]',
      secondary:
        'bg-[rgba(255,255,255,0.06)] text-[color:var(--text)] hover:border-[color:var(--accent)]',
      shine:
        'overflow-hidden bg-gradient-to-r from-[color:var(--accent)] via-[color:var(--accent-2)] to-[color:var(--accent)] text-[#031325] shadow-[0_10px_45px_rgba(66,232,201,0.3)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10',
    };

    const shineClass =
      variant === 'shine'
        ? 'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.6),transparent_40%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.45),transparent_35%)] before:opacity-80 before:mix-blend-screen before:transition-transform before:duration-500 hover:before:translate-x-1'
        : '';

    return (
      <Comp
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          shineClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
