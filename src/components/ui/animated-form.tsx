'use client'

import React, { forwardRef } from 'react'
// import { motion, React.Fragment } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  showValidation?: boolean
  isLoading?: boolean
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    showValidation = true,
    isLoading = false,
    type,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [value, setValue] = React.useState(props.defaultValue || '')
    
    const isPassword = type === 'password'
    const actualType = isPassword && showPassword ? 'text' : type
    const hasValue = value || isFocused
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success) && !hasError

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }

    const inputVariants = {
      idle: { 
        borderColor: hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(226 232 240)',
        boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)'
      },
      focused: { 
        borderColor: hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(59 130 246)',
        boxShadow: hasError 
          ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
          : hasSuccess 
            ? '0 0 0 3px rgba(34, 197, 94, 0.1)'
            : '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    }

    const labelVariants = {
      idle: {
        scale: hasValue ? 0.85 : 1,
        y: hasValue ? -24 : 0,
        x: hasValue ? 0 : 0,
        color: hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(100 116 139)'
      },
      focused: {
        scale: 0.85,
        y: -24,
        x: 0,
        color: hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(59 130 246)'
      }
    }

    return (
      <div className={cn("relative", className)}>
        {/* Input Container */}
        <div className="relative">
          <div
            className="relative"
            initial="idle"
            animate={isFocused ? "focused" : "idle"}
            variants={inputVariants}
            transition={{ duration: 0.2 }}
          >
            <input
              ref={ref}
              type={actualType}
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "w-full px-4 py-3 text-base bg-white border rounded-lg transition-all duration-200",
                "focus:outline-none placeholder-transparent",
                "disabled:bg-neutral-50 disabled:text-neutral-500",
                icon && iconPosition === 'left' && "pl-12",
                icon && iconPosition === 'right' && "pr-12",
                isPassword && "pr-12",
                hasError && "border-red-500 focus:border-red-500",
                hasSuccess && "border-success-500 focus:border-success-500",
                !hasError && !hasSuccess && "border-neutral-300 focus:border-primary-500"
              )}
              placeholder=""
              {...props}
            />

            {/* Floating Label */}
            {label && (
              <label
                className={cn(
                  "absolute left-4 pointer-events-none transition-all duration-200 origin-left",
                  "text-base font-medium"
                )}
                variants={labelVariants}
                animate={isFocused || hasValue ? "focused" : "idle"}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {label}
              </label>
            )}

            {/* Left Icon */}
            {icon && iconPosition === 'left' && (
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                animate={{
                  color: isFocused 
                    ? hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(59 130 246)'
                    : 'rgb(156 163 175)',
                  scale: isFocused ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </div>
            )}

            {/* Right Icon or Password Toggle */}
            {(icon && iconPosition === 'right') || isPassword ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPassword ? (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    <React.Fragment mode="wait">
                      {showPassword ? (
                        <div
                          key="hide"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeOff className="w-5 h-5" />
                        </div>
                      ) : (
                        <div
                          key="show"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="w-5 h-5" />
                        </div>
                      )}
                    </React.Fragment>
                  </button>
                ) : (
                  <div
                    className="text-neutral-400"
                    animate={{
                      color: isFocused 
                        ? hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(59 130 246)'
                        : 'rgb(156 163 175)',
                      scale: isFocused ? 1.1 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {icon}
                  </div>
                )}
              </div>
            ) : null}

            {/* Validation Icons */}
            {showValidation && (hasError || hasSuccess) && (
              <div
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  (icon && iconPosition === 'right') || isPassword ? "right-12" : "right-3"
                )}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring" }}
              >
                {hasError ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                )}
              </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <React.Fragment>
          {(error || success || helperText) && (
            <div
              className="mt-2 space-y-1"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {error && (
                <div
                  className="flex items-center gap-2 text-sm text-red-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && !error && (
                <div
                  className="flex items-center gap-2 text-sm text-success-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              
              {helperText && !error && !success && (
                <p
                  className="text-sm text-neutral-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  {helperText}
                </p>
              )}
            </div>
          )}
        </React.Fragment>
      </div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"

// Animated Textarea
interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  showValidation?: boolean
}

export const AnimatedTextarea = forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    showValidation = true,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [value, setValue] = React.useState(props.defaultValue || '')
    
    const hasValue = Boolean(value) || isFocused
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success) && !hasError

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full px-4 py-3 text-base bg-white border rounded-lg transition-all duration-200 resize-none",
              "focus:outline-none placeholder-transparent min-h-[120px]",
              "disabled:bg-neutral-50 disabled:text-neutral-500",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              hasSuccess && "border-success-500 focus:border-success-500 focus:ring-success-500/10",
              !hasError && !hasSuccess && "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/10"
            )}
            animate={{
              borderColor: isFocused 
                ? hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(59 130 246)'
                : hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(226 232 240)'
            }}
            transition={{ duration: 0.2 }}
            placeholder=""
            {...props}
          />

          {label && (
            <label
              className="absolute left-4 pointer-events-none transition-all duration-200 origin-left text-base font-medium"
              animate={{
                scale: isFocused || hasValue ? 0.85 : 1,
                y: isFocused || hasValue ? -24 : 16,
                color: isFocused
                  ? hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(59 130 246)'
                  : hasError ? 'rgb(239 68 68)' : hasSuccess ? 'rgb(34 197 94)' : 'rgb(100 116 139)'
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {label}
            </label>
          )}

          {showValidation && (hasError || hasSuccess) && (
            <div
              className="absolute right-3 top-3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, type: "spring" }}
            >
              {hasError ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success-500" />
              )}
            </div>
          )}
        </div>

        <React.Fragment>
          {(error || success || helperText) && (
            <div
              className="mt-2 space-y-1"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {error && (
                <div
                  className="flex items-center gap-2 text-sm text-red-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && !error && (
                <div
                  className="flex items-center gap-2 text-sm text-success-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              
              {helperText && !error && !success && (
                <p
                  className="text-sm text-neutral-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  {helperText}
                </p>
              )}
            </div>
          )}
        </React.Fragment>
      </div>
    )
  }
)

AnimatedTextarea.displayName = "AnimatedTextarea"

// Form Field Wrapper with Animation
interface AnimatedFieldProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedField({ children, className, delay = 0 }: AnimatedFieldProps) {
  return (
    <div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </div>
  )
}

// Success/Error Message Banner
interface MessageBannerProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onDismiss?: () => void
  className?: string
}

export function MessageBanner({ type, message, onDismiss, className }: MessageBannerProps) {
  const variants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const typeStyles = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      text: 'text-success-800',
      icon: <CheckCircle className="w-5 h-5" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200', 
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertCircle className="w-5 h-5" />
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <AlertCircle className="w-5 h-5" />
    }
  }

  const style = typeStyles[type]

  return (
    <div
      className={cn(
        "p-4 rounded-lg border flex items-center gap-3",
        style.bg,
        style.border,
        style.text,
        className
      )}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.3, type: "spring" }}
      >
        {style.icon}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}