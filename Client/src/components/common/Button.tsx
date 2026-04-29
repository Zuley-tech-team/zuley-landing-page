import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
    fullWidth?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
    bg-charcoal text-pearl 
    hover:bg-graphite 
    active:bg-charcoal
    border border-transparent
  `,
    secondary: `
    bg-transparent text-charcoal 
    border border-charcoal 
    hover:bg-charcoal hover:text-pearl
    active:bg-graphite
  `,
    ghost: `
    bg-transparent text-charcoal 
    border border-transparent
    hover:bg-primary-light/50
    active:bg-primary-light
  `,
    accent: `
    bg-primary text-charcoal 
    border border-transparent
    hover:bg-primary-dark hover:text-pearl
    active:bg-accent-dark
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    fullWidth = false,
    icon,
    iconPosition = 'right',
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2
        font-body font-medium
        rounded-xl
        transition-all duration-300 ease-smooth
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled}
            {...props}
        >
            {icon && iconPosition === 'left' && (
                <span className="flex-shrink-0">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
                <span className="flex-shrink-0">{icon}</span>
            )}
        </button>
    );
}

export default Button;
