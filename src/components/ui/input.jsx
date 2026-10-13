import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'min-h-control w-full rounded-control border border-input bg-surface px-4 text-body text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-error disabled:bg-surface-disabled disabled:text-disabled',
        className
      )}
      {...props}
    />
  );
});
