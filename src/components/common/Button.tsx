import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#F0A15B] hover:bg-[#F6B779] active:bg-[#D98945] text-[#0B0C10] border border-transparent',
  secondary:
    'bg-[#232633] hover:bg-[#2C3040] active:bg-[#191C25] text-[#F2F0EC] border border-[#343744] hover:border-[#454958]',
  outline:
    'bg-transparent hover:bg-[#191C25] text-[#F2F0EC] border border-[#343744] hover:border-[#454958]',
  ghost:
    'bg-transparent hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-transparent',
  danger:
    'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] h-9 px-3.5 text-xs',
  md: 'min-h-[40px] h-10 px-4 text-[14px]',
  lg: 'min-h-[44px] h-11 px-5 text-[14px]',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className = '',
}: BaseProps = {}): string {
  return `inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A15B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0C10] disabled:opacity-45 disabled:pointer-events-none select-none cursor-pointer ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  active?: boolean;
  className?: string;
}

export function IconButton({
  variant = 'secondary',
  active = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-[10px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A15B] disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
        active
          ? 'bg-[#F0A15B] text-[#0B0C10] border border-transparent'
          : VARIANT_CLASSES[variant]
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
