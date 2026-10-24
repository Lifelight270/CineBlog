import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-medium transition-[background,color,transform,opacity] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-surface hover:bg-accent/85',
        glass: 'glass text-ink hover:bg-ink/10',
        outline: 'border border-ink/30 text-ink hover:bg-ink/10',
        ghost: 'text-ink/80 hover:bg-ink/10 hover:text-ink',
        destructive: 'bg-red-500 text-white hover:bg-red-500/85',
      },
      size: { default: 'h-11 px-6 text-[0.95rem]', sm: 'h-9 px-4 text-sm', lg: 'h-14 px-8 text-base', icon: 'h-10 w-10' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export const Button = forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = 'Button';
