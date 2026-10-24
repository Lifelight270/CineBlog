import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = ({ className, ...props }) => (
  <LabelPrimitive.Root className={cn('mb-2 block font-display text-sm font-medium text-ink/80', className)} {...props} />
);
