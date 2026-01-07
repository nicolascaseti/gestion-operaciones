import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gold-400 text-dark-900 hover:bg-gold-500 focus-visible:ring-gold-400':
              variant === 'primary',
            'bg-dark-600 text-white hover:bg-dark-500 focus-visible:ring-dark-400':
              variant === 'secondary',
            'bg-danger text-white hover:bg-red-700 focus-visible:ring-danger':
              variant === 'danger',
            'bg-transparent text-dark-200 hover:bg-dark-600 hover:text-white focus-visible:ring-dark-400':
              variant === 'ghost',
            'bg-success text-white hover:bg-green-700 focus-visible:ring-success':
              variant === 'success',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
