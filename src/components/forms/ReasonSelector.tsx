'use client'

import React, { useState } from 'react'
import { ChevronDown, CheckCircle, FileText, Scale, Briefcase, User, Home, Building, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { certificateReasons } from '@/data/locations'

interface ReasonSelectorProps {
  selectedReason: string | null
  customReason: string
  onReasonChange: (reasonId: string | null, customReason?: string) => void
}

const reasonIcons = {
  judicial: Scale,
  credit: FileText,
  employment: Briefcase,
  business: Building,
  personal: User,
  property: Home,
  corporate: Building,
  other: HelpCircle
}

export function ReasonSelector({
  selectedReason,
  customReason,
  onReasonChange
}: ReasonSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(selectedReason === 'other')

  const selectedReasonData = certificateReasons.find(reason => reason.id === selectedReason)

  const handleReasonSelect = (reasonId: string) => {
    onReasonChange(reasonId)
    setDropdownOpen(false)
    setShowCustomInput(reasonId === 'other')
  }

  const handleCustomReasonChange = (value: string) => {
    onReasonChange('other', value)
  }

  return (
    <div className="space-y-6">
      {/* <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Motivo da solicitação
        </h3>
        <p className="text-sm text-neutral-600">
          Informe o motivo para emissão da certidão de protesto
        </p>
      </div> */}

      {/* Reason Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          Finalidade da certidão *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 bg-white border-2 rounded-lg text-left transition-all duration-200",
              selectedReason
                ? "border-primary-300 bg-primary-50/30"
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            {selectedReasonData ? (
              <>
                {React.createElement(reasonIcons[selectedReasonData.id as keyof typeof reasonIcons], {
                  className: "w-5 h-5 text-neutral-500"
                })}
                <div className="flex-1">
                  <span className="block font-medium text-neutral-900">
                    {selectedReasonData.label}
                  </span>
                  <span className="text-sm text-neutral-600">
                    {selectedReasonData.description}
                  </span>
                </div>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 text-neutral-500" />
                <div className="flex-1">
                  <span className="text-neutral-500">Selecione o motivo da solicitação</span>
                </div>
              </>
            )}
            <ChevronDown className={cn(
              "w-5 h-5 transition-transform",
              dropdownOpen ? "rotate-180" : "rotate-0"
            )} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-80 overflow-auto">
              {certificateReasons.map((reason) => {
                const Icon = reasonIcons[reason.id as keyof typeof reasonIcons]
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => handleReasonSelect(reason.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="block font-medium text-neutral-900">
                        {reason.label}
                      </span>
                      <span className="text-sm text-neutral-600 block mt-1">
                        {reason.description}
                      </span>
                    </div>
                    {selectedReason === reason.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Reason Input */}
      {showCustomInput && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <label className="block text-sm font-medium text-neutral-700">
            Especifique o motivo *
          </label>
          <textarea
            value={customReason}
            onChange={(e) => handleCustomReasonChange(e.target.value)}
            placeholder="Descreva detalhadamente o motivo para solicitação da certidão..."
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary-600 focus:outline-none resize-none transition-colors"
            rows={4}
            maxLength={500}
          />
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Máximo 500 caracteres</span>
            <span>{customReason.length}/500</span>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <h5 className="text-sm font-medium text-accent-900 mb-1">
              Informação importante
            </h5>
            <p className="text-xs text-accent-700 leading-relaxed">
              A certidão será emitida de acordo com o motivo informado. Certifique-se de que a finalidade está correta, pois alguns órgãos podem exigir motivos específicos. Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>

      {/* Popular Reasons Quick Select */}
      {!selectedReason && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">Motivos mais comuns:</p>
          <div className="grid grid-cols-2 gap-3">
            {certificateReasons.slice(0, 4).map((reason) => {
              const Icon = reasonIcons[reason.id as keyof typeof reasonIcons]
              return (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => handleReasonSelect(reason.id)}
                  className="p-3 border border-neutral-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-neutral-500 group-hover:text-primary-600" />
                    <span className="text-sm font-medium text-neutral-900 group-hover:text-primary-900">
                      {reason.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {reason.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}