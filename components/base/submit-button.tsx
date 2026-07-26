"use client";

import { useFormStatus } from "react-dom";

import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

/**
 * A submit button that knows when its own form is in flight.
 *
 * Server actions can take a second or two against a distant database, and a
 * button that looks identical before and after the click reads as broken.
 * `useFormStatus` gives us the pending state for free, so the button
 * disables itself, swaps its label and shows a spinner.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  /** Shown while the action runs; defaults to the normal label. */
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || rest.disabled}
      aria-busy={pending}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {pending ? <Spinner /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}
