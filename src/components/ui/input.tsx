import * as React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  id?: string;
  label?: string;
}

function Input({ className, type, label, id, ref, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  return label ? (
    <div>
      <label
        className="mb-1 block font-medium text-secondary-700 text-sm"
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        id={inputId}
        ref={ref}
        type={type}
        {...props}
      />
    </div>
  ) : (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      id={inputId}
      ref={ref}
      type={type}
      {...props}
    />
  );
}

export { Input };
