import * as React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  id?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    return label ? (
      <div>
        <label
          htmlFor={inputId}
          className="block mb-1 text-sm font-medium text-secondary-700"
        >
          {label}
        </label>
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex px-3 py-2 w-full h-10 text-base rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    ) : (
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex px-3 py-2 w-full h-10 text-base rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
