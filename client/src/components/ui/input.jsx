import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-xl border border-ink/20 bg-ink/5 px-4 text-ink placeholder:text-ink/45 backdrop-blur transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50';

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, 'h-12', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-[120px] py-3', className)} {...props} />
));
Textarea.displayName = 'Textarea';
