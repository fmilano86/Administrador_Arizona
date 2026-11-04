import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { controlStyles } from "./controlStyles";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
  id?: string;
}

function FieldShell({
  label,
  error,
  hint,
  required,
  children,
  id,
}: FieldShellProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-oliva-800"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-terracota-700">
            *
          </span>
        )}
      </label>
      {children({ id: fieldId, describedBy })}
      {error ? (
        <p id={errorId} className="text-sm text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-oliva-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface CommonFieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export interface InputProps
  extends Omit<ComponentProps<"input">, "size">, CommonFieldProps {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightSlot,
  className,
  id,
  required,
  ...props
}: InputProps) {
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
    >
      {({ id: fieldId, describedBy }) => (
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-oliva-400 [&>svg]:size-4">
              {leftIcon}
            </span>
          )}
          <input
            id={fieldId}
            required={required}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              controlStyles(!!error),
              "h-11",
              leftIcon && "pl-10",
              rightSlot && "pr-11",
              className,
            )}
            {...props}
          />
          {rightSlot && (
            <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}

export interface SelectProps
  extends ComponentProps<"select">, CommonFieldProps {}

export function Select({
  label,
  error,
  hint,
  className,
  id,
  required,
  children,
  ...props
}: SelectProps) {
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
    >
      {({ id: fieldId, describedBy }) => (
        <div className="relative">
          <select
            id={fieldId}
            required={required}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              controlStyles(!!error),
              "h-11 appearance-none pr-10",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-oliva-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}

export interface TextareaProps
  extends ComponentProps<"textarea">, CommonFieldProps {}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  required,
  ...props
}: TextareaProps) {
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      id={id}
    >
      {({ id: fieldId, describedBy }) => (
        <textarea
          id={fieldId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={cn(
            controlStyles(!!error),
            "min-h-24 resize-y py-2.5",
            className,
          )}
          {...props}
        />
      )}
    </FieldShell>
  );
}
