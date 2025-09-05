'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  steps: Array<{
    number: number
    title: string
    description?: string
  }>
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Mobile - Simplified version */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-neutral-600">
            Passo {currentStep} de {steps.length}
          </p>
          <p className="text-sm text-neutral-500">
            {Math.round((currentStep / steps.length) * 100)}%
          </p>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-gradient-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop - Full version */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle and Content */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                    currentStep > step.number
                      ? "bg-success-500 text-white"
                      : currentStep === step.number
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-200 text-neutral-500"
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.number
                        ? "text-neutral-900"
                        : "text-neutral-500"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-400 mt-1 max-w-[100px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 mt-[-2rem] transition-all duration-300",
                    currentStep > step.number
                      ? "bg-success-500"
                      : "bg-neutral-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}