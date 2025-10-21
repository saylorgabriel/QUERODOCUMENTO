'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Building2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { locations, type State, type City, type Notary } from '@/data/locations'

interface EmolumentState {
  state: string
  value3Years: number
  boletoFee: number
  lucroFee: number
  taxPercentage: number
  taxValue: number
  finalValue: number
}

interface LocationSelectorProps {
  selectedState: string | null
  selectedCity: string | null
  selectedNotary: string | null
  useAllNotaries: boolean
  onLocationChange: (location: {
    state: string | null
    city: string | null
    notary: string | null
    useAllNotaries: boolean
    statePrice?: number
  }) => void
}

export function LocationSelector({
  selectedState,
  selectedCity,
  selectedNotary,
  useAllNotaries,
  onLocationChange
}: LocationSelectorProps) {
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [notaryDropdownOpen, setNotaryDropdownOpen] = useState(false)
  const [emolumentStates, setEmolumentStates] = useState<EmolumentState[]>([])
  const [loadingEmoluments, setLoadingEmoluments] = useState(true)
  const [stateSearchQuery, setStateSearchQuery] = useState('')

  // Fetch emolument states from API
  useEffect(() => {
    const fetchEmoluments = async () => {
      try {
        const response = await fetch('/api/emoluments')
        if (response.ok) {
          const data = await response.json()
          setEmolumentStates(data.emoluments || [])
        }
      } catch (error) {
        console.error('Error fetching emoluments:', error)
      } finally {
        setLoadingEmoluments(false)
      }
    }

    fetchEmoluments()
  }, [])

  // Filter locations to only show states that have emolument data
  const availableStates = locations.filter(state =>
    emolumentStates.some(emol => emol.state === state.code)
  )

  // Filter states by search query
  const filteredStates = availableStates.filter(state => {
    const searchLower = stateSearchQuery.toLowerCase()
    return (
      state.name.toLowerCase().includes(searchLower) ||
      state.code.toLowerCase().includes(searchLower)
    )
  })

  const selectedStateData = locations.find(state => state.id === selectedState)
  const selectedCityData = selectedStateData?.cities.find(city => city.id === selectedCity)
  const selectedNotaryData = selectedCityData?.notaries.find(notary => notary.id === selectedNotary)

  const availableCities = selectedStateData?.cities || []
  const availableNotaries = selectedCityData?.notaries || []

  // Get emolument price for selected state
  const selectedStateEmolument = emolumentStates.find(emol =>
    emol.state === selectedStateData?.code
  )

  // Clear search when dropdown closes
  useEffect(() => {
    if (!stateDropdownOpen) {
      setStateSearchQuery('')
    }
  }, [stateDropdownOpen])

  // Reset city and notary when state changes
  useEffect(() => {
    if (selectedState && selectedCity) {
      const stateData = locations.find(state => state.id === selectedState)
      const cityExists = stateData?.cities.some(city => city.id === selectedCity)
      if (!cityExists) {
        onLocationChange({
          state: selectedState,
          city: null,
          notary: null,
          useAllNotaries: false
        })
      }
    }
  }, [selectedState, selectedCity, onLocationChange])

  // Reset notary when city changes
  useEffect(() => {
    if (selectedCity && selectedNotary) {
      const notaryExists = availableNotaries.some(notary => notary.id === selectedNotary)
      if (!notaryExists) {
        onLocationChange({
          state: selectedState,
          city: selectedCity,
          notary: null,
          useAllNotaries: false
        })
      }
    }
  }, [selectedCity, selectedNotary, availableNotaries, selectedState, onLocationChange])

  const handleStateSelect = (stateId: string) => {
    const stateData = locations.find(s => s.id === stateId)
    const emolument = emolumentStates.find(emol => emol.state === stateData?.code)

    onLocationChange({
      state: stateId,
      city: null,
      notary: null,
      useAllNotaries: false,
      statePrice: emolument?.finalValue || 89.90
    })
    setStateDropdownOpen(false)
    setStateSearchQuery('') // Clear search when selecting
  }

  const handleCitySelect = (cityId: string) => {
    onLocationChange({
      state: selectedState,
      city: cityId,
      notary: null,
      useAllNotaries: false
    })
    setCityDropdownOpen(false)
  }

  const handleNotarySelect = (notaryId: string) => {
    onLocationChange({
      state: selectedState,
      city: selectedCity,
      notary: notaryId,
      useAllNotaries: false
    })
    setNotaryDropdownOpen(false)
  }

  const handleAllNotariesToggle = () => {
    onLocationChange({
      state: selectedState,
      city: selectedCity,
      notary: null,
      useAllNotaries: !useAllNotaries
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Selecione a localização
        </h3>
        <p className="text-sm text-neutral-600">
          Escolha o estado, cidade e cartório para emissão da certidão
        </p>
      </div>

      {/* State Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          Estado *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 bg-white border-2 rounded-lg text-left transition-all duration-200",
              selectedState
                ? "border-primary-300 bg-primary-50/30"
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <MapPin className="w-5 h-5 text-neutral-500" />
            <div className="flex-1">
              <span className={cn(
                "block",
                selectedState ? "text-neutral-900 font-medium" : "text-neutral-500"
              )}>
                {selectedStateData ? selectedStateData.name : "Selecione o estado"}
              </span>
              {selectedStateData && (
                <span className="text-sm text-neutral-600">{selectedStateData.code}</span>
              )}
            </div>
            <ChevronDown className={cn(
              "w-5 h-5 transition-transform",
              stateDropdownOpen ? "rotate-180" : "rotate-0"
            )} />
          </button>
          
          {stateDropdownOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-neutral-200 sticky top-0 bg-white">
                <input
                  type="text"
                  value={stateSearchQuery}
                  onChange={(e) => setStateSearchQuery(e.target.value)}
                  placeholder="Buscar estado..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* States List */}
              <div className="max-h-80 overflow-y-auto">
                {loadingEmoluments ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-neutral-600 mt-2">Carregando estados...</p>
                  </div>
                ) : filteredStates.length > 0 ? (
                  filteredStates.map((state) => {
                    const emolument = emolumentStates.find(emol => emol.state === state.code)
                    return (
                      <button
                        key={state.id}
                        type="button"
                        onClick={() => handleStateSelect(state.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <span className="block font-medium text-neutral-900">{state.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">{state.code}</span>
                            {emolument && (
                              <span className="text-sm text-primary-600 font-medium">
                                • R$ {emolument.finalValue.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedState === state.id && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-neutral-600">
                    {stateSearchQuery ? 'Nenhum estado encontrado' : 'Nenhum estado disponível'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* City Selector */}
      {selectedState && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Cidade *
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 bg-white border-2 rounded-lg text-left transition-all duration-200",
                selectedCity
                  ? "border-primary-300 bg-primary-50/30"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <Building2 className="w-5 h-5 text-neutral-500" />
              <div className="flex-1">
                <span className={cn(
                  "block",
                  selectedCity ? "text-neutral-900 font-medium" : "text-neutral-500"
                )}>
                  {selectedCityData ? selectedCityData.name : "Selecione a cidade"}
                </span>
                {selectedCityData && (
                  <span className="text-sm text-neutral-600">
                    {availableNotaries.length} cartório(s) disponível(is)
                  </span>
                )}
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                cityDropdownOpen ? "rotate-180" : "rotate-0"
              )} />
            </button>
            
            {cityDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {availableCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="block font-medium text-neutral-900">{city.name}</span>
                      <span className="text-sm text-neutral-600">
                        {city.notaries.length} cartório(s) disponível(is)
                      </span>
                    </div>
                    {selectedCity === city.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notary Selection */}
      {selectedCity && (
        <div className="space-y-4">
          {/* All Notaries Option */}
          <div className="p-4 border border-neutral-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={useAllNotaries}
                  onChange={handleAllNotariesToggle}
                  className="sr-only"
                />
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  useAllNotaries
                    ? "bg-primary-600 border-primary-600"
                    : "border-neutral-300 hover:border-neutral-400"
                )}>
                  {useAllNotaries && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="font-medium text-neutral-900">
                  Consultar todos os cartórios
                </span>
                <p className="text-sm text-neutral-600 mt-1">
                  Recomendado: consulta todos os cartórios da cidade selecionada para garantir resultado completo
                </p>
                <p className="text-xs text-primary-600 mt-2 font-medium">
                  + Abrangente • Mesmo preço
                </p>
              </div>
            </label>
          </div>

          {/* Individual Notary Selector */}
          {!useAllNotaries && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Cartório específico
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotaryDropdownOpen(!notaryDropdownOpen)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 bg-white border-2 rounded-lg text-left transition-all duration-200",
                    selectedNotary
                      ? "border-primary-300 bg-primary-50/30"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <Building2 className="w-5 h-5 text-neutral-500" />
                  <div className="flex-1">
                    {selectedNotaryData ? (
                      <div>
                        <span className="block font-medium text-neutral-900">
                          {selectedNotaryData.name}
                        </span>
                        <span className="text-sm text-neutral-600">
                          {selectedNotaryData.address}
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-500">Selecione um cartório</span>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 transition-transform",
                    notaryDropdownOpen ? "rotate-180" : "rotate-0"
                  )} />
                </button>
                
                {notaryDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-80 overflow-auto">
                    {availableNotaries.map((notary) => (
                      <button
                        key={notary.id}
                        type="button"
                        onClick={() => handleNotarySelect(notary.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="block font-medium text-neutral-900">
                            {notary.name}
                          </span>
                          <span className="text-sm text-neutral-600 block mt-1">
                            {notary.address}
                          </span>
                          {notary.phone && (
                            <span className="text-xs text-neutral-500 block mt-1">
                              {notary.phone}
                            </span>
                          )}
                        </div>
                        {selectedNotary === notary.id && (
                          <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}