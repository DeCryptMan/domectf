import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    ref={ref}
    className="w-full bg-bg border border-border px-3 py-2 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono text-sm"
    {...props}
  />
));
Input.displayName = "Input";    