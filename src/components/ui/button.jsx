import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// KLAS Button: primary = find/search/sign up, job = job actions, recruiter = Post a job.
export const buttonVariants = cva(
  'inline-flex min-h-control items-center justify-center gap-2 whitespace-nowrap rounded-control border border-transparent px-6 text-label transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] disabled:pointer-events-none disabled:bg-surface-disabled disabled:text-disabled',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        job: 'bg-accent text-accent-foreground hover:bg-accent-hover',
        recruiter: 'bg-recruiter text-recruiter-foreground hover:bg-recruiter-hover',
        secondary: 'border-border bg-surface text-foreground hover:border-muted-foreground',
        link: 'px-2 text-primary underline-offset-4 hover:underline active:shadow-none',
      },
      size: { default: '', icon: 'w-control px-0', block: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export const Button = forwardRef(function Button({ className, variant, size, loading, children, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      aria-busy={loading || undefined}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  );
});
