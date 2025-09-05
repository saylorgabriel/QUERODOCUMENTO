import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
// import { motion, AnimatePresence } from "framer-motion" // Temporarily disabled for React 19 compatibility
import { Loader2, Check } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-button rounded-button hover:from-accent-600 hover:to-accent-700 active:scale-95 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-floating",
        destructive:
          "bg-destructive text-destructive-foreground rounded-button hover:bg-destructive/90 active:scale-95 transition-all duration-200",
        outline:
          "bg-white text-primary-600 border-2 border-primary-600 rounded-button hover:bg-primary-50 active:scale-95 transition-all duration-200",
        secondary:
          "bg-transparent text-neutral-500 border border-neutral-200 rounded-button hover:bg-neutral-50 active:scale-95 transition-all duration-200",
        ghost: "text-neutral-600 rounded-button hover:bg-neutral-100 active:scale-95 transition-all duration-200",
        link: "text-primary-600 underline-offset-4 hover:underline transition-colors duration-200",
        success: "bg-gradient-to-br from-success-500 to-success-600 text-white shadow-button rounded-button hover:from-success-600 hover:to-success-700 active:scale-95 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-floating",
        loading: "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-button rounded-button cursor-wait",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm rounded-button",
        lg: "h-14 px-8 py-4 text-lg rounded-button",
        xl: "h-16 px-10 py-5 text-xl rounded-button",
        icon: "h-12 w-12",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  success?: boolean
  loadingText?: string
  successText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    success = false,
    loadingText,
    successText,
    icon,
    iconPosition = 'left',
    ripple = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const [isClicked, setIsClicked] = React.useState(false)
    const [rippleArray, setRippleArray] = React.useState<Array<{id: number, x: number, y: number}>>([])
    
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || success) return
      
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
      
      if (ripple && !asChild) {
        const rect = e.currentTarget.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        const newRipple = {
          id: Date.now(),
          x,
          y
        }
        
        setRippleArray(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRippleArray(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }
      
      onClick?.(e)
    }
    
    const currentVariant = loading ? 'loading' : success ? 'success' : variant
    
    const renderContent = () => {
      if (success && successText) {
        return (
          <div className="flex items-center gap-2 animate-scale-in">
            <div className="animate-scale-in">
              <Check className="w-4 h-4" />
            </div>
            {successText}
          </div>
        )
      }
      
      if (loading) {
        return (
          <div className="flex items-center gap-2 animate-fade-in">
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText || children}
          </div>
        )
      }
      
      const content = (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )
      
      return content
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant: currentVariant, size, className }),
          isClicked && "scale-95",
          (loading || success) && "pointer-events-none"
        )}
        ref={ref}
        onClick={handleClick}
        disabled={loading || success || props.disabled}
        {...props}
      >
        <span
          key={loading ? 'loading' : success ? 'success' : 'default'}
          className="flex items-center justify-center animate-fade-in"
        >
          {renderContent()}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Enhanced Interactive Button with advanced states
interface InteractiveButtonProps extends ButtonProps {
  states?: {
    idle?: { text: string; icon?: React.ReactNode }
    hover?: { text?: string; icon?: React.ReactNode }
    loading?: { text: string; icon?: React.ReactNode }
    success?: { text: string; icon?: React.ReactNode }
    error?: { text: string; icon?: React.ReactNode }
  }
  currentState?: 'idle' | 'hover' | 'loading' | 'success' | 'error'
  onStateChange?: (state: 'idle' | 'hover' | 'loading' | 'success' | 'error') => void
}

export const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ states, currentState = 'idle', onStateChange, className, ...props }, ref) => {
    const [internalState, setInternalState] = React.useState<typeof currentState>('idle')
    const [isHovered, setIsHovered] = React.useState(false)
    
    const state = currentState || internalState
    const currentConfig = states?.[state] || states?.idle
    
    const handleMouseEnter = () => {
      setIsHovered(true)
      if (state === 'idle' && states?.hover) {
        setInternalState('hover')
        onStateChange?.('hover')
      }
    }
    
    const handleMouseLeave = () => {
      setIsHovered(false)
      if (state === 'hover') {
        setInternalState('idle')
        onStateChange?.('idle')
      }
    }
    
    const getVariantForState = (state: string) => {
      switch (state) {
        case 'loading': return 'loading'
        case 'success': return 'success'
        case 'error': return 'destructive'
        default: return props.variant || 'default'
      }
    }
    
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
      >
        <Button
          ref={ref}
          className={cn(
            "transition-all duration-300",
            state === 'loading' && "cursor-wait",
            className
          )}
          variant={getVariantForState(state)}
          disabled={state === 'loading' || props.disabled}
          {...props}
        >
          <div
            key={state}
            className="flex items-center gap-2 animate-fade-in-scale"
          >
            {currentConfig?.icon && (
              <span className="animate-scale-in">
                {currentConfig.icon}
              </span>
            )}
            {currentConfig?.text}
          </div>
        </Button>
      </div>
    )
  }
)
InteractiveButton.displayName = "InteractiveButton"

export { Button, buttonVariants }