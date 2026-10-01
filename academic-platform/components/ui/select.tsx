import { type SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 ${className}`}
        {...props}
      />
    );
  }
);
