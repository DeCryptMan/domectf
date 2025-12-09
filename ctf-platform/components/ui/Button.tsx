import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={twMerge(
      "px-4 py-2 bg-panel border border-border text-text-main font-medium text-sm transition-all hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed active:bg-border",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";